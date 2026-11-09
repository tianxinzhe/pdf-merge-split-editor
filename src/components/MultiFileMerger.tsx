import { useCallback, useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { useI18n } from '../i18n'
import { ToolGuide } from './ToolGuide'
import type { MergerFileItem } from '../types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf'
}

interface MultiFileMergerProps {
  onSendToEditor: (name: string, binary: ArrayBuffer) => void
  /** Restrict input to images and present the UI as image → PDF. */
  imagesOnly?: boolean
}

export function MultiFileMerger({ onSendToEditor, imagesOnly = false }: MultiFileMergerProps) {
  const { t } = useI18n()
  const [files, setFiles] = useState<MergerFileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [merging, setMerging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(async (inputFiles: File[]) => {
    const allowed = imagesOnly
      ? inputFiles.filter(isImageFile)
      : inputFiles.filter(file => isPdfFile(file) || isImageFile(file))
    if (imagesOnly && allowed.length < inputFiles.length) {
      alert(t.img2pdf.rejectPdf)
    }
    const items: MergerFileItem[] = []
    for (const f of allowed) {
      const binary = await f.arrayBuffer()
      const type = f.type === 'application/pdf' ? 'pdf' : 'image'
      items.push({ id: generateId(), name: f.name, type, binary })
    }
    if (items.length > 0) setFiles(prev => [...prev, ...items])
  }, [imagesOnly, t])

  const clearAll = useCallback(() => {
    setFiles([])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const inputFiles = Array.from(e.dataTransfer.files)
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
        const src = await PDFDocument.load(item.binary, { ignoreEncryption: true })
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

  const outputName = imagesOnly ? 'images.pdf' : 'merged.pdf'

  const handleDirectDownload = useCallback(async () => {
    if (files.length === 0) return
    setMerging(true)
    try {
      const bytes = await doMerge()
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = outputName; a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      alert(imagesOnly ? t.img2pdf.mergeFailed(message) : t.merger.mergeFailed(message))
    } finally { setMerging(false) }
  }, [files, doMerge, outputName, imagesOnly, t])

  const handleSendToEditor = useCallback(async () => {
    if (files.length === 0) return
    setMerging(true)
    try {
      const bytes = await doMerge()
      onSendToEditor(outputName, bytes.buffer as ArrayBuffer)
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      alert(imagesOnly ? t.img2pdf.mergeFailed(message) : t.merger.mergeFailed(message))
    } finally { setMerging(false) }
  }, [files, doMerge, outputName, onSendToEditor, imagesOnly, t])

  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="bg-gray-900/60 rounded-2xl p-5 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">
            {t.nav[imagesOnly ? 'img2pdf' : 'merger']}
          </h2>

          {/* Drop zone / file list */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => files.length === 0 && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl transition-all ${
              isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700'
            } ${
              files.length === 0
                ? 'min-h-48 p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-800/30'
                : 'p-4'
            }`}
          >
            {files.length === 0 ? (
              <>
                <span className="text-4xl mb-3">{imagesOnly ? '🖼️' : '📂'}</span>
                <p className="text-sm text-gray-400">{imagesOnly ? t.img2pdf.dropTitle : t.merger.dropTitle}</p>
                <p className="text-xs text-gray-400 mt-1">{imagesOnly ? t.img2pdf.dropHint : t.merger.dropHint}</p>
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
                      <span className="text-xs text-gray-500 cursor-grab active:cursor-grabbing">⠿</span>
                      <span className="text-lg shrink-0">{item.type === 'pdf' ? '📄' : '🖼️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">
                          {item.type === 'pdf'
                            ? t.merger.pdf
                            : imagesOnly ? t.img2pdf.imageLabel : t.merger.image}
                          {' · '}
                          {(item.binary.byteLength / 1024).toFixed(0)} KB
                        </p>
                      </div>
                      <div className={dragIndex !== null || dragOverIndex !== null ? '' : 'opacity-0 group-hover:opacity-100 transition-opacity'}>
                        <button onClick={() => removeFile(item.id)}
                          className="w-6 h-6 rounded bg-gray-700 hover:bg-red-600/80 text-xs text-gray-300 flex items-center justify-center cursor-pointer">✕</button>
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 border-2 border-dashed border-gray-700 hover:border-gray-500 rounded-xl text-xs text-gray-400 hover:text-gray-300 transition-colors cursor-pointer">
                  {imagesOnly ? t.img2pdf.addFiles : t.merger.addFiles}
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={imagesOnly ? 'image/*' : '.pdf,image/*'}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {files.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <button onClick={clearAll}
                className="w-full sm:w-auto px-3 py-2 rounded-lg bg-gray-800 hover:bg-red-900/50 text-xs text-gray-400 hover:text-red-300 transition-colors cursor-pointer shrink-0">
                {imagesOnly ? t.img2pdf.clearAll : t.merger.clearAll}
              </button>
              <button onClick={handleDirectDownload} disabled={merging}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer">
                {merging
                  ? (imagesOnly ? t.img2pdf.merging : t.merger.merging)
                  : (imagesOnly ? t.img2pdf.download : t.merger.download)}
              </button>
              <button onClick={handleSendToEditor} disabled={merging}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer">
                {imagesOnly ? t.img2pdf.sendToEditor : t.merger.sendToEditor}
              </button>
            </div>
          )}
        </div>

        <ToolGuide copy={imagesOnly ? t.guides.img2pdf : t.guides.merger} />
      </div>
    </div>
  )
}