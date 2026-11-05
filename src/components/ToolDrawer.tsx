import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { PageItem, Watermark, WatermarkDraft, SplitMode, HistoryCommand } from '../types'
import { parsePageRange, renderImageWatermarkPng, renderTextWatermarkPng } from '../utils/watermark-render'

interface ToolDrawerProps {
  collapsed: boolean
  onToggleCollapse: () => void
  pages: PageItem[]
  currentPageIndex: number
  isRedacting: boolean
  splitMode: SplitMode
  splitRangeStart: number
  splitRangeEnd: number
  scatterPages: string
  searchQuery: string
  searchResults: number[]
  onSplitModeChange: (m: SplitMode) => void
  onSplitRangeChange: (s: number, e: number) => void
  onScatterPagesChange: (v: string) => void
  onSearch: (q: string) => void
  onSplit: () => void
  onRemoveWatermark: (pageIndex: number, id: string) => void
  /** Report the pending watermark so the canvas can preview it live on the real pages. */
  onWatermarkDraftChange?: (draft: WatermarkDraft | null) => void
  onToggleRedact: () => void
  onClearRedactions: () => void
  onRemoveRedaction: (pageIndex: number, id: string) => void
  onExport: () => void
  onExportSplit: () => void
  history: { stack: HistoryCommand[]; pointer: number }
  onUndo: () => void
  onRedo: () => void
  onJumpToHistory: (index: number) => void
  hideSplit?: boolean
}

export function ToolDrawer({
  collapsed, onToggleCollapse,
  pages, currentPageIndex,
  isRedacting,
  splitMode, splitRangeStart, splitRangeEnd, scatterPages,
  searchQuery, searchResults,
  onSplitModeChange, onSplitRangeChange, onScatterPagesChange,
  onSearch, onSplit, onRemoveWatermark,
  onWatermarkDraftChange,
  onToggleRedact, onClearRedactions, onRemoveRedaction,
  onExport, onExportSplit,
  history, onUndo, onRedo, onJumpToHistory,
  hideSplit,
}: ToolDrawerProps) {
  const [wmText, setWmText] = useState('')
  const [wmFontSize, setWmFontSize] = useState(28)
  const [wmOpacity, setWmOpacity] = useState(0.12)
  const [wmAngle, setWmAngle] = useState(-30)
  const [wmColor, setWmColor] = useState('#000000')
  const [wmSpacing, setWmSpacing] = useState(80)
  const [wmMode, setWmMode] = useState<'tile' | 'single'>('tile')
  const [wmTarget, setWmTarget] = useState<'all' | 'first' | 'custom'>('all')
  const [wmRange, setWmRange] = useState('')
  const [wmTab, setWmTab] = useState<'text' | 'image'>('text')
  const [imgWmData, setImgWmData] = useState<string>('')
  const [imgWmName, setImgWmName] = useState('')
  const [wmImageScale, setWmImageScale] = useState(0.3)
  const [sections, setSections] = useState({ watermark: false, redact: false })
  const imgInputRef = useRef<HTMLInputElement>(null)
  const totalPages = pages.filter(p => !p.deleted).length
  const currentPage = pages[currentPageIndex]
  const { stack, pointer } = history

  const wmTargetPages = useMemo(() => {
    const active = pages.map((p, i) => ({ p, i })).filter(x => !x.p.deleted).map(x => x.i)
    if (wmTarget === 'all') return active
    if (wmTarget === 'first') return active.slice(0, 1)
    return parsePageRange(wmRange, pages.length).filter(i => !pages[i]?.deleted)
  }, [pages, wmTarget, wmRange])

  // Signature of the current watermark settings, used to regenerate the live preview
  // only when something actually changes.
  const draftSig = useMemo(() => {
    const targetKey = wmTargetPages.join(',')
    return wmTab === 'text'
      ? ['text', wmText.trim(), wmFontSize, wmOpacity, wmAngle, wmColor, wmSpacing, wmMode, targetKey].join('|')
      : ['image', imgWmName, imgWmData.length, wmOpacity, wmAngle, wmMode, wmImageScale, targetKey].join('|')
  }, [wmTab, wmText, wmFontSize, wmOpacity, wmAngle, wmColor, wmSpacing, wmMode, wmTargetPages, imgWmName, imgWmData, wmImageScale])

  const pagesRef = useRef(pages)
  pagesRef.current = pages

  // Render the pending watermark onto the real pages in the canvas (debounced).
  useEffect(() => {
    if (!onWatermarkDraftChange) return
    const text = wmText.trim()
    const hasContent = wmTab === 'text' ? text.length > 0 : imgWmData.length > 0
    const targetKey = wmTargetPages.join(',')
    if (!hasContent || !targetKey) {
      onWatermarkDraftChange(null)
      return
    }

    let cancelled = false
    const timer = window.setTimeout(async () => {
      let pngData: string | undefined
      try {
        pngData = wmTab === 'text'
          ? renderTextWatermarkPng({
            text, fontSize: wmFontSize, opacity: wmOpacity, angle: wmAngle,
            color: wmColor, spacing: wmSpacing, mode: wmMode,
          }) || undefined
          : await renderImageWatermarkPng({
            source: imgWmData, opacity: wmOpacity, angle: wmAngle,
            mode: wmMode, imageScale: wmImageScale,
          })
      } catch (e) {
        console.warn('[watermark] draft render failed:', e)
      }
      if (cancelled) return

      const watermark: Watermark = wmTab === 'text'
        ? {
          id: '__draft__', text, fontSize: wmFontSize, opacity: wmOpacity, angle: wmAngle,
          position: wmMode === 'tile' ? 'full' : 'center',
          color: wmColor, spacing: wmSpacing, pngData,
        }
        : {
          id: '__draft__', text: imgWmName || '图片水印', fontSize: 24, opacity: wmOpacity, angle: wmAngle,
          position: wmMode === 'tile' ? 'full' : 'center',
          imageScale: wmImageScale, imageData: imgWmData, imageName: imgWmName, pngData,
        }
      onWatermarkDraftChange({
        pageIds: wmTargetPages.map(i => pagesRef.current[i]?.id).filter((id): id is string => Boolean(id)),
        watermark,
      })
    }, 120)

    return () => { cancelled = true; window.clearTimeout(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draftSig covers the settings; pages are read through pagesRef
  }, [onWatermarkDraftChange, draftSig, sections.watermark, wmTab, wmText, wmFontSize, wmOpacity, wmAngle, wmColor, wmSpacing, wmMode, imgWmData, imgWmName, wmImageScale])

  const toggleSection = useCallback((key: 'watermark' | 'redact') => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value), [onSearch])

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgWmName(file.name)
    const reader = new FileReader()
    reader.onload = () => setImgWmData(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }, [])

  if (collapsed) {
    return (
      <button onClick={onToggleCollapse}
        className="w-6 shrink-0 bg-gray-900 border-l border-gray-800 hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
        title="展开功能区"
      >
        <span className="text-xs">▶</span>
      </button>
    )
  }

  return (
    <aside className="w-72 shrink-0 border-l border-gray-800 bg-gray-900/50 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 shrink-0">
        <span className="text-xs font-semibold text-gray-300">功能区</span>
        <button onClick={onToggleCollapse} className="text-gray-500 hover:text-white text-xs cursor-pointer">◀</button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* === 切分与检索 === */}
        {!hideSplit && (
        <section className="border-b border-gray-800/50">
          <div className="px-3 py-2 flex items-center gap-2 text-xs text-gray-400">
            <span className="font-medium">切分与检索</span>
          </div>
          <div className="px-3 pb-3 space-y-3">
              <div>
                <input type="text" value={searchQuery} onChange={handleSearchInput} placeholder="输入关键词检索..."
                  className="w-full px-2 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
                {searchResults.length > 0 && (
                  <div className="mt-1.5 max-h-20 overflow-y-auto space-y-0.5">
                    {searchResults.map((pi, i) => (
                      <button key={`${pi}-${i}`} className="w-full text-left px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 cursor-pointer">
                        第 {pi + 1} 页
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="flex gap-1 mb-1.5">
                  <button onClick={() => onSplitModeChange('range')}
                    className={`flex-1 px-2 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${splitMode === 'range' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>区间</button>
                  <button onClick={() => onSplitModeChange('scatter')}
                    className={`flex-1 px-2 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${splitMode === 'scatter' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>散点</button>
                </div>
                {splitMode === 'range' ? (
                  <div className="flex items-center gap-1.5 text-sm">
                    <input type="number" min={1} max={totalPages} value={splitRangeStart}
                      onChange={e => onSplitRangeChange(Math.max(1, parseInt(e.target.value) || 1), splitRangeEnd)}
                      className="w-11 px-1.5 py-1 rounded bg-gray-800 border border-gray-700 text-center text-gray-200 focus:border-blue-500 focus:outline-none" />
                    <span className="text-gray-500">—</span>
                    <input type="number" min={1} max={totalPages} value={splitRangeEnd}
                      onChange={e => onSplitRangeChange(splitRangeStart, Math.min(totalPages, parseInt(e.target.value) || totalPages))}
                      className="w-11 px-1.5 py-1 rounded bg-gray-800 border border-gray-700 text-center text-gray-200 focus:border-blue-500 focus:outline-none" />
                    <span className="text-gray-500">/ {totalPages}</span>
                  </div>
                ) : (
                  <input type="text" value={scatterPages} onChange={e => onScatterPagesChange(e.target.value)}
                    placeholder="如: 1,3,5-8,12"
                    className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
                )}
                <button onClick={onSplit} className="w-full mt-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors cursor-pointer">导出切分 →</button>
              </div>
          </div>
        </section>
        )}

        {/* === 水印 === (默认折叠) */}
        <section className="border-b border-gray-800/50">
          <button onClick={() => toggleSection('watermark')}
            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-800/40 text-xs text-gray-400 cursor-pointer transition-colors">
            <span className="text-xs">{sections.watermark ? '▼' : '▶'}</span>
            <span className="font-medium">水印</span>
            {currentPage && currentPage.watermarks.length > 0 && (
              <span className="ml-auto text-xs text-purple-400 bg-purple-600/10 px-1.5 py-0.5 rounded">{currentPage.watermarks.length}</span>
            )}
          </button>
          {sections.watermark && (
          <div className="px-3 pb-3 space-y-2.5">

            {/* ─── Tab pills ─── */}
            <div className="flex gap-1 bg-gray-800/50 rounded-lg p-0.5">
              <button onClick={() => setWmTab('text')}
                className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  wmTab === 'text' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}>文字水印</button>
              <button onClick={() => setWmTab('image')}
                className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  wmTab === 'image' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}>图片水印</button>
            </div>

            {/* ─── Text watermark ─── */}
            {wmTab === 'text' && (
              <div className="space-y-2">
                <input type="text" value={wmText} onChange={e => setWmText(e.target.value)}
                  placeholder="例如：机密、草稿、仅供内部"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[11px] text-gray-400">字号 {wmFontSize}</span>
                    <input type="range" min={12} max={96} value={wmFontSize}
                      onChange={e => setWmFontSize(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] text-gray-400">透明度 {wmOpacity.toFixed(2)}</span>
                    <input type="range" min={0.05} max={0.8} step={0.01} value={wmOpacity}
                      onChange={e => setWmOpacity(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] text-gray-400">旋转 {wmAngle}°</span>
                    <input type="range" min={-180} max={180} value={wmAngle}
                      onChange={e => setWmAngle(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] text-gray-400">颜色 {wmColor}</span>
                    <input type="color" value={wmColor} onChange={e => setWmColor(e.target.value)}
                      className="mt-1 h-5 w-full rounded border border-gray-700 bg-gray-800 cursor-pointer" />
                  </label>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-gray-400 shrink-0">模式</span>
                  <button onClick={() => setWmMode('tile')}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      wmMode === 'tile' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                    }`}>平铺水印</button>
                  <button onClick={() => setWmMode('single')}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      wmMode === 'single' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                    }`}>单点水印</button>
                </div>
                {wmMode === 'tile' && (
                  <label className="block">
                    <span className="text-[11px] text-gray-400">文字间隔 {wmSpacing}</span>
                    <input type="range" min={20} max={300} value={wmSpacing}
                      onChange={e => setWmSpacing(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer" />
                  </label>
                )}
              </div>
            )}

            {/* ─── Image watermark ─── */}
            {wmTab === 'image' && (
              <div className="space-y-2">
                <button onClick={() => imgInputRef.current?.click()}
                  className="w-full py-2 rounded-lg border-2 border-dashed border-gray-700 hover:border-gray-500 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">
                  {imgWmData ? `📎 ${imgWmName}` : '📤 上传水印图片'}
                </button>
                <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <div className="grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="text-[11px] text-gray-400">大小 {Math.round(wmImageScale * 100)}%</span>
                    <input type="range" min={10} max={100} value={Math.round(wmImageScale * 100)}
                      onChange={e => setWmImageScale(parseInt(e.target.value) / 100)}
                      className="w-full accent-blue-500 cursor-pointer" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] text-gray-400">透明度 {wmOpacity.toFixed(2)}</span>
                    <input type="range" min={0.05} max={0.8} step={0.01} value={wmOpacity}
                      onChange={e => setWmOpacity(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer" />
                  </label>
                  <label className="block">
                    <span className="text-[11px] text-gray-400">旋转 {wmAngle}°</span>
                    <input type="range" min={-180} max={180} value={wmAngle}
                      onChange={e => setWmAngle(parseInt(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer" />
                  </label>
                </div>
                <div className="flex items-center gap-1 text-[11px]">
                  <span className="text-gray-400 shrink-0">模式</span>
                  <button onClick={() => setWmMode('tile')}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      wmMode === 'tile' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                    }`}>平铺水印</button>
                  <button onClick={() => setWmMode('single')}
                    className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                      wmMode === 'single' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                    }`}>单点水印</button>
                </div>
              </div>
            )}

            {/* ─── Live preview hint (rendered directly on the canvas) ─── */}
            <p className="rounded-lg border border-dashed border-gray-700/70 px-2.5 py-2 text-[11px] leading-relaxed text-gray-400">
              调整参数后水印会立即显示在画布上，并自动包含在导出的 PDF 中。
            </p>

            {/* ─── Page scope ─── */}
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">应用页范围</label>
              <div className="flex flex-wrap gap-1">
                {([['all', '全部页面'], ['first', '仅第 1 页'], ['custom', '自定义']] as const).map(([value, label]) => (
                  <button key={value} onClick={() => setWmTarget(value)}
                    className={`px-2 py-1 rounded-md border text-[11px] transition-colors cursor-pointer ${
                      wmTarget === value
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                    }`}>{label}</button>
                ))}
              </div>
              {wmTarget === 'custom' && (
                <input type="text" value={wmRange} onChange={e => setWmRange(e.target.value)}
                  placeholder="如 1-3,5"
                  className="mt-1.5 w-full px-2 py-1 rounded-md bg-gray-800 border border-gray-700 text-[11px] text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
              )}
              <p className="mt-1 text-[11px] text-gray-400">将应用到 {wmTargetPages.length} 页</p>
            </div>

            {/* ─── Existing watermarks (compact) ─── */}
            {currentPage && currentPage.watermarks.length > 0 && (
              <div className="space-y-0.5">
                {currentPage.watermarks.map(w => (
                  <div key={w.id} className="flex items-center justify-between px-2 py-1 rounded bg-gray-800/50 text-xs">
                    <span className="text-gray-300 truncate">{w.text || '🖼 图片水印'}</span>
                    <button onClick={() => onRemoveWatermark(currentPageIndex, w.id)}
                      className="text-gray-500 hover:text-red-400 shrink-0 cursor-pointer">✕</button>
                  </div>
                ))}
              </div>
            )}

          </div>
          )}
        </section>

        {/* === 导出 === */}
        <section className="border-b border-gray-800/50">
          <div className="px-3 pb-3 pt-2 space-y-1.5">
            <button onClick={onExport} className="w-full px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer shadow-sm shadow-blue-600/20">导出最终 PDF</button>
            {!hideSplit && (
            <button onClick={onExportSplit} className="w-full px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors cursor-pointer">切分导出</button>
            )}
          </div>
        </section>

        {/* === 遮罩 === (默认折叠) */}
        <section className="border-b border-gray-800/50">
          <button onClick={() => toggleSection('redact')}
            className="w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-800/40 text-xs text-gray-400 cursor-pointer transition-colors">
            <span className="text-xs">{sections.redact ? '▼' : '▶'}</span>
            <span className="font-medium">遮罩</span>
            {currentPage && currentPage.redactions.length > 0 && (
              <span className="ml-auto text-xs text-red-400 bg-red-600/10 px-1.5 py-0.5 rounded">{currentPage.redactions.length}</span>
            )}
          </button>
          {sections.redact && (
          <div className="px-3 pb-3 space-y-2.5">
            <p className="text-xs text-gray-400">在页面中拖拽选框来隐藏敏感内容</p>

            <button onClick={onToggleRedact}
              className={`w-full py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isRedacting ? 'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-600/20' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}>
              {isRedacting ? '🔒 完成遮蔽' : '🖌 进入遮蔽模式'}
            </button>

            {currentPage && currentPage.redactions.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1">当前页遮蔽块</div>
                <div className="space-y-0.5 max-h-32 overflow-y-auto">
                  {currentPage.redactions.map((r, i) => (
                    <div key={r.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-gray-800/60 text-xs group">
                      <span className="text-gray-400">#{i + 1} ({Math.round(r.w)}×{Math.round(r.h)})</span>
                      <div className="flex gap-2">
                        <span className="text-gray-400">({Math.round(r.x)},{Math.round(r.y)})</span>
                        <button onClick={() => onRemoveRedaction(currentPageIndex, r.id)}
                          className="text-gray-500 hover:text-red-400 cursor-pointer">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={onClearRedactions}
                  className="w-full py-1.5 rounded-lg bg-red-900/50 hover:bg-red-800 text-red-300 text-xs font-medium transition-colors cursor-pointer">清除全部 ({currentPage.redactions.length})</button>
              </div>
            )}

            {(!currentPage || currentPage.redactions.length === 0) && !isRedacting && (
              <div className="text-center py-3 text-xs text-gray-400 border border-dashed border-gray-800 rounded-lg">
                暂无遮罩
              </div>
            )}
          </div>
          )}
        </section>
      </div>

      {/* === 历史记录 (固定在底部) === */}
      <div className="border-t border-gray-800 bg-gray-900/80 shrink-0">
        <div className="px-3 py-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-400">历史记录</span>
          <div className="flex gap-1">
            <button onClick={onUndo} disabled={pointer < 0} className="px-1.5 py-0.5 rounded text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-400 cursor-pointer transition-colors" title="撤销 Ctrl+Z">↩</button>
            <button onClick={onRedo} disabled={pointer >= stack.length - 1} className="px-1.5 py-0.5 rounded text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-400 cursor-pointer transition-colors" title="重做 Ctrl+Y">↪</button>
          </div>
        </div>
        <div className="max-h-28 overflow-y-auto px-3 pb-2 space-y-0.5">
          {stack.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-1">暂无操作</div>
          ) : (
            stack.map((cmd, idx) => {
              const isCurrent = idx === pointer
              const isPast = idx < pointer
              return (
                <button key={cmd.id} onClick={() => onJumpToHistory(idx)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${isCurrent ? 'bg-blue-600/30 text-blue-300' : isPast ? 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/60' : 'text-gray-400 hover:bg-gray-800/30'}`}>
                  <span className={`w-1 h-1 rounded-full shrink-0 ${isCurrent ? 'bg-blue-400' : isPast ? 'bg-gray-500' : 'bg-gray-700'}`} />
                  <span className="truncate">{cmd.description}</span>
                </button>
              )
            })
          )}
        </div>
      </div>
    </aside>
  )
}