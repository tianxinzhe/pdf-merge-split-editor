/**
 * Remove password/permission protection from a PDF.
 *
 * Primary strategy: let @libpdf/core decrypt the document in place and save it
 * without an /Encrypt dictionary. This preserves text, vectors and bookmarks.
 *
 * Fallback: if the library cannot parse the encryption, render every page via
 * pdfjs and rebuild the PDF from images (loses the text layer).
 */

import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument } from 'pdf-lib'
import { pdfLoadingOptions } from './pdfjs-config'

async function losslessUnlock(binary: ArrayBuffer, password: string): Promise<Uint8Array> {
  const { PDF } = await import('@libpdf/core')
  const pdf = await PDF.load(new Uint8Array(binary), { credentials: password })
  if (!pdf.isEncrypted) return new Uint8Array(binary)
  // The library can load an encrypted file with a wrong password but leaves it
  // unauthenticated. Removing protection then would produce undecryptable content.
  if (!pdf.isAuthenticated) throw new Error('WRONG_PASSWORD')
  pdf.removeProtection({ ignorePermissions: true })
  return await pdf.save()
}

/**
 * Remove owner lock while keeping the original content streams.
 * Falls back to the pdfjs raster path only for unsupported encryption.
 */
export async function unlockOwnerPassword(binary: ArrayBuffer): Promise<Uint8Array> {
  try {
    return await losslessUnlock(binary, '')
  } catch {
    // Owner-only locks have an empty user password; if even that fails the
    // file likely needs a real open password. The raster path distinguishes
    // that case by throwing as well.
    try {
      return await fallbackRerender(binary, '')
    } catch {
      throw new Error('NOT_OWNER_ONLY')
    }
  }
}

/**
 * Remove a user (open) password while preserving the text layer.
 * The caller must supply the current password.
 */
export async function unlockUserPassword(binary: ArrayBuffer, password: string): Promise<Uint8Array> {
  try {
    return await losslessUnlock(binary, password)
  } catch {
    return await fallbackRerender(binary, password)
  }
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
 * Uses scale 1.5 and JPEG quality 0.82, and only when @libpdf/core cannot
 * handle the encryption.
 */
async function fallbackRerender(binary: ArrayBuffer, password: string): Promise<Uint8Array> {
  const pdf = await pdfjsLib.getDocument({
    ...pdfLoadingOptions,
    data: binary.slice(0),
    password,
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
