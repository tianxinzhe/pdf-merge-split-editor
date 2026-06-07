import { useCallback, useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'

interface FilePanelProps {
  hasSource: boolean
  onDrop: (files: File[]) => void
}

export function FilePanel({ hasSource, onDrop }: FilePanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [images, setImages] = useState<{ file: File; dataUrl: string }[]>([])
  const [merging, setMerging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
  const handleDragLeave = useCallback(() => setIsDragging(false), [])
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf' || f.type.startsWith('image/'))
    const pdfs = files.filter(f => f.type === 'application/pdf')
    if (pdfs.length > 0) onDrop(pdfs)
    const imgs = files.filter(f => f.type.startsWith('image/'))
    if (imgs.length > 0) addImages(imgs)
  }, [onDrop])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) onDrop(files)
    e.target.value = ''
  }, [onDrop])

  const addImages = useCallback(async (files: File[]) => {
    const entries: { file: File; dataUrl: string }[] = []
    for (const f of files) {
      const dataUrl = await new Promise<string>(resolve => {
        const r = new FileReader()
        r.onload = () => resolve(r.result as string)
        r.readAsDataURL(f)
      })
      entries.push({ file: f, dataUrl })
    }
    setImages(prev => [...prev, ...entries])
  }, [])

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) addImages(files)
    e.target.value = ''
  }, [addImages])

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }, [])

  const moveImageUp = useCallback((index: number) => {
    if (index === 0) return
    setImages(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }, [])

  const moveImageDown = useCallback((index: number) => {
    setImages(prev => {
      if (index >= prev.length - 1) return prev
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }, [])

  const mergeToPdf = useCallback(async () => {
    if (images.length === 0) return
    setMerging(true)
    try {
      const pdfDoc = await PDFDocument.create()
      for (const img of images) {
        const imgBytes = Uint8Array.from(atob(img.dataUrl.split(',')[1]), c => c.charCodeAt(0))
        let pdfImg
        if (img.file.type === 'image/png') {
          pdfImg = await pdfDoc.embedPng(imgBytes)
        } else {
          pdfImg = await pdfDoc.embedJpg(imgBytes)
        }
        const page = pdfDoc.addPage([pdfImg.width, pdfImg.height])
        page.drawImage(pdfImg, { x: 0, y: 0, width: pdfImg.width, height: pdfImg.height })
      }
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'merged_images.pdf'; a.click()
      URL.revokeObjectURL(url)
      setImages([])
    } catch (e) {
      alert('合并失败: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setMerging(false)
    }
  }, [images])

  return (
    <aside className="w-56 shrink-0 border-r border-gray-800 bg-gray-900/50 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-800">
        <div className="text-xs font-semibold text-gray-400 mb-2">文件</div>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/50'}`}
        >
          <div className="text-xl mb-1">{hasSource ? '📄' : '📎'}</div>
          <p className="text-xs text-gray-400">{hasSource ? '替换 PDF' : '拖入 PDF'}</p>
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf,image/*" multiple onChange={handleFileSelect} className="hidden" />
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-400 mb-2">图片合成 PDF</div>
        <div
          onClick={() => imgInputRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-3 text-center cursor-pointer border-gray-700 hover:border-gray-500 hover:bg-gray-800/50 transition-all"
        >
          <div className="text-xl mb-1">🖼️</div>
          <p className="text-xs text-gray-400">上传图片</p>
        </div>
        <input ref={imgInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />

        {images.length > 0 && (
          <div className="mt-2 space-y-1">
            {images.map((img, i) => (
              <div key={i} className="flex items-center justify-between px-2 py-1 rounded bg-gray-800 text-xs">
                <span className="text-gray-300 truncate flex-1">{img.file.name}</span>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => moveImageUp(i)} disabled={i===0} className="text-gray-500 hover:text-gray-300 disabled:opacity-20">▲</button>
                  <button onClick={() => moveImageDown(i)} disabled={i===images.length-1} className="text-gray-500 hover:text-gray-300 disabled:opacity-20">▼</button>
                  <button onClick={() => removeImage(i)} className="text-gray-500 hover:text-red-400 ml-0.5">✕</button>
                </div>
              </div>
            ))}
            <button
              onClick={mergeToPdf}
              disabled={merging}
              className="w-full mt-2 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-medium transition-colors"
            >
              {merging ? '合并中...' : `合并 ${images.length} 张图片 → PDF`}
            </button>
          </div>
        )}

        {images.length === 0 && (
          <div className="mt-4 text-center text-gray-600">
            <p className="text-xs">上传 JPG/PNG</p>
            <p className="text-xs mt-1">自动合成为一个 PDF</p>
          </div>
        )}
      </div>
    </aside>
  )
}
