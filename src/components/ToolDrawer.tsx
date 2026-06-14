import { useState, useCallback, useRef } from 'react'
import type { PageItem, Watermark, SourceFile, SplitMode, HistoryCommand } from '../types'
import { renderSingleTextWatermark, renderTextWatermark } from '../utils/watermark-render'

interface ToolDrawerProps {
  collapsed: boolean
  onToggleCollapse: () => void
  pages: PageItem[]
  currentPageIndex: number
  sourceFile: SourceFile | null
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
  onAddWatermark: (pageIndex: number, w: Watermark) => void
  onRemoveWatermark: (pageIndex: number, id: string) => void
  onToggleRedact: () => void
  onClearRedactions: () => void
  onRemoveRedaction: (pageIndex: number, id: string) => void
  onExport: () => void
  onExportSplit: () => void
  onFileDrop: (files: File[]) => void
  history: { stack: HistoryCommand[]; pointer: number }
  onUndo: () => void
  onRedo: () => void
  onJumpToHistory: (index: number) => void
  hideSplit?: boolean
}

export function ToolDrawer({
  collapsed, onToggleCollapse,
  pages, currentPageIndex, sourceFile,
  isRedacting,
  splitMode, splitRangeStart, splitRangeEnd, scatterPages,
  searchQuery, searchResults,
  onSplitModeChange, onSplitRangeChange, onScatterPagesChange,
  onSearch, onSplit, onAddWatermark, onRemoveWatermark,
  onToggleRedact, onClearRedactions, onRemoveRedaction,
  onExport, onExportSplit,
  onFileDrop,
  history, onUndo, onRedo, onJumpToHistory,
  hideSplit,
}: ToolDrawerProps) {
  const [wmText, setWmText] = useState('')
  const [wmFontSize, setWmFontSize] = useState(24)
  const [wmOpacity, setWmOpacity] = useState(0.3)
  const [wmAngle, setWmAngle] = useState(-45)
  const [wmPosition, setWmPosition] = useState<Watermark['position']>('full')
  const [wmTarget, setWmTarget] = useState<'current' | 'all'>('current')
  const [wmTab, setWmTab] = useState<'text' | 'image'>('text')
  const [imgWmData, setImgWmData] = useState<string>('')
  const [imgWmName, setImgWmName] = useState('')
  const [sections, setSections] = useState({ watermark: false, redact: false })
  const imgInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const totalPages = pages.filter(p => !p.deleted).length
  const currentPage = pages[currentPageIndex]
  const { stack, pointer } = history

  const toggleSection = useCallback((key: 'watermark' | 'redact') => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const handleSearchInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value), [onSearch])

  const handleAddTextWatermark = useCallback(() => {
    if (!wmText.trim()) return
    try {
      let pngData = ''
      try {
        pngData = wmPosition === 'full'
          ? renderTextWatermark(wmText, wmFontSize, wmOpacity, wmAngle, 600, 850)
          : renderSingleTextWatermark(wmText, wmFontSize, wmOpacity, wmAngle)
      } catch (e) {
        console.warn('[watermark] render failed, proceeding without pngData:', e)
      }
      const w: Watermark = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        text: wmText, fontSize: wmFontSize, opacity: wmOpacity, angle: wmAngle, position: wmPosition,
        pngData: pngData || undefined,
      }
      if (wmTarget === 'all') {
        pages.forEach((_, i) => onAddWatermark(i, { ...w, id: `${w.id}-${i}` }))
      } else {
        onAddWatermark(currentPageIndex, w)
      }
    } catch (e) {
      console.error('[watermark] handleAddTextWatermark error:', e)
    }
  }, [wmText, wmFontSize, wmOpacity, wmAngle, wmPosition, wmTarget, currentPageIndex, pages, onAddWatermark])

  const handleAddImageWatermark = useCallback(() => {
    if (!imgWmData) return
    const w: Watermark = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      text: imgWmName || '图片水印',
      fontSize: 24, opacity: wmOpacity, angle: wmAngle, position: wmPosition,
      imageData: imgWmData, imageName: imgWmName,
    }
    if (wmTarget === 'all') {
      pages.forEach((_, i) => onAddWatermark(i, { ...w, id: `${w.id}-${i}`, imageData: imgWmData }))
    } else {
      onAddWatermark(currentPageIndex, w)
    }
  }, [imgWmData, imgWmName, wmOpacity, wmAngle, wmPosition, wmTarget, currentPageIndex, pages, onAddWatermark])

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
        {/* === 导入 PDF === */}
        <section className="border-b border-gray-800/50">
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-400">📄 文件</span>
            <button onClick={() => fileInputRef.current?.click()}
              className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
              {sourceFile ? '重新选择' : '选择文件'}
            </button>
            <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { onFileDrop([f]); e.target.value = '' } }} />
          </div>
          {sourceFile && (
            <div className="px-3 pb-2 text-xs text-gray-500 space-y-0.5">
              <div className="truncate">{sourceFile.name}</div>
              <div>{totalPages} 页 · {sourceFile.type === 'pdf' ? 'PDF' : '图片'}</div>
            </div>
          )}
        </section>

        {/* === 切分与检索 === */}
        {!hideSplit && (
        <section className="border-b border-gray-800/50">
          <div className="px-3 py-2 flex items-center gap-2 text-xs text-gray-400">
            <span className="font-medium">切分与检索</span>
          </div>
          <div className="px-3 pb-3 space-y-3">
              <div>
                <input type="text" value={searchQuery} onChange={handleSearchInput} placeholder="输入关键词检索..."
                  className="w-full px-2 py-1.5 rounded-md bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none" />
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
                    className="w-full px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none" />
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
                }`}>文字</button>
              <button onClick={() => setWmTab('image')}
                className={`flex-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  wmTab === 'image' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}>图片</button>
            </div>

            {/* ─── Text watermark ─── */}
            {wmTab === 'text' && (
              <div className="space-y-2">
                <input type="text" value={wmText} onChange={e => setWmText(e.target.value)}
                  placeholder="输入水印文字..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none" />
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-6">字号</label>
                  <input type="range" min={8} max={72} value={wmFontSize}
                    onChange={e => setWmFontSize(parseInt(e.target.value))}
                    className="flex-1 accent-blue-500" />
                  <span className="text-xs text-gray-300 w-5 text-right">{wmFontSize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-6">透明</label>
                  <input type="range" min={5} max={100} value={Math.round(wmOpacity * 100)}
                    onChange={e => setWmOpacity(parseInt(e.target.value) / 100)}
                    className="flex-1 accent-blue-500" />
                  <span className="text-xs text-gray-300 w-8 text-right">{Math.round(wmOpacity * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-6">旋转</label>
                  <input type="range" min={-180} max={180} value={wmAngle}
                    onChange={e => setWmAngle(parseInt(e.target.value))}
                    className="flex-1 accent-blue-500" />
                  <span className="text-xs text-gray-300 w-8 text-right">{wmAngle}°</span>
                </div>
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
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-6">透明</label>
                  <input type="range" min={5} max={100} value={Math.round(wmOpacity * 100)}
                    onChange={e => setWmOpacity(parseInt(e.target.value) / 100)}
                    className="flex-1 accent-blue-500" />
                  <span className="text-xs text-gray-300 w-8 text-right">{Math.round(wmOpacity * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 w-6">旋转</label>
                  <input type="range" min={-180} max={180} value={wmAngle}
                    onChange={e => setWmAngle(parseInt(e.target.value))}
                    className="flex-1 accent-blue-500" />
                  <span className="text-xs text-gray-300 w-8 text-right">{wmAngle}°</span>
                </div>
              </div>
            )}

            {/* ─── Position ─── */}
            <div>
              <label className="text-xs text-gray-500 block mb-1">位置</label>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { v: 'tl', l: '↖' }, { v: 'tc', l: '↑' }, { v: 'tr', l: '↗' },
                  { v: 'ml', l: '←' }, { v: 'mc', l: '⊙' }, { v: 'mr', l: '→' },
                  { v: 'bl', l: '↙' }, { v: 'bc', l: '↓' }, { v: 'br', l: '↘' },
                  { v: 'full', l: '铺满' }, { v: 'center', l: '居中' },
                ].map(p => (
                  <button key={p.v} onClick={() => setWmPosition(p.v as Watermark['position'])}
                    className={`py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                      wmPosition === p.v
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}>{p.l}</button>
                ))}
              </div>
            </div>

            {/* ─── Scope + Add in one row ─── */}
            <div className="flex gap-1.5">
              <div className="flex gap-0.5 bg-gray-800/50 rounded-lg p-0.5">
                <button onClick={() => setWmTarget('current')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    wmTarget === 'current' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                  }`}>当前</button>
                <button onClick={() => setWmTarget('all')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    wmTarget === 'all' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
                  }`}>全部</button>
              </div>
              <button onClick={wmTab === 'text' ? handleAddTextWatermark : handleAddImageWatermark}
                disabled={wmTab === 'text' ? !wmText.trim() : !imgWmData}
                className="flex-1 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-medium transition-colors cursor-pointer">
                添加水印</button>
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
            <p className="text-xs text-gray-500">在页面中拖拽选框来隐藏敏感内容</p>

            <button onClick={onToggleRedact}
              className={`w-full py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isRedacting ? 'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-600/20' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}>
              {isRedacting ? '🔒 完成遮蔽' : '🖌 进入遮蔽模式'}
            </button>

            {currentPage && currentPage.redactions.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-1">当前页遮蔽块</div>
                <div className="space-y-0.5 max-h-32 overflow-y-auto">
                  {currentPage.redactions.map((r, i) => (
                    <div key={r.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-gray-800/60 text-xs group">
                      <span className="text-gray-400">#{i + 1} ({Math.round(r.w)}×{Math.round(r.h)})</span>
                      <div className="flex gap-2">
                        <span className="text-gray-600">({Math.round(r.x)},{Math.round(r.y)})</span>
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
              <div className="text-center py-3 text-xs text-gray-600 border border-dashed border-gray-800 rounded-lg">
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
          <span className="text-sm font-medium text-gray-500">历史记录</span>
          <div className="flex gap-1">
            <button onClick={onUndo} disabled={pointer < 0} className="px-1.5 py-0.5 rounded text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-400 cursor-pointer transition-colors" title="撤销 Ctrl+Z">↩</button>
            <button onClick={onRedo} disabled={pointer >= stack.length - 1} className="px-1.5 py-0.5 rounded text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-gray-400 cursor-pointer transition-colors" title="重做 Ctrl+Y">↪</button>
          </div>
        </div>
        <div className="max-h-28 overflow-y-auto px-3 pb-2 space-y-0.5">
          {stack.length === 0 ? (
            <div className="text-xs text-gray-600 text-center py-1">暂无操作</div>
          ) : (
            stack.map((cmd, idx) => {
              const isCurrent = idx === pointer
              const isPast = idx < pointer
              return (
                <button key={cmd.id} onClick={() => onJumpToHistory(idx)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${isCurrent ? 'bg-blue-600/30 text-blue-300' : isPast ? 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/60' : 'text-gray-600 hover:bg-gray-800/30'}`}>
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