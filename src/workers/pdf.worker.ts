import { PDFDocument, degrees, rgb } from 'pdf-lib'
import type { WorkerAction } from '../types'

const sourceFileStore = new Map<string, ArrayBuffer>()

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64.split(',')[1])
  const buf = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i)
  return buf
}

function getPos(
  position: string,
  pw: number,
  ph: number,
  iw: number,
  ih: number,
): { x: number; y: number } {
  const m = 40
  const cx = (pw - iw) / 2
  const cy = (ph - ih) / 2
  switch (position) {
    case 'tl': return { x: m, y: ph - ih - m }
    case 'tc': return { x: cx, y: ph - ih - m }
    case 'tr': return { x: pw - iw - m, y: ph - ih - m }
    case 'ml': return { x: m, y: cy }
    case 'mc': return { x: cx, y: cy }
    case 'mr': return { x: pw - iw - m, y: cy }
    case 'bl': return { x: m, y: m }
    case 'bc': return { x: cx, y: m }
    case 'br': return { x: pw - iw - m, y: m }
    case 'center': return { x: cx, y: cy }
    default: return { x: cx, y: cy }
  }
}

self.onmessage = async (e: MessageEvent<WorkerAction>) => {
  const action = e.data
  try {
    switch (action.type) {
      case 'LOAD_PDF': {
        const { id, binary } = action.payload
        sourceFileStore.set(id, binary)
        const pdfDoc = await PDFDocument.load(binary, { ignoreEncryption: true })
        const pages = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => ({ index: i }))
        self.postMessage({ type: 'PDF_LOADED', payload: { sourceFileId: id, pages } })
        break
      }

      case 'EXPORT_PDF': {
        const { pages, sourceId } = action.payload as { pages: any[]; sourceId: string }
        const sourceBinary = sourceFileStore.get(sourceId)
        if (!sourceBinary) throw new Error('Source file not found')
        const srcDoc = await PDFDocument.load(sourceBinary, { ignoreEncryption: true })
        const outDoc = await PDFDocument.create()
        const activePages = pages.filter(p => !p.deleted)

        for (const page of activePages) {
          const [copied] = await outDoc.copyPages(srcDoc, [page.originalPageIndex])
          let rot = copied.getRotation().angle + page.rotation
          if (rot >= 360) rot -= 360
          copied.setRotation(degrees(rot))

          if (page.redactions?.length > 0) {
            const { width, height } = copied.getSize()
            for (const r of page.redactions) {
              const pdfX = r.x * (width / r.viewW)
              const pdfY = (r.viewH - r.y - r.h) * (height / r.viewH)
              copied.drawRectangle({
                x: pdfX, y: pdfY,
                width: r.w * (width / r.viewW),
                height: r.h * (height / r.viewH),
                color: rgb(0, 0, 0), borderWidth: 0,
              })
            }
          }

          if (page.watermarks?.length > 0) {
            const { width, height } = copied.getSize()
            for (const wm of page.watermarks) {
              const srcData = wm.imageData || wm.pngData
              if (!srcData) continue
              try {
                const imgBytes = b64ToBytes(srcData)
                const wmImg = await outDoc.embedPng(imgBytes)
                if (wm.position === 'full') {
                  copied.drawImage(wmImg, {
                    x: 0, y: 0,
                    width: width,
                    height: height,
                  })
                } else {
                  const pos = getPos(wm.position || 'center', width, height, wmImg.width, wmImg.height)
                  copied.drawImage(wmImg, {
                    x: pos.x, y: pos.y,
                    width: wmImg.width, height: wmImg.height,
                  })
                }
              } catch (e) {
                self.postMessage({ type: 'ERROR', payload: { message: `水印嵌入失败: ${e}` } })
              }
            }
          }

          outDoc.addPage(copied)
        }

        const bytes = await outDoc.save()
        self.postMessage({ type: 'EXPORT_RESULT', payload: { bytes, name: 'export.pdf' } }, { transfer: [bytes.buffer] })
        break
      }

      case 'SPLIT_PDF': {
        const { pageIds, sourceId } = action.payload as { pageIds: string[]; sourceId: string }
        const sourceBinary = sourceFileStore.get(sourceId)
        if (!sourceBinary) throw new Error('Source file not found')
        const srcDoc = await PDFDocument.load(sourceBinary, { ignoreEncryption: true })
        const outDoc = await PDFDocument.create()
        const indices = pageIds.map(id => parseInt(id.split('-')[1] ?? id.split('-').pop()!))
        for (const idx of indices) {
          const [copied] = await outDoc.copyPages(srcDoc, [idx])
          outDoc.addPage(copied)
        }
        const bytes = await outDoc.save()
        self.postMessage({ type: 'EXPORT_RESULT', payload: { bytes, name: 'split.pdf' } }, { transfer: [bytes.buffer] })
        break
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    self.postMessage({ type: 'ERROR', payload: { message } })
  }
}
