import { useCallback, useRef, useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { pdfLoadingOptions } from '../utils/pdfjs-config'
import { unlockOwnerPassword } from '../utils/pdf-unlock'

interface PasswordHubFile {
  id: string
  name: string
  binary: ArrayBuffer
  status: 'pending' | 'done' | 'error'
  error?: string
}

export function PasswordHub() {
  const [files, setFiles] = useState<PasswordHubFile[]>([])
  const [mode, setMode] = useState<'owner' | 'user'>('owner')
  const [isDragging, setIsDragging] = useState(false)
  const [passwordPrompt, setPasswordPrompt] = useState<{ fileId: string; fileName: string } | null>(null)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback(async (inputFiles: File[]) => {
    const items: PasswordHubFile[] = []
    for (const f of inputFiles) {
      if (f.type !== 'application/pdf') continue
      const binary = await f.arrayBuffer()
      items.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, name: f.name, binary, status: 'pending' })
    }
    setFiles(prev => [...prev, ...items])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const inputFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf')
    if (inputFiles.length > 0) addFiles(inputFiles)
  }, [addFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = Array.from(e.target.files || [])
    if (inputFiles.length > 0) addFiles(inputFiles)
    e.target.value = ''
  }, [addFiles])

  const removeOwnerLock = useCallback(async (file: PasswordHubFile) => {
    try {
      const bytes = await unlockOwnerPassword(file.binary)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `unlocked_${file.name}`; a.click()
      URL.revokeObjectURL(url)
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'done' as const } : f))
    } catch (e) {
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'error' as const, error: (e instanceof Error ? e.message : String(e)) } : f))
    }
  }, [])

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return
    setProcessing(true)
    if (mode === 'owner') {
      for (const file of files.filter(f => f.status === 'pending')) {
        await removeOwnerLock(file)
      }
    } else {
      // User password mode - prompt for password for first pending file
      const pending = files.find(f => f.status === 'pending')
      if (pending) {
        setPasswordPrompt({ fileId: pending.id, fileName: pending.name })
      }
    }
    setProcessing(false)
  }, [files, mode, removeOwnerLock])

  const handlePasswordConfirm = useCallback(async () => {
    if (!passwordPrompt || !passwordInput) return
    setPasswordError('')
    const file = files.find(f => f.id === passwordPrompt.fileId)
    if (!file) return
    try {
      const pdf = await pdfjsLib.getDocument({ ...pdfLoadingOptions, data: file.binary.slice(0), password: passwordInput }).promise
      // Re-create without encryption using pdf-lib
      const newDoc = await PDFDocument.create()
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const vp = page.getViewport({ scale: 2.5 })
        const canvas = document.createElement('canvas')
        canvas.width = vp.width; canvas.height = vp.height
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise
        const blob = await new Promise<Blob>(resolve => canvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92))
        const imgBytes = new Uint8Array(await blob.arrayBuffer())
        const img = await newDoc.embedJpg(imgBytes)
        const p = newDoc.addPage([vp.width, vp.height])
        p.drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height })
      }
      const bytes = await newDoc.save()
      const downloadBlob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(downloadBlob)
      const a = document.createElement('a')
      a.href = url; a.download = `decrypted_${file.name}`; a.click()
      URL.revokeObjectURL(url)
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'done' as const } : f))
      setPasswordPrompt(null); setPasswordInput('')
    } catch {
      setPasswordError('密码错误或文件无法解密')
    }
  }, [passwordPrompt, passwordInput, files])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-6">
        {/* Mode selection */}
        <div className="bg-gray-900/60 rounded-2xl p-5 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200 mb-3">选择解锁模式</h2>
          <div className="space-y-2">
            <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              mode === 'owner' ? 'bg-blue-600/10 border border-blue-500/40' : 'border border-gray-700/50 hover:bg-gray-800/50'
            }`}>
              <input type="radio" name="pwMode" checked={mode === 'owner'}
                onChange={() => setMode('owner')} className="accent-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-200">🚫 复制/打印权限解放</p>
                <p className="text-sm text-gray-500 mt-0.5">解除 Owner Lock：文件能打开，但限制了复制/打印/编辑</p>
              </div>
            </label>
            <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              mode === 'user' ? 'bg-blue-600/10 border border-blue-500/40' : 'border border-gray-700/50 hover:bg-gray-800/50'
            }`}>
              <input type="radio" name="pwMode" checked={mode === 'user'}
                onChange={() => setMode('user')} className="accent-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-200">🔓 打开密码彻底消灭</p>
                <p className="text-sm text-gray-500 mt-0.5">移除 User Lock：每次打开都要输密码的文件</p>
              </div>
            </label>
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => files.length === 0 && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
          } ${files.length === 0 ? 'cursor-pointer' : ''}`}
        >
          {files.length === 0 ? (
            <>
              <span className="text-3xl">⚡</span>
              <p className="text-sm text-gray-400 mt-2">拖入加密 PDF 文件</p>
            </>
          ) : (
            <div className="space-y-1.5 text-left">
              {files.map(f => (
                <div key={f.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/60">
                  <span className="text-sm">{f.status === 'done' ? '✅' : f.status === 'error' ? '❌' : '📄'}</span>
                  <span className="text-xs text-gray-300 truncate flex-1">{f.name}</span>
                  {f.status === 'error' && <span className="text-xs text-red-400">{f.error}</span>}
                  <button onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}
                    className="text-gray-600 hover:text-red-400 text-xs cursor-pointer">✕</button>
                </div>
              ))}
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full py-1.5 text-xs text-gray-500 hover:text-gray-300 cursor-pointer">+ 添加更多</button>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept=".pdf" multiple onChange={handleFileSelect} className="hidden" />

        {/* Action button */}
        {files.length > 0 && (
          <button onClick={handleProcess} disabled={processing || files.every(f => f.status === 'done')}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-emerald-600/20">
            {processing ? '处理中...' : mode === 'owner' ? '⚡ 一键解放权限' : '🔓 开始脱壳'}
          </button>
        )}
      </div>

      {/* Password prompt overlay */}
      {passwordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 space-y-4">
            <p className="text-sm text-gray-200">🔒 检测到 <strong className="text-white">{passwordPrompt.fileName}</strong> 有打开锁</p>
            <p className="text-xs text-gray-500">请输入原密码以完成脱壳</p>
            <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)}
              placeholder="输入文件密码"
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-600 focus:border-blue-500 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && handlePasswordConfirm()} autoFocus />
            {passwordError && <p className="text-xs text-red-400">{passwordError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setPasswordPrompt(null); setPasswordInput(''); setPasswordError('') }}
                className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 cursor-pointer">取消</button>
              <button onClick={handlePasswordConfirm}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium cursor-pointer">确认脱壳</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
