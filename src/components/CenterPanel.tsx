import { useCallback, useRef, useEffect, useState } from 'react'
import type { PageItem, Redaction, Watermark } from '../types'

interface CenterPanelProps {
  pages: PageItem[]
  currentPageIndex: number
  isRedacting: boolean
  searchResults: number[]
  onRenderPreview: (pageIndex: number) => void
  onClearPreview: (pageIndex: number) => void
  onRotatePage: (pageIndex: number) => void
  onDeletePage: (pageIndex: number) => void
  onSetCurrentPage: (index: number) => void
  onAddRedaction: (pageIndex: number, r: Redaction) => void
  onRemoveRedaction: (pageIndex: number, redactionId: string) => void
  onCloseFile?: () => void
}

export function CenterPanel({
  pages, currentPageIndex, isRedacting,
  onRenderPreview, onClearPreview, onRotatePage, onDeletePage,
  onSetCurrentPage, onAddRedaction, onRemoveRedaction,
  onCloseFile,
}: CenterPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [drawState, setDrawState] = useState<{ start: { x: number; y: number }; current: { x: number; y: number } } | null>(null)

  const handlePageClick = useCallback((idx: number) => {
    onSetCurrentPage(idx)
  }, [onSetCurrentPage])

  const activePages = pages.filter(p => !p.deleted)
  const totalActive = activePages.length

  const getVisibleRange = useCallback(() => {
    const prev = Math.max(0, currentPageIndex - 1)
    const next = Math.min(totalActive - 1, currentPageIndex + 1)
    return { prev, next }
  }, [currentPageIndex, totalActive])

  const { prev, next } = getVisibleRange()

  useEffect(() => {
    for (let i = prev; i <= next; i++) {
      onRenderPreview(i)
    }
    for (let i = 0; i < totalActive; i++) {
      if (i < prev || i > next) onClearPreview(i)
    }
  }, [prev, next, totalActive, onRenderPreview, onClearPreview])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          const idx = parseInt(entry.target.getAttribute('data-page-index') || '0')
          if (entry.isIntersecting) onRenderPreview(idx)
        }
      },
      { root: container, rootMargin: '200px', threshold: 0.1 },
    )
    itemRefs.current.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [totalActive, onRenderPreview])

  useEffect(() => {
    const el = itemRefs.current.get(currentPageIndex)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [currentPageIndex])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        onSetCurrentPage(Math.min(totalActive - 1, currentPageIndex + 1))
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        onSetCurrentPage(Math.max(0, currentPageIndex - 1))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentPageIndex, totalActive, onSetCurrentPage])

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isRedacting) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setDrawState({ start: { x, y }, current: { x, y } })
  }, [isRedacting])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!drawState) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setDrawState(prev => prev ? { ...prev, current: { x, y } } : null)
  }, [drawState])

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
    if (!drawState) return
    const rect = e.currentTarget.getBoundingClientRect()
    const endX = e.clientX - rect.left
    const endY = e.clientY - rect.top
    const x = Math.min(drawState.start.x, endX)
    const y = Math.min(drawState.start.y, endY)
    const w = Math.abs(endX - drawState.start.x)
    const h = Math.abs(endY - drawState.start.y)
    if (w > 5 && h > 5) {
      onAddRedaction(pageIndex, {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        x, y, w, h,
        viewW: rect.width,
        viewH: rect.height,
      })
    }
    setDrawState(null)
  }, [drawState, onAddRedaction])

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-950 relative">
      <div className="h-9 flex items-center justify-between px-3 border-b border-gray-800 bg-gray-900/60 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            画布 · {currentPageIndex + 1}/{totalActive}
          </span>
        </div>
        {onCloseFile && (
          <button onClick={onCloseFile} title="关闭文件" className="text-xs text-gray-500 hover:text-white transition-colors cursor-pointer">
            关闭
          </button>
        )}
      </div>

      <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-3xl mx-auto py-4 space-y-4">
          {activePages.map((page, idx) => {
            const isActive = idx === currentPageIndex
            const isVisible = idx >= prev && idx <= next
            const isLandscape = page.rotation === 90 || page.rotation === 270
            const aspectClass = isLandscape ? 'aspect-[1.414/1]' : 'aspect-[1/1.414]'
            return (
              <div
                key={page.id}
                ref={el => { if (el) itemRefs.current.set(idx, el) }}
                data-page-index={idx}
                onClick={() => handlePageClick(idx)}
                className={`relative rounded-xl overflow-hidden transition-all cursor-pointer ${aspectClass} ${isActive
                  ? 'ring-2 ring-blue-500/80 shadow-lg shadow-blue-500/10'
                  : 'ring-1 ring-gray-800 hover:ring-gray-600'
                  }`}
              >
                {isVisible && page.previewUrl ? (
                  <div
                    className="absolute inset-0"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={e => handleMouseUp(e, idx)}
                  >
                    <img
                      src={page.previewUrl}
                      alt={`Page ${idx + 1}`}
                      className="block"
                      style={{
                        transform: `rotate(${page.rotation}deg)`,
                        ...(isLandscape
                          ? { height: '100%', width: 'auto' }
                          : { width: '100%', height: 'auto' }),
                      }}
                      draggable={false}
                    />
                    {page.redactions.map(r => (
                      <div
                        key={r.id}
                        className="absolute bg-black cursor-pointer group"
                        style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
                        onClick={e => { e.stopPropagation(); onRemoveRedaction(idx, r.id) }}
                        title="点击移除遮蔽"
                      />
                    ))}
                    {page.watermarks.map(wm => (
                      <WatermarkOverlay key={wm.id} watermark={wm} />
                    ))}
                    {drawState && (
                      <div
                        className="absolute bg-red-600/40 border border-red-500 pointer-events-none"
                        style={{
                          left: Math.min(drawState.start.x, drawState.current.x),
                          top: Math.min(drawState.start.y, drawState.current.y),
                          width: Math.abs(drawState.current.x - drawState.start.x),
                          height: Math.abs(drawState.current.y - drawState.start.y),
                        }}
                      />
                    )}
                  </div>
                ) : isVisible ? (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : null}

                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-xs text-gray-300 tabular-nums">
                  {idx + 1}
                </div>

                {isActive && (
                  <div className="absolute top-2 right-2 flex gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onRotatePage(idx)}
                      className="w-6 h-6 rounded bg-black/60 hover:bg-black/80 text-sm flex items-center justify-center transition-colors" title="旋转">
                      ↻
                    </button>
                    <button onClick={() => onDeletePage(idx)}
                      className="w-6 h-6 rounded bg-black/60 hover:bg-red-600/80 text-sm flex items-center justify-center transition-colors" title="剔除">
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function WatermarkOverlay({ watermark }: { watermark: Watermark }) {
  const posStyle: React.CSSProperties = { position: 'absolute', pointerEvents: 'none' }

  switch (watermark.position) {
    case 'tl': Object.assign(posStyle, { top: 20, left: 20 }); break
    case 'tc': Object.assign(posStyle, { top: 20, left: '50%', transform: 'translateX(-50%)' }); break
    case 'tr': Object.assign(posStyle, { top: 20, right: 20 }); break
    case 'ml': Object.assign(posStyle, { top: '50%', left: 20, transform: 'translateY(-50%)' }); break
    case 'mc': Object.assign(posStyle, { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }); break
    case 'mr': Object.assign(posStyle, { top: '50%', right: 20, transform: 'translateY(-50%)' }); break
    case 'bl': Object.assign(posStyle, { bottom: 20, left: 20 }); break
    case 'bc': Object.assign(posStyle, { bottom: 20, left: '50%', transform: 'translateX(-50%)' }); break
    case 'br': Object.assign(posStyle, { bottom: 20, right: 20 }); break
    case 'center': Object.assign(posStyle, { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }); break
    case 'full':
    default:
      Object.assign(posStyle, { top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '40px', padding: '40px', alignContent: 'center' })
  }

  if (watermark.imageData) {
    return (
      <div style={posStyle}>
        {watermark.position === 'full' ? (
          <img src={watermark.imageData} alt="" className="w-full h-full object-cover"
            style={{ opacity: watermark.opacity } as React.CSSProperties} />
        ) : (
          <img src={watermark.imageData} alt="" className="max-w-[200px] max-h-[200px] object-contain"
            style={{ opacity: watermark.opacity, transform: `rotate(${watermark.angle}deg)` } as React.CSSProperties} />
        )}
      </div>
    )
  }

  const textStyle: React.CSSProperties = {
    fontSize: `${Math.max(10, watermark.fontSize * 0.5)}px`,
    opacity: watermark.opacity,
    transform: `rotate(${watermark.angle}deg)`,
    color: '#000',
    fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  }

  return (
    <div style={posStyle}>
      {watermark.position === 'full' ? (
        <>
          <span style={textStyle}>{watermark.text}</span>
          <span style={textStyle}>{watermark.text}</span>
          <span style={textStyle}>{watermark.text}</span>
          <span style={textStyle}>{watermark.text}</span>
          <span style={textStyle}>{watermark.text}</span>
        </>
      ) : (
        <span style={textStyle}>{watermark.text}</span>
      )}
    </div>
  )
}
