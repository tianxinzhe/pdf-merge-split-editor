import { useEffect, useRef, useState } from 'react'
import type { PageItem } from '../types'

interface PageThumbnailsProps {
  pages: PageItem[]
  currentPageIndex: number
  collapsed: boolean
  onToggleCollapse: () => void
  onSetCurrentPage: (index: number) => void
  onMovePage: (fromIndex: number, toIndex: number) => void
  thumbUrls: (string | undefined)[]
  onLoadThumb: (pageIndex: number) => void
}

export function PageThumbnails({
  pages, currentPageIndex, collapsed, onToggleCollapse,
  onSetCurrentPage, onMovePage, thumbUrls, onLoadThumb,
}: PageThumbnailsProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const thumbContainerRef = useRef<HTMLDivElement>(null)

  const handleDragStart = (idx: number) => setDragIndex(idx)

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIndex(idx)
  }

  const handleDrop = () => {
    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) {
      setDragIndex(null); setDragOverIndex(null); return
    }
    onMovePage(dragIndex, dragOverIndex)
    setDragIndex(null); setDragOverIndex(null)
  }

  // Lazy-load thumbnails

  // Event delegation for click navigation (works even if draggable interferes)
  const handleContainerClick = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('[data-page-idx]')
    if (!target) return
    const idx = parseInt(target.getAttribute('data-page-idx') ?? '')
    if (!isNaN(idx)) onSetCurrentPage(idx)
  }
  // Lazy-load thumbnails via IntersectionObserver
  useEffect(() => {
    const el = thumbContainerRef.current
    if (!el) return
    const pending = new Set<number>()
    el.querySelectorAll('[data-page-idx]').forEach(item => {
      const idx = parseInt(item.getAttribute('data-page-idx') ?? '')
      if (!isNaN(idx) && !thumbUrls[idx]) pending.add(idx)
    })
    if (pending.size === 0) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const idx = parseInt(entry.target.getAttribute('data-page-idx') ?? '')
        if (!isNaN(idx) && !thumbUrls[idx]) onLoadThumb(idx)
        observer.unobserve(entry.target)
      }
    }, { root: el, rootMargin: '200px' })
    el.querySelectorAll('[data-page-idx]').forEach(item => {
      const idx = parseInt(item.getAttribute('data-page-idx') ?? '')
      if (!isNaN(idx) && !thumbUrls[idx]) observer.observe(item)
    })
    return () => observer.disconnect()
  }, [pages.length])

  if (collapsed) {
    return (
      <button onClick={onToggleCollapse}
        className="w-6 shrink-0 bg-gray-900 border-r border-gray-800 hover:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer"
        title="展开缩略图"
      >
        <span className="text-xs">◀</span>
      </button>
    )
  }

  const activePages = pages.filter(p => !p.deleted)

  return (
    <aside className="w-48 shrink-0 border-r border-gray-800 bg-gray-900/30 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800 shrink-0">
        <span className="text-xs font-semibold text-gray-300">页面</span>
        <button onClick={onToggleCollapse} className="text-gray-500 hover:text-white text-xs cursor-pointer">▶</button>
      </div>
      <div ref={thumbContainerRef} onClick={handleContainerClick} className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {activePages.map((page, idx) => {
          const isDragOver = dragOverIndex === idx && dragIndex !== idx
          return (
            <div key={page.id}
              data-page-idx={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={handleDrop}
              onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
              onClick={() => onSetCurrentPage(idx)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                isDragOver
                  ? 'border border-blue-500 bg-blue-500/20'
                  : dragIndex === idx
                    ? 'opacity-50 border border-blue-400 bg-gray-700/80'
                    : idx === currentPageIndex
                      ? 'bg-blue-600/20 border border-blue-500/40'
                      : 'hover:bg-gray-800/60 border border-transparent'
              }`}
            >
              <span className="text-xs text-gray-600 cursor-grab active:cursor-grabbing select-none">⠿</span>
              {thumbUrls[idx] ? (
                <img src={thumbUrls[idx]} alt={`Page ${idx + 1}`}
                  className="w-10 h-14 object-cover rounded shrink-0" />
              ) : (
                <div className="w-10 h-14 rounded bg-gray-800 shrink-0 flex items-center justify-center">
                  <span className="text-[9px] text-gray-600">{idx + 1}</span>
                </div>
              )}
              <span className="text-[10px] text-gray-500 truncate">第 {idx + 1} 页</span>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
