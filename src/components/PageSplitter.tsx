import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { pdfLoadingOptions } from '../utils/pdfjs-config'
import type { SourceFile } from '../types'

interface SplitterState {
  sourceFile: SourceFile | null
  thumbnails: (string | null)[]
  totalPages: number
  mode: 'range' | 'scatter'
  rangeStart: number
  rangeEnd: number
  scatterInput: string
  previewStart: string | null
  previewEnd: string | null
  loading: boolean
}

function ThumbnailCell({ pageNum, thumbnail, onLoad, selected, onClick }: {
  pageNum: number
  thumbnail: string | null
  onLoad: (pageNum: number) => void
  selected: boolean
  onClick: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || thumbnail) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        onLoad(pageNum)
        observer.disconnect()
      }
    }, { rootMargin: '300px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [pageNum, thumbnail, onLoad])

  return (
    <div ref={ref}
      className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
        selected ? 'ring-2 ring-blue-500 shadow-md shadow-blue-500/20' : 'ring-1 ring-gray-700 opacity-60 hover:opacity-90'
      }`}
      onClick={onClick}
    >
      {thumbnail ? (
        <img src={thumbnail} alt={`Page ${pageNum}`} className="w-full h-auto" draggable={false} />
      ) : (
        <div className="aspect-[3/4] flex items-center justify-center bg-gray-800/50">
          <span className="text-xs text-gray-600">{pageNum}</span>
        </div>
      )}
      <span className="absolute bottom-0.5 right-1 text-[9px] text-white bg-black/60 px-1 rounded">
        {pageNum}
      </span>
    </div>
  )
}

export function PageSplitter() {
  const [state, setState] = useState<SplitterState>({
    sourceFile: null, thumbnails: [], totalPages: 0,
    mode: 'range', rangeStart: 1, rangeEnd: 1,
    scatterInput: '', previewStart: null, previewEnd: null, loading: false,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [exporting, setExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pdfDocRef = useRef<any>(null)
  const loadedThumbsRef = useRef<Set<number>>(new Set())

  const renderThumbnail = useCallback(async (pdf: any, pageNum: number): Promise<string> => {
    const page = await pdf.getPage(pageNum)
    const vp = page.getViewport({ scale: 0.3 })
    const canvas = document.createElement('canvas')
    canvas.width = vp.width; canvas.height = vp.height
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
    return canvas.toDataURL('image/jpeg', 0.6)
  }, [])

  const renderHighRes = useCallback(async (pageNum: number): Promise<string> => {
    const pdf = pdfDocRef.current
    if (!pdf) return ''
    const page = await pdf.getPage(pageNum)
    const vp = page.getViewport({ scale: 1.5 })
    const canvas = document.createElement('canvas')
    canvas.width = vp.width; canvas.height = vp.height
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
    return canvas.toDataURL('image/jpeg', 0.85)
  }, [])

  const loadThumbnail = useCallback(async (pageNum: number) => {
    if (loadedThumbsRef.current.has(pageNum)) return
    loadedThumbsRef.current.add(pageNum)
    const pdf = pdfDocRef.current
    if (!pdf) return
    const dataUrl = await renderThumbnail(pdf, pageNum)
    setState(s => {
      const thumbs = [...s.thumbnails]
      thumbs[pageNum - 1] = dataUrl
      return { ...s, thumbnails: thumbs }
    })
  }, [renderThumbnail])

  const loadPdf = useCallback(async (file: File) => {
    setState(s => ({ ...s, loading: true }))
    try {
      const binary = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ ...pdfLoadingOptions, data: binary.slice(0) }).promise
      pdfDocRef.current = pdf
      loadedThumbsRef.current = new Set()
      const total = pdf.numPages
      // Only render first page thumbnail immediately; rest are lazy-loaded
      const thumbs: (string | null)[] = new Array(total).fill(null)
      thumbs[0] = await renderThumbnail(pdf, 1)
      loadedThumbsRef.current.add(1)
      const sf: SourceFile = { id: `${Date.now()}`, name: file.name, binary, type: 'pdf' }
      const startPreview = await renderHighRes(1)
      const endPreview = total > 1 ? await renderHighRes(total) : startPreview
      setState({
        sourceFile: sf, thumbnails: thumbs, totalPages: total,
        mode: 'range', rangeStart: 1, rangeEnd: total,
        scatterInput: '', previewStart: startPreview, previewEnd: endPreview, loading: false,
      })
    } catch (e) {
      alert('无法加载 PDF: ' + (e instanceof Error ? e.message : String(e)))
      setState(s => ({ ...s, loading: false }))
    }
  }, [renderThumbnail, renderHighRes])

  const updateRangePreview = useCallback(async (start: number, end: number) => {
    const startImg = await renderHighRes(start)
    const endImg = start === end ? startImg : await renderHighRes(end)
    setState(s => ({ ...s, previewStart: startImg, previewEnd: endImg }))
  }, [renderHighRes])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = Array.from(e.dataTransfer.files).find(f => f.type === 'application/pdf')
    if (file) loadPdf(file)
  }, [loadPdf])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadPdf(file)
    e.target.value = ''
  }, [loadPdf])

  const handleExport = useCallback(async () => {
    if (!state.sourceFile || !pdfDocRef.current) return
    setExporting(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      let srcBin: ArrayBuffer | Uint8Array = state.sourceFile.binary
      try {
        const { unlockOwnerPassword } = await import('../utils/pdf-unlock')
        srcBin = await unlockOwnerPassword(state.sourceFile.binary)
      } catch {
        // Not owner-only or unlock failed; fall back to original binary
      }
      const srcDoc = await PDFDocument.load(srcBin, { ignoreEncryption: true })
      const newDoc = await PDFDocument.create()
      let indices: number[] = []
      if (state.mode === 'range') {
        for (let i = state.rangeStart - 1; i < state.rangeEnd; i++) indices.push(i)
      } else {
        indices = state.scatterInput.split(/[,，\s]+/)
          .map(s => parseInt(s.trim()) - 1)
          .filter(n => !isNaN(n) && n >= 0 && n < state.totalPages)
      }
      if (indices.length === 0) { setExporting(false); return }
      const copied = await newDoc.copyPages(srcDoc, indices)
      copied.forEach(p => newDoc.addPage(p))
      const bytes = await newDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `split_${state.sourceFile.name}`; a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('导出失败: ' + (e instanceof Error ? e.message : String(e)))
    } finally { setExporting(false) }
  }, [state])

  const clearFile = useCallback(() => {
    pdfDocRef.current = null
    loadedThumbsRef.current = new Set()
    setState({
      sourceFile: null, thumbnails: [], totalPages: 0,
      mode: 'range', rangeStart: 1, rangeEnd: 1,
      scatterInput: '', previewStart: null, previewEnd: null, loading: false,
    })
  }, [])

  const toggleScatterPage = useCallback((pageNum: number) => {
    setState(s => {
      const pages = s.scatterInput.split(/[,，\s]+/).map(p => p.trim()).filter(Boolean)
      const strPage = String(pageNum)
      const idx = pages.indexOf(strPage)
      if (idx >= 0) pages.splice(idx, 1)
      else pages.push(strPage)
      return { ...s, scatterInput: pages.join(', ') }
    })
  }, [])

  // --- No file loaded ---
  if (!state.sourceFile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-96 h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
          }`}
        >
          {state.loading ? (
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-4xl mb-3">✂️</span>
              <p className="text-sm text-gray-400">拖入 PDF 开始拆分</p>
              <p className="text-xs text-gray-600 mt-1">或点击选择文件</p>
            </>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
      </div>
    )
  }

  // --- Main dual-panel layout ---
  return (
    <div className="flex-1 flex overflow-hidden">
      {/* 左半舱 - 源文件全景缩略图网格 */}
      <div className="w-1/2 border-r border-gray-800 flex flex-col overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between shrink-0">
          <span className="text-xs font-medium text-gray-300">源文件全景 · {state.totalPages} 页</span>
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">更换文件</button>
            <button onClick={clearFile}
              className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer">关闭</button>
          </div>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-4 gap-2">
            {state.thumbnails.map((thumb, i) => {
              const pageNum = i + 1
              const selected = state.mode === 'range'
                ? pageNum >= state.rangeStart && pageNum <= state.rangeEnd
                : state.scatterInput.split(/[,，\s]+/).map(s => parseInt(s.trim())).includes(pageNum)
              return (
                <ThumbnailCell key={i}
                  pageNum={pageNum}
                  thumbnail={thumb}
                  onLoad={loadThumbnail}
                  selected={selected}
                  onClick={() => {
                    if (state.mode === 'range') {
                      setState(s => ({ ...s, rangeStart: pageNum, rangeEnd: pageNum }))
                      updateRangePreview(pageNum, pageNum)
                    } else {
                      toggleScatterPage(pageNum)
                    }
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* 右半舱 - 目标监视 */}
      <RightPanel state={state} setState={setState} exporting={exporting}
        updateRangePreview={updateRangePreview} handleExport={handleExport}
        loadThumbnail={loadThumbnail} />
    </div>
  )
}

/* Right panel extracted to keep main component readable */
function RightPanel({ state, setState, exporting, updateRangePreview, handleExport, loadThumbnail }: {
  state: SplitterState
  setState: Dispatch<SetStateAction<SplitterState>>
  exporting: boolean
  updateRangePreview: (s: number, e: number) => void
  handleExport: () => void
  loadThumbnail: (pageNum: number) => void
}) {
  const scatterPages = state.scatterInput.split(/[,，\s]+/)
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n) && n >= 1 && n <= state.totalPages)

  return (
    <div className="w-1/2 flex flex-col overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="splitMode" checked={state.mode === 'range'}
              onChange={() => setState(s => ({ ...s, mode: 'range' }))}
              className="accent-blue-500" />
            <span className="text-xs text-gray-300">范围区间</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="splitMode" checked={state.mode === 'scatter'}
              onChange={() => setState(s => ({ ...s, mode: 'scatter' }))}
              className="accent-blue-500" />
            <span className="text-xs text-gray-300">离散多选</span>
          </label>
        </div>
        <div className="mt-2">
          {state.mode === 'range' ? (
            <div className="flex items-center gap-2">
              <input type="number" min={1} max={state.totalPages} value={state.rangeStart}
                onChange={e => {
                  const v = Math.max(1, parseInt(e.target.value) || 1)
                  setState(s => ({ ...s, rangeStart: v }))
                  updateRangePreview(v, state.rangeEnd)
                }}
                className="w-16 px-2 py-1 rounded-md bg-gray-800 border border-gray-700 text-xs text-center text-gray-200 focus:border-blue-500 focus:outline-none" />
              <span className="text-xs text-gray-500">至</span>
              <input type="number" min={1} max={state.totalPages} value={state.rangeEnd}
                onChange={e => {
                  const v = Math.min(state.totalPages, parseInt(e.target.value) || state.totalPages)
                  setState(s => ({ ...s, rangeEnd: v }))
                  updateRangePreview(state.rangeStart, v)
                }}
                className="w-16 px-2 py-1 rounded-md bg-gray-800 border border-gray-700 text-xs text-center text-gray-200 focus:border-blue-500 focus:outline-none" />
              <span className="text-xs text-gray-500">共 {Math.max(0, state.rangeEnd - state.rangeStart + 1)} 页</span>
            </div>
          ) : (
            <input type="text" value={state.scatterInput}
              onChange={e => setState(s => ({ ...s, scatterInput: e.target.value }))}
              placeholder="点击左侧缩略图选择，或输入页码如: 3, 15, 88"
              className="w-full px-2 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none" />
          )}
        </div>
      </div>

      {/* 监视画布 */}
      <div className="flex-1 overflow-y-auto p-4">
        {state.mode === 'range' ? (
          <div className="flex flex-col items-center gap-3">
            {state.previewStart && (
              <div className="relative max-w-xs">
                <img src={state.previewStart} alt="起始页" className="w-full rounded-lg ring-1 ring-gray-700" />
                <span className="absolute top-1 left-2 text-xs bg-blue-600 text-white px-1.5 rounded">
                  第 {state.rangeStart} 页（起）
                </span>
              </div>
            )}
            {state.rangeEnd - state.rangeStart > 1 && (
              <div className="border-l-2 border-dashed border-gray-600 h-8 flex items-center pl-3">
                <span className="text-xs text-gray-500">... 中间 {state.rangeEnd - state.rangeStart - 1} 页略过 ...</span>
              </div>
            )}
            {state.rangeEnd > state.rangeStart && state.previewEnd && (
              <div className="relative max-w-xs">
                <img src={state.previewEnd} alt="终止页" className="w-full rounded-lg ring-1 ring-gray-700" />
                <span className="absolute top-1 left-2 text-xs bg-emerald-600 text-white px-1.5 rounded">
                  第 {state.rangeEnd} 页（止）
                </span>
              </div>
            )}
          </div>
        ) : scatterPages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {scatterPages.map(p => (
              <div key={p} className="relative">
                {state.thumbnails[p - 1] ? (
                  <img src={state.thumbnails[p - 1]!} alt={`第 ${p} 页`}
                    className="w-full rounded-lg ring-1 ring-gray-700" />
                ) : (
                  <div className="aspect-[3/4] rounded-lg ring-1 ring-gray-700 bg-gray-800/50 flex items-center justify-center">
                    <span className="text-xs text-gray-600">加载中...</span>
                  </div>
                )}
                <span className="absolute top-1 left-2 text-xs bg-blue-600 text-white px-1.5 rounded">
                  第 {p} 页
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 text-xs">
            <p>离散抽页模式</p>
            <p className="mt-1">点击左侧缩略图选择要拆分的页面</p>
          </div>
        )}
      </div>

      {/* 底部导出按钮 */}
      <div className="px-4 py-3 border-t border-gray-800 shrink-0">
        <button onClick={handleExport} disabled={exporting}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-blue-600/20">
          {exporting ? '导出中...' : '🚀 确认无误，闪电导出新 PDF'}
        </button>
      </div>
    </div>
  )
}
