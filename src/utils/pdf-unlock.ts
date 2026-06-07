/**
 * Remove owner-password restrictions from a PDF at the binary level.
 *
 * Owner-lock PDFs have an empty user password but restrict copy/print/edit
 * via the /P permissions flag in the /Encrypt dictionary.
 *
 * Strategy: Strip the /Encrypt reference from the trailer/XRef stream
 * so readers no longer see the file as encrypted. Since the user password
 * is empty, the content streams are decryptable — but most readers will
 * simply render them fine once the /Encrypt entry is gone, because they
 * attempt the empty-string password automatically.
 *
 * For cases where binary patching doesn't work (e.g. AES-256 encryption
 * where streams are truly encrypted), we fall back to re-rendering.
 */

import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import { pdfLoadingOptions } from './pdfjs-config'

/**
 * Try to remove owner lock by copying pages through pdfjs → pdf-lib pipeline
 * using pdfjs decryption + pdf-lib structural copy (no re-rendering).
 *
 * pdfjs-dist decrypts everything internally. We then use pdf-lib to load
 * the SAME bytes but with ignoreEncryption, copy pages to a clean doc.
 * The key insight: for owner-only encrypted files, pdf-lib CAN read the
 * streams if we first verify pdfjs can open it with empty password (confirming
 * it's truly owner-only), then we do a raw binary patch to neutralize encryption.
 */
export async function unlockOwnerPassword(binary: ArrayBuffer): Promise<Uint8Array> {
  const bytes = new Uint8Array(binary)

  // First, verify this is an owner-only lock (empty user password)
  try {
    await pdfjsLib.getDocument({
      ...pdfLoadingOptions,
      data: binary.slice(0),
      password: '',
    }).promise
  } catch {
    throw new Error('NOT_OWNER_ONLY')
  }

  // Attempt binary patch: remove /Encrypt from trailer
  const patched = patchRemoveEncrypt(bytes)
  if (patched) {
    // Verify the patched file loads correctly
    try {
      const doc = await PDFDocument.load(patched.buffer)
      // Quick sanity: check page count > 0
      if (doc.getPageCount() > 0) {
        return await doc.save()
      }
    } catch {
      // Patching didn't produce a valid PDF, fall through to fallback
    }
  }

  // Fallback: re-render at 1.5x scale (smaller than 2.5x, still readable)
  return await fallbackRerender(binary)
}

/**
 * Patch the raw PDF bytes to remove the /Encrypt entry from the trailer.
 * Works directly on the byte array to avoid encoding corruption.
 */
function patchRemoveEncrypt(original: Uint8Array): Uint8Array | null {
  // Decode as latin1 for pattern searching (1:1 byte mapping)
  const text = new TextDecoder('latin1').decode(original)

  // Find /Encrypt references: "/Encrypt N N R"
  const encryptPattern = /\/Encrypt\s+\d+\s+\d+\s+R/g
  const matches: { index: number; length: number }[] = []
  let match: RegExpExecArray | null
  while ((match = encryptPattern.exec(text)) !== null) {
    matches.push({ index: match.index, length: match[0].length })
  }

  if (matches.length === 0) return null

  // Clone the byte array and overwrite matched regions with spaces (0x20)
  const patched = new Uint8Array(original)
  for (const m of matches) {
    for (let i = m.index; i < m.index + m.length; i++) {
      patched[i] = 0x20 // space
    }
  }

  return patched
}

/**
 * Fallback: render via pdfjs-dist and rebuild as images.
 * Uses scale 1.5 and JPEG quality 0.85 for reasonable file size.
 */
async function fallbackRerender(binary: ArrayBuffer): Promise<Uint8Array> {
  const pdf = await pdfjsLib.getDocument({
    ...pdfLoadingOptions,
    data: binary.slice(0),
    password: '',
  }).promise

  const cleanDoc = await PDFDocument.create()
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const vp = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = vp.width; canvas.height = vp.height
    const ctx = canvas.getContext('2d')!
    await page.render({ canvasContext: ctx, viewport: vp }).promise
    const blob = await new Promise<Blob>(resolve =>
      canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.82)
    )
    const imgBytes = new Uint8Array(await blob.arrayBuffer())
    const img = await cleanDoc.embedJpg(imgBytes)
    // Use original page dimensions (in PDF points) not rendered pixel size
    const origVp = page.getViewport({ scale: 1 })
    const p = cleanDoc.addPage([origVp.width, origVp.height])
    p.drawImage(img, { x: 0, y: 0, width: origVp.width, height: origVp.height })
  }
  return await cleanDoc.save()
}
