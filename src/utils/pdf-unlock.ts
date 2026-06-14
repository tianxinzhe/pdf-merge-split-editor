/**
 * Remove owner-password restrictions from a PDF.
 *
 * Owner-lock PDFs have an empty user password but restrict copy/print/edit
 * via the /P permissions flag in the /Encrypt dictionary.
 *
 * Strategy: Use pdfjs to decrypt and render every page to canvas, then
 * rebuild the PDF from those images. This is the only reliable approach
 * because the content streams are genuinely encrypted; simply stripping
 * the /Encrypt marker produces a PDF with garbled/blank content.
 *
 * Binary patching (patchRemoveEncrypt) is still used in the export worker
 * where pdf-lib needs to load the file structure without encryption errors.
 */

import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import { pdfLoadingOptions } from './pdfjs-config'

/**
 * Remove owner lock by rendering every page via pdfjs (which properly
 * decrypts the streams) and rebuilding a clean, unrestricted PDF from
 * the rendered images.
 */
export async function unlockOwnerPassword(binary: ArrayBuffer): Promise<Uint8Array> {
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

  // Skip raw binary patching — it only strips the /Encrypt marker without
  // decrypting the content streams, producing blank pages for most real PDFs.
  // Always go through pdfjs rendering to properly decrypt content.
  return await fallbackRerender(binary)
}

/**
 * Patch the raw PDF bytes to remove the /Encrypt entry from the trailer.
 * Works directly on the byte array to avoid encoding corruption.
 */
export function patchRemoveEncrypt(original: Uint8Array): Uint8Array | null {
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
    await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise
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
