import { useCallback, useEffect, useRef, useState } from 'react'
import { CenterPanel } from './CenterPanel'
import { ToolDrawer } from './ToolDrawer'
import { PageThumbnails } from './PageThumbnails'
import { PasswordDialog } from './PasswordDialog'
import { usePDFState } from '../hooks/usePDFState'
import { renderPagePreview } from '../utils/pdf-render'
import { searchPdfText } from '../utils/pdf-search'
import { pdfLoadingOptions } from '../utils/pdfjs-config'
import { isEditableTarget } from '../utils/keyboard'
import type { WorkerAction, WorkerResponse, SourceFile, WatermarkDraft } from '../types'
import * as pdfjsLib from 'pdfjs-dist'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface EditorStudioProps {
  /** Optional: pre-loaded file binary from Merger tab */
  injectedFile?: { name: string; binary: ArrayBuffer } | null
  onInjectedFileConsumed?: () => void
}

export function EditorStudio({ injectedFile, onInjectedFileConsumed }: EditorStudioProps) {
  const { state, sourceFile, loadFileInner, clearFile, rotatePage, deletePage, movePage, setPreviewUrl,
    addRedaction, removeRedaction, clearRedactions, removeWatermark,
    setCurrentPage,
    setSearchQuery, setSearchResults, undo, redo, jumpToHistory, getHistory } = usePDFState()

  const renderQueue = useRef<Set<number>>(new Set())
  const [passwordDialog, setPasswordDialog] = useState<{ fileId: string; fileName: string; error?: string } | null>(null)
  const [isRedacting, setIsRedacting] = useState(false)
  const [watermarkDraft, setWatermarkDraft] = useState<WatermarkDraft | null>(null)
  const [thumbUrls, setThumbUrls] = useState<(string | undefined)[]>([])
  const loadedThumbsRef = useRef<Set<number>>(new Set())

  // Responsive side panels: collapse them before the canvas gets too narrow.
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth)
  const [thumbnailsOverride, setThumbnailsOverride] = useState<boolean | null>(null)
  const [panelOverride, setPanelOverride] = useState<boolean | null>(null)
  const autoCollapseThumbnails = viewportWidth < 1024
  const autoCollapsePanel = viewportWidth < 900
  const thumbnailsCollapsed = thumbnailsOverride ?? autoCollapseThumbnails
  const panelCollapsed = panelOverride ?? autoCollapsePanel

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Forget manual toggles when a breakpoint is crossed so the auto state applies again.
  const prevAutoThumbnails = useRef(autoCollapseThumbnails)
  const prevAutoPanel = useRef(autoCollapsePanel)
  useEffect(() => {
    if (prevAutoThumbnails.current !== autoCollapseThumbnails) {
      prevAutoThumbnails.current = autoCollapseThumbnails
      setThumbnailsOverride(null)
    }
  }, [autoCollapseThumbnails])
  useEffect(() => {
    if (prevAutoPanel.current !== autoCollapsePanel) {
      prevAutoPanel.current = autoCollapsePanel
      setPanelOverride(null)
    }
  }, [autoCollapsePanel])

  // Load a low-res thumbnail for the left panel (separate from center preview)
  const loadThumbnail = useCallback(async (pageIndex: number) => {
    if (loadedThumbsRef.current.has(pageIndex)) return
    const page = state.pages[pageIndex]
    const sf = sourceFile
    if (!page || !sf || sf.type !== 'pdf') return
    loadedThumbsRef.current.add(pageIndex)
    try {
      const url = await renderPagePreview(sf.binary, page.originalPageIndex, 0.4)
      setThumbUrls(prev => { const n = [...prev]; n[pageIndex] = url; return n })
    } catch { /* ignore */ }
  }, [state.pages, sourceFile])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const workerRef = useRef<Worker | null>(null)

  const handleWorkerMessage = useCallback((response: WorkerResponse) => {
    switch (response.type) {
      case 'PDF_LOADED': {
        const sf = lastPdfFileRef.current
        if (sf) loadFileInner(sf, response.payload.pages as Array<{ index: number }>)
        break
      }
      case 'EXPORT_RESULT': {
        const blob = new Blob([response.payload.bytes as BlobPart], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = response.payload.name as string; a.click()
        URL.revokeObjectURL(url)
        break
      }
      case 'ERROR': {
        const msg = response.payload.message as string
        if (msg.toLowerCase().includes('encrypt') || msg.toLowerCase().includes('password')) {
          const sf = lastPdfFileRef.current
          if (sf) setPasswordDialog({ fileId: sf.id, fileName: sf.name })
        } else {
          alert('操作失败: ' + msg)
        }
        break
      }
    }
  }, [loadFileInner])

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), { type: 'module' })
      workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => handleWorkerMessage(e.data)
    }
    return workerRef.current
  }, [handleWorkerMessage])

  const postAction = useCallback((action: WorkerAction) => getWorker().postMessage(action), [getWorker])
  const registerSource = useCallback((id: string, binary: ArrayBuffer) => {
    getWorker().postMessage({ type: 'REGISTER_SOURCE', payload: { id, binary } }, [binary])
  }, [getWorker])

  const lastPdfFileRef = useRef<SourceFile | null>(null)

  // Handle injected file from Merger tab
  useEffect(() => {
    if (injectedFile) {
      const id = generateId()
      const sf: SourceFile = { id, name: injectedFile.name, binary: injectedFile.binary, type: 'pdf' }
      lastPdfFileRef.current = sf
      registerSource(id, injectedFile.binary.slice(0))
      postAction({ type: 'LOAD_PDF', payload: { id, name: injectedFile.name, binary: injectedFile.binary } })
      onInjectedFileConsumed?.()
    }
  }, [injectedFile, registerSource, postAction, onInjectedFileConsumed])

  const handleFileDrop = useCallback(async (files: File[]) => {
    for (const file of files) {
      const binary = await file.arrayBuffer()
      const id = generateId()
      const type = file.type === 'application/pdf' ? 'pdf' : 'image'
      const sf: SourceFile = { id, name: file.name, binary, type }
      lastPdfFileRef.current = sf
      registerSource(id, binary.slice(0))
      if (type === 'pdf') {
        postAction({ type: 'LOAD_PDF', payload: { id, name: file.name, binary } })
      }
    }
  }, [registerSource, postAction])

  const handlePasswordSubmit = useCallback(async (password: string) => {
    if (!passwordDialog) return
    const sf = lastPdfFileRef.current
    if (!sf) return
    try {
      const pdf = await pdfjsLib.getDocument({
        ...pdfLoadingOptions, data: sf.binary.slice(0), password,
      }).promise
      const totalPages = pdf.numPages
      const imageBuffers: ArrayBuffer[] = []
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 2 })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width; canvas.height = viewport.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvas, canvasContext: ctx, viewport }).promise
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92))
        imageBuffers.push(await blob.arrayBuffer())
      }
      sf.renderedImages = imageBuffers
      sf.encrypted = false
      lastPdfFileRef.current = sf
      loadFileInner(sf, Array.from({ length: totalPages }, (_, i) => ({ index: i })))
      setPasswordDialog(null)
    } catch {
      setPasswordDialog((prev) => prev ? { ...prev, error: '密码错误，请重试' } : null)
    }
  }, [passwordDialog, loadFileInner])

  const handleRenderPreview = useCallback(async (pageIndex: number) => {
    if (renderQueue.current.has(pageIndex)) return
    renderQueue.current.add(pageIndex)
    const page = state.pages[pageIndex]
    if (!page || page.previewUrl) { renderQueue.current.delete(pageIndex); return }
    const sf = sourceFile
    if (!sf || sf.type !== 'pdf' || sf.renderedImages) { renderQueue.current.delete(pageIndex); return }
    try {
      const url = await renderPagePreview(sf.binary, page.originalPageIndex)
      setPreviewUrl(pageIndex, url)
    } catch { /* noop */ } finally { renderQueue.current.delete(pageIndex) }
  }, [state.pages, sourceFile, setPreviewUrl])

  const handleClearPreview = useCallback((pageIndex: number) => {
    const page = state.pages[pageIndex]
    if (!page?.previewUrl) return
    URL.revokeObjectURL(page.previewUrl)
    setPreviewUrl(pageIndex, undefined)
  }, [state.pages, setPreviewUrl])

  const handleExport = useCallback(() => {
    if (!sourceFile) return
    let activePages = state.pages.filter(p => !p.deleted)
    // What you see is what you get: include the live watermark preview even if it
    // has not been pinned with "添加水印" yet.
    if (watermarkDraft) {
      const draftPageIds = new Set(watermarkDraft.pageIds)
      activePages = activePages.map(p => draftPageIds.has(p.id)
        ? { ...p, watermarks: [...p.watermarks, watermarkDraft.watermark] }
        : p)
    }
    postAction({ type: 'EXPORT_PDF', payload: { pages: activePages, sourceId: sourceFile.id } })
  }, [postAction, state.pages, sourceFile, watermarkDraft])

  const handleWatermarkDraftChange = useCallback((draft: WatermarkDraft | null) => {
    setWatermarkDraft(draft)
  }, [])

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (!sourceFile || !query.trim()) { setSearchResults([]); return }
    try {
      const results = await searchPdfText(sourceFile.binary, query)
      setSearchResults(results.map(r => r.pageIndex))
    } catch { setSearchResults([]) }
  }, [sourceFile, setSearchQuery, setSearchResults])

  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDropOnZone = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) handleFileDrop(files)
  }, [handleFileDrop])

  if (!sourceFile) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDropOnZone}
          onClick={() => fileInputRef.current?.click()}
          className={`w-96 h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
          }`}
        >
          <span className="text-4xl mb-3">✍️</span>
          <p className="text-sm text-gray-400">拖入 PDF 开始编辑</p>
          <p className="text-xs text-gray-400 mt-1">或点击选择文件</p>
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { handleFileDrop([f]); e.target.value = '' } }} className="hidden" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <PageThumbnails
        pages={state.pages}
        currentPageIndex={state.currentPageIndex}
        collapsed={thumbnailsCollapsed}
        onToggleCollapse={() => setThumbnailsOverride(!thumbnailsCollapsed)}
        onSetCurrentPage={setCurrentPage}
        onMovePage={movePage}
        thumbUrls={thumbUrls}
        onLoadThumb={loadThumbnail}
      />
      <CenterPanel
        pages={state.pages}
        currentPageIndex={state.currentPageIndex}
        isRedacting={isRedacting}
        searchResults={state.searchResults}
        watermarkDraft={watermarkDraft}
        fileName={sourceFile.name}
        onReselectFile={() => fileInputRef.current?.click()}
        onRenderPreview={handleRenderPreview}
        onClearPreview={handleClearPreview}
        onRotatePage={rotatePage}
        onDeletePage={deletePage}
        onSetCurrentPage={setCurrentPage}
        onAddRedaction={addRedaction}
        onRemoveRedaction={removeRedaction}
        onCloseFile={clearFile}
      />
      <ToolDrawer
        collapsed={panelCollapsed}
        onToggleCollapse={() => setPanelOverride(!panelCollapsed)}
        pages={state.pages}
        currentPageIndex={state.currentPageIndex}
        isRedacting={isRedacting}
        splitMode={state.splitMode}
        splitRangeStart={state.splitRangeStart}
        splitRangeEnd={state.splitRangeEnd}
        scatterPages={state.scatterPages}
        searchQuery={state.searchQuery}
        searchResults={state.searchResults}
        onSplitModeChange={() => {}}
        onSplitRangeChange={() => {}}
        onScatterPagesChange={() => {}}
        onSearch={handleSearch}
        onSplit={() => {}}
        onRemoveWatermark={removeWatermark}
        onWatermarkDraftChange={handleWatermarkDraftChange}
        onToggleRedact={() => setIsRedacting(!isRedacting)}
        onClearRedactions={clearRedactions}
        onRemoveRedaction={removeRedaction}
        onExport={handleExport}
        onExportSplit={() => {}}
        hideSplit
        history={getHistory()}
        onUndo={undo}
        onRedo={redo}
        onJumpToHistory={jumpToHistory}
      />

      {/* Persistent picker for "重新选择" in the canvas header. */}
      <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { handleFileDrop([f]); e.target.value = '' } }} />

      {passwordDialog && (
        <PasswordDialog
          fileName={passwordDialog.fileName}
          error={passwordDialog.error}
          onSubmit={handlePasswordSubmit}
          onCancel={() => setPasswordDialog(null)}
        />
      )}
    </div>
  )
}
