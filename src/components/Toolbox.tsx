import { useCallback, useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { pdfLoadingOptions } from '../utils/pdfjs-config'
import { unlockOwnerPassword } from '../utils/pdf-unlock'
import JSZip from 'jszip'
import { useI18n } from '../i18n'

/* ───── Password unlock (kept from PasswordHub) ───── */
interface PasswordFile {
  id: string; name: string; binary: ArrayBuffer
  status: 'pending' | 'done' | 'error'; error?: string
}

/* ───── PDF → Image ───── */
type DpiOption = 72 | 150 | 200 | 300 | 600
type ImageFormat = 'png' | 'jpeg'
type ExportMode = 'single' | 'stitch'

export function Toolbox() {
  const { t } = useI18n()
  /* password unlock state */
  const [pwFiles, setPwFiles] = useState<PasswordFile[]>([])
  const [pwMode, setPwMode] = useState<'owner' | 'user'>('owner')
  const [pwDragging, setPwDragging] = useState(false)
  const [pwPrompt, setPwPrompt] = useState<{ fileId: string; fileName: string } | null>(null)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwProcessing, setPwProcessing] = useState(false)
  const pwInputRef = useRef<HTMLInputElement>(null)

  /* pdf→image state */
  const [imgPdfFile, setImgPdfFile] = useState<{ name: string; binary: ArrayBuffer; pageCount: number } | null>(null)
  const [imgDragging, setImgDragging] = useState(false)
  const [dpi, setDpi] = useState<DpiOption>(300)
  const [imgFormat, setImgFormat] = useState<ImageFormat>('png')
  const [exportMode, setExportMode] = useState<ExportMode>('single')
  const [exporting, setExporting] = useState(false)
  const imgFileRef = useRef<HTMLInputElement>(null)

  /* ───── Password handlers (identical to before) ───── */
  const addPwFiles = useCallback(async (inputFiles: File[]) => {
    const items: PasswordFile[] = []
    for (const f of inputFiles) {
      if (f.type !== 'application/pdf') continue
      const binary = await f.arrayBuffer()
      items.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, name: f.name, binary, status: 'pending' })
    }
    setPwFiles(prev => [...prev, ...items])
  }, [])

  const handlePwDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setPwDragging(false)
    const inputFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf')
    if (inputFiles.length > 0) addPwFiles(inputFiles)
  }, [addPwFiles])

  const handlePwFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = Array.from(e.target.files || [])
    if (inputFiles.length > 0) addPwFiles(inputFiles)
    e.target.value = ''
  }, [addPwFiles])

  const removeOwnerLock = useCallback(async (file: PasswordFile) => {
    try {
      const bytes = await unlockOwnerPassword(file.binary)
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `unlocked_${file.name}`; a.click()
      URL.revokeObjectURL(url)
      setPwFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'done' as const } : f))
    } catch (e) {
      setPwFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'error' as const, error: (e instanceof Error ? e.message : String(e)) } : f))
    }
  }, [])

  const handlePwProcess = useCallback(async () => {
    if (pwFiles.length === 0) return
    setPwProcessing(true)
    if (pwMode === 'owner') {
      for (const file of pwFiles.filter(f => f.status === 'pending')) await removeOwnerLock(file)
    } else {
      const pending = pwFiles.find(f => f.status === 'pending')
      if (pending) setPwPrompt({ fileId: pending.id, fileName: pending.name })
    }
    setPwProcessing(false)
  }, [pwFiles, pwMode, removeOwnerLock])

  const handlePwConfirm = useCallback(async () => {
    if (!pwPrompt || !pwInput) return
    setPwError('')
    const file = pwFiles.find(f => f.id === pwPrompt.fileId)
    if (!file) return
    try {
      const pdf = await pdfjsLib.getDocument({ ...pdfLoadingOptions, data: file.binary.slice(0), password: pwInput }).promise
      const newDoc = await PDFDocument.create()
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const vp = page.getViewport({ scale: 2.5 })
        const canvas = document.createElement('canvas')
        canvas.width = vp.width; canvas.height = vp.height
        await page.render({ canvas, canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92))
        const imgBytes = new Uint8Array(await blob.arrayBuffer())
        const img = await newDoc.embedJpg(imgBytes)
        const p = newDoc.addPage([vp.width, vp.height])
        p.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height })
      }
      const bytes = await newDoc.save()
      const downloadBlob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(downloadBlob)
      const a = document.createElement('a')
      a.href = url; a.download = `decrypted_${file.name}`; a.click()
      URL.revokeObjectURL(url)
      setPwFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'done' as const } : f))
      setPwPrompt(null); setPwInput('')
    } catch {
      setPwError(t.toolbox.wrongPassword)
    }
  }, [pwPrompt, pwInput, pwFiles, t])

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

        {/* ════════ Password unlock (unchanged) ════════ */}
        <div className="bg-gray-900/60 rounded-2xl p-5 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">{t.toolbox.unlockTitle}</h2>

          <div className="space-y-2 mb-4">
            <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              pwMode === 'owner' ? 'bg-blue-600/10 border border-blue-500/40' : 'border border-gray-700/50 hover:bg-gray-800/50'
            }`}>
              <input type="radio" name="pwMode" checked={pwMode === 'owner'}
                onChange={() => setPwMode('owner')} className="accent-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-200">{t.toolbox.ownerTitle}</p>
                <p className="text-sm text-gray-400 mt-0.5">{t.toolbox.ownerDesc}</p>
              </div>
            </label>
            <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              pwMode === 'user' ? 'bg-blue-600/10 border border-blue-500/40' : 'border border-gray-700/50 hover:bg-gray-800/50'
            }`}>
              <input type="radio" name="pwMode" checked={pwMode === 'user'}
                onChange={() => setPwMode('user')} className="accent-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-200">{t.toolbox.userTitle}</p>
                <p className="text-sm text-gray-400 mt-0.5">{t.toolbox.userDesc}</p>
              </div>
            </label>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setPwDragging(true) }}
            onDragLeave={() => setPwDragging(false)}
            onDrop={handlePwDrop}
            onClick={() => pwFiles.length === 0 && pwInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
              pwDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
            } ${pwFiles.length === 0 ? 'cursor-pointer' : ''}`}
          >
            {pwFiles.length === 0 ? (
              <p className="text-sm text-gray-400">{t.toolbox.dropEncrypted}</p>
            ) : (
              <div className="space-y-1.5 text-left">
                {pwFiles.map(f => (
                  <div key={f.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60">
                    <span className="text-sm">{f.status === 'done' ? '✅' : f.status === 'error' ? '❌' : '📄'}</span>
                    <span className="text-xs text-gray-300 truncate flex-1">{f.name}</span>
                    {f.status === 'error' && <span className="text-xs text-red-400">{f.error}</span>}
                    <button onClick={() => setPwFiles(prev => prev.filter(x => x.id !== f.id))}
                      className="text-gray-400 hover:text-red-400 text-xs cursor-pointer">✕</button>
                  </div>
                ))}
                <button onClick={() => pwInputRef.current?.click()}
                  className="w-full py-1.5 text-xs text-gray-400 hover:text-gray-300 cursor-pointer">{t.toolbox.addMore}</button>
              </div>
            )}
          </div>
          <input ref={pwInputRef} type="file" accept=".pdf" multiple onChange={handlePwFileSelect} className="hidden" />

          {pwFiles.length > 0 && (
            <button onClick={handlePwProcess} disabled={pwProcessing || pwFiles.every(f => f.status === 'done')}
              className="w-full mt-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-emerald-600/20">
              {pwProcessing ? t.toolbox.processing : pwMode === 'owner' ? t.toolbox.unlockOwner : t.toolbox.unlockUser}
            </button>
          )}
        </div>
      </div>

      {/* Password prompt overlay */}
      {pwPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 space-y-4">
            <p className="text-sm text-gray-200">{t.toolbox.detected(pwPrompt.fileName)}</p>
            <p className="text-xs text-gray-400">{t.toolbox.enterPassword}</p>
            <input type="password" value={pwInput} onChange={e => setPwInput(e.target.value)}
              placeholder={t.toolbox.passwordPlaceholder}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && handlePwConfirm()} autoFocus />
            {pwError && <p className="text-xs text-red-400">{pwError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setPwPrompt(null); setPwInput(''); setPwError('') }}
                className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 cursor-pointer">{t.toolbox.cancel}</button>
              <button onClick={handlePwConfirm}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium cursor-pointer">{t.toolbox.confirm}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
