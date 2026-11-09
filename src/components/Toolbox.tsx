import { useCallback, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { pdfLoadingOptions } from '../utils/pdfjs-config'
import JSZip from 'jszip'
import { useI18n } from '../i18n'
import { ToolGuide } from './ToolGuide'

/* ───── PDF → Image ───── */
type DpiOption = 72 | 150 | 200 | 300 | 600
type ImageFormat = 'png' | 'jpeg'
type ExportMode = 'single' | 'stitch'

export function Toolbox() {
  const { t } = useI18n()

  /* pdf→image state */
  const [imgPdfFile, setImgPdfFile] = useState<{ name: string; binary: ArrayBuffer; pageCount: number } | null>(null)
  const [imgDragging, setImgDragging] = useState(false)
  const [dpi, setDpi] = useState<DpiOption>(300)
  const [imgFormat, setImgFormat] = useState<ImageFormat>('png')
  const [exportMode, setExportMode] = useState<ExportMode>('single')
  const [exporting, setExporting] = useState(false)
  const imgFileRef = useRef<HTMLInputElement>(null)

  /* ───── PDF → Image handlers ───── */
  const loadImgPdf = useCallback(async (f: File) => {
    const binary = await f.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ ...pdfLoadingOptions, data: binary.slice(0) }).promise
    setImgPdfFile({ name: f.name.replace(/\.pdf$/i, ''), binary, pageCount: pdf.numPages })
  }, [])

  const handleImgDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setImgDragging(false)
    const file = Array.from(e.dataTransfer.files).find(f => f.type === 'application/pdf')
    if (file) loadImgPdf(file)
  }, [loadImgPdf])

  const handleImgFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadImgPdf(file)
    e.target.value = ''
  }, [loadImgPdf])

  const renderPageToBlob = useCallback(async (
    pdfDoc: pdfjsLib.PDFDocumentProxy, pageNum: number, dpi: DpiOption, format: ImageFormat,
  ): Promise<Blob> => {
    const page = await pdfDoc.getPage(pageNum)
    const scale = dpi / 72
    const vp = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = vp.width; canvas.height = vp.height
    await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
    return new Promise(resolve => canvas.toBlob(b => resolve(b!), `image/${format === 'jpeg' ? 'jpeg' : 'png'}`, 0.95))
  }, [])

  const handleExportImages = useCallback(async () => {
    if (!imgPdfFile) return
    setExporting(true)
    try {
      const pdf = await pdfjsLib.getDocument({ ...pdfLoadingOptions, data: imgPdfFile.binary.slice(0) }).promise

      if (exportMode === 'single') {
        const zip = new JSZip()
        for (let i = 1; i <= pdf.numPages; i++) {
          const blob = await renderPageToBlob(pdf, i, dpi, imgFormat)
          zip.file(t.toolbox.pageFileName(imgPdfFile.name, i, imgFormat), blob)
        }
        const zipBytes = await zip.generateAsync({ type: 'uint8array' })
        const blob = new Blob([zipBytes as BlobPart], { type: 'application/zip' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = t.toolbox.imagesZipName(imgPdfFile.name); a.click()
        URL.revokeObjectURL(url)
      } else {
        const pages: { blob: Blob; width: number; height: number }[] = []
        let totalHeight = 0
        let maxWidth = 0
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const scale = dpi / 72
          const vp = page.getViewport({ scale })
          const blob = await renderPageToBlob(pdf, i, dpi, imgFormat)
          pages.push({ blob, width: vp.width, height: vp.height })
          totalHeight += vp.height
          if (vp.width > maxWidth) maxWidth = vp.width
        }
        const stitchCanvas = document.createElement('canvas')
        stitchCanvas.width = maxWidth; stitchCanvas.height = totalHeight
        const ctx = stitchCanvas.getContext('2d')!
        let y = 0
        for (const p of pages) {
          const img = await createImageBitmap(p.blob)
          const x = Math.round((maxWidth - img.width) / 2)
          ctx.drawImage(img, x, y)
          y += p.height
        }
        stitchCanvas.toBlob(b => {
          if (!b) return
          const url = URL.createObjectURL(b)
          const a = document.createElement('a')
          a.href = url; a.download = t.toolbox.longImageName(imgPdfFile.name, imgFormat); a.click()
          URL.revokeObjectURL(url)
        }, `image/${imgFormat === 'jpeg' ? 'jpeg' : 'png'}`, 0.95)
      }
    } catch (e) {
      alert(t.toolbox.exportFailed(e instanceof Error ? e.message : String(e)))
    } finally { setExporting(false) }
  }, [imgPdfFile, exportMode, dpi, imgFormat, renderPageToBlob, t])

  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto p-6">
      <div className="w-full max-w-2xl space-y-6">

        {/* ════════ PDF → Image ════════ */}
        <div className="bg-gray-900/60 rounded-2xl p-5 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">{t.toolbox.convertTitle}</h2>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setImgDragging(true) }}
            onDragLeave={() => setImgDragging(false)}
            onDrop={handleImgDrop}
            onClick={() => !imgPdfFile && imgFileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              imgDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
            } ${imgPdfFile ? 'border-green-600/50 bg-green-600/5' : ''}`}
          >
            {imgPdfFile ? (
              <div>
                <span className="text-2xl">📄</span>
                <p className="text-sm text-gray-200 mt-1">{imgPdfFile.name}.pdf</p>
                <p className="text-xs text-gray-400">{t.toolbox.pageCount(imgPdfFile.pageCount)}</p>
                <button onClick={() => setImgPdfFile(null)}
                  className="mt-2 text-xs text-gray-400 hover:text-red-400 cursor-pointer">{t.toolbox.changeFile}</button>
              </div>
            ) : (
              <div>
                <span className="text-3xl">🖼</span>
                <p className="text-sm text-gray-400 mt-2">{t.toolbox.dropPdf}</p>
              </div>
            )}
          </div>
          <input ref={imgFileRef} type="file" accept=".pdf" className="hidden" onChange={handleImgFileSelect} />

          {imgPdfFile && (
            <div className="mt-4 space-y-4">
              {/* DPI */}
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">{t.toolbox.dpi}</label>
                <div className="flex gap-1.5">
                  {([72, 150, 200, 300, 600] as DpiOption[]).map(d => (
                    <button key={d} onClick={() => setDpi(d)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        dpi === d ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}>{d}</button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {t.toolbox.dpiHints[([72, 150, 200, 300, 600] as DpiOption[]).indexOf(dpi)]}
                </p>
              </div>

              {/* Format + Export mode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">{t.toolbox.format}</label>
                  <div className="flex gap-1.5">
                    {(['png', 'jpeg'] as ImageFormat[]).map(f => (
                      <button key={f} onClick={() => setImgFormat(f)}
                        className={`flex-1 px-2 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          imgFormat === f ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}>{f.toUpperCase()}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">{t.toolbox.exportMode}</label>
                  <div className="flex gap-1.5">
                    <button onClick={() => setExportMode('single')}
                      className={`flex-1 px-2 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        exportMode === 'single' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}>{t.toolbox.single}</button>
                    <button onClick={() => setExportMode('stitch')}
                      className={`flex-1 px-2 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        exportMode === 'stitch' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}>{t.toolbox.longImage}</button>
                  </div>
                </div>
              </div>

              {/* Export button */}
              <button onClick={handleExportImages} disabled={exporting}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-blue-600/20">
                {exporting ? t.toolbox.exporting : exportMode === 'single'
                  ? t.toolbox.exportImages(imgPdfFile.pageCount, dpi, imgFormat.toUpperCase())
                  : t.toolbox.exportLong(dpi, imgFormat.toUpperCase())}
              </button>
            </div>
          )}
        </div>

        <ToolGuide copy={t.guides.toolbox} />
      </div>
    </div>
  )
}