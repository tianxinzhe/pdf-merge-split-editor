import { useCallback, useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { unlockOwnerPassword } from '../utils/pdf-unlock'
import type { MergerFileItem } from '../types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface MultiFileMergerProps {
  onSendToEditor: (name: string, binary: ArrayBuffer) => void
}

export function MultiFileMerger({ onSendToEditor }: MultiFileMergerProps) {
  const [files, setFiles] = useState<MergerFileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [merging, setMerging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(async (inputFiles: File[]) => {
    const items: MergerFileItem[] = []
    for (const f of inputFiles) {
      const binary = await f.arrayBuffer()
      const type = f.type === 'application/pdf' ? 'pdf' : 'image'
      items.push({ id: generateId(), name: f.name, type, binary })
    }
    setFiles(prev => [...prev, ...items])
  }, [])

  const clearAll = useCallback(() => {
    setFiles([])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const inputFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type === 'application/pdf' || f.type.startsWith('image/')
    )
    if (inputFiles.length > 0) addFiles(inputFiles)
  }, [addFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = Array.from(e.target.files || [])
    if (inputFiles.length > 0) addFiles(inputFiles)
    e.target.value = ''
  }, [addFiles])

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }, [])

  const moveFile = useCallback((index: number, direction: 'up' | 'down') => {
    setFiles(prev => {
      const next = [...prev]
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }, [])

  const handleDragStart = useCallback((idx: number) => {
    setDragIndex(idx)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDragOverIndex(idx)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDropReorder = useCallback(() => {
    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) {
      setDragIndex(null); setDragOverIndex(null); return
    }
    setFiles(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(dragOverIndex, 0, moved)
      return next
    })
    setDragIndex(null); setDragOverIndex(null)
  }, [dragIndex, dragOverIndex])

  const doMerge = useCallback(async (): Promise<Uint8Array> => {
    const merged = await PDFDocument.create()
    for (const item of files) {
      if (item.type === 'pdf') {
        let srcBin: ArrayBuffer | Uint8Array = item.binary
        try { srcBin = await unlockOwnerPassword(item.binary) } catch { }
        const src = await PDFDocument.load(srcBin, { ignoreEncryption: true })
        const pages = await merged.copyPages(src, src.getPageIndices())
        pages.forEach(p => merged.addPage(p))
      } else {
        const imgBytes = new Uint8Array(item.binary)
        let pdfImg
        if (item.name.toLowerCase().endsWith('.png')) {
          pdfImg = await merged.embedPng(imgBytes)
        } else {
          pdfImg = await merged.embedJpg(imgBytes)
        }
        const page = merged.addPage([pdfImg.width, pdfImg.height])
        page.drawImage(pdfImg, { x: 0, y: 0, width: pdfImg.width, height: pdfImg.height })
      }
    }
    return await merged.save()
  }, [files])

  const handleDirectDownload = useCallback(async () => {
    if (files.length === 0) return
    setMerging(true)
    try {
      const bytes = await doMerge()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'merged.pdf'; a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('合并失败: ' + (e instanceof Error ? e.message : String(e)))
    } finally { setMerging(false) }
  }, [files, doMerge])

  const handleSendToEditor = useCallback(async () => {
    if (files.length === 0) return
    setMerging(true)
    try {
      const bytes = await doMerge()
      onSendToEditor('merged.pdf', bytes.buffer as ArrayBuffer)
    } catch (e) {
      alert('合并失败: ' + (e instanceof Error ? e.message : String(e)))
    } finally { setMerging(false) }
  }, [files, doMerge, onSendToEditor])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Drop zone / file list */}
      <div className="flex-1 overflow-y-auto p-6">
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => files.length === 0 && fileInputRef.current?.click()}
          className={`min-h-48 border-2 border-dashed rounded-2xl transition-all ${
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700'
          } ${files.length === 0 ? 'flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-800/30' : 'p-4'}`}
        >
          {files.length === 0 ? (
            <>
              <span className="text-4xl mb-3">📂</span>
              <p className="text-sm text-gray-400">拖入多个 PDF 或图片文件</p>
              <p className="text-xs text-gray-600 mt-1">支持混合格式，像叠乐高一样拼接</p>
            </>
          ) : (
            <div className="space-y-2">
              {files.map((item, idx) => {
                const isDragOver = dragOverIndex === idx && dragIndex !== idx
                return (
                  <div key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={e => handleDragOver(e, idx)}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDropReorder}
                    onDragEnd={() => { setDragIndex(null); setDragOverIndex(null) }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors cursor-grab active:cursor-grabbing ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-500/20'
                        : dragIndex === idx
                          ? 'border-blue-400 bg-gray-700/80 opacity-50'
                          : 'bg-gray-800/60 border-gray-700/50 group hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-xs text-gray-600 cursor-grab active:cursor-grabbing">⠿</span>
                    <span className="text-lg shrink-0">{item.type === 'pdf' ? '📄' : '🖼️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.type === 'pdf' ? 'PDF' : '图片'} · {(item.binary.byteLength / 1024).toFixed(0)} KB</p>
                    </div>
                    <div className={dragIndex !== null || dragOverIndex !== null ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}>
                      <button onClick={() => removeFile(item.id)}
                        className="w-6 h-6 rounded bg-gray-700 hover:bg-red-600/80 text-xs text-gray-300 flex items-center justify-center cursor-pointer">✕</button>
                    </div>
                  </div>
                )
              })}
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-xl text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                + 继续添加文件
              </button>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,image/*" multiple onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Bottom action bar */}
      {files.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-800 flex items-center gap-3 shrink-0">
          <button onClick={clearAll}
            className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-red-900/50 text-xs text-gray-400 hover:text-red-300 transition-colors cursor-pointer shrink-0">
            清空全部
          </button>
          <button onClick={handleDirectDownload} disabled={merging}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer">
            {merging ? '合并中...' : '💾 闪电合并并直接下载'}
          </button>
          <button onClick={handleSendToEditor} disabled={merging}
            className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer">
            ✍️ 合并并送入精修工作室 →
          </button>
        </div>
      )}
    </div>
  )
}
