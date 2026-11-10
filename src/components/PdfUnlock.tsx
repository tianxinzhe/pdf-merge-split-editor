import { useCallback, useRef, useState } from 'react'
import { unlockOwnerPassword, unlockUserPassword } from '../utils/pdf-unlock'
import { useI18n } from '../i18n'
import { ToolGuide } from './ToolGuide'

interface PasswordFile {
  id: string; name: string; binary: ArrayBuffer
  status: 'pending' | 'done' | 'error'; error?: string
}

export function PdfUnlock() {
  const { t } = useI18n()
  const [pwFiles, setPwFiles] = useState<PasswordFile[]>([])
  const [pwMode, setPwMode] = useState<'owner' | 'user'>('owner')
  const [pwDragging, setPwDragging] = useState(false)
  const [pwPrompt, setPwPrompt] = useState<{ fileId: string; fileName: string } | null>(null)
  const [pwInput, setPwInput] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwProcessing, setPwProcessing] = useState(false)
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false)
  const pwInputRef = useRef<HTMLInputElement>(null)

  const addPwFiles = useCallback(async (inputFiles: File[]) => {
    const items: PasswordFile[] = []
    for (const f of inputFiles) {
      if (f.type !== 'application/pdf') continue
      const binary = await f.arrayBuffer()
      items.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, name: f.name, binary, status: 'pending' })
    }
    setPwFiles(prev => [...prev, ...items])
  }, [])

  const resetFileStatus = useCallback((id: string) => {
    setPwFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'pending', error: undefined } : f))
  }, [])

  const handleModeChange = useCallback((mode: 'owner' | 'user') => {
    setPwMode(mode)
    setPwPrompt(null)
    setPwInput('')
    setPwError('')
    setPwFiles(prev => prev.map(f => f.status === 'pending' ? f : { ...f, status: 'pending', error: undefined }))
  }, [])

  const handlePwDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setPwDragging(false)
    const inputFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf')
    if (inputFiles.length > 0) addPwFiles(inputFiles)
  }, [addPwFiles])

  const handlePwFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = Array.from(e.target.files || [])
    if (inputFiles.length > 0) addPwFiles(inputFiles)
    e.target.value = ''
  }, [addPwFiles])

  const removeOwnerLock = useCallback(async (file: PasswordFile) => {
    try {
      const bytes = await unlockOwnerPassword(file.binary)
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `unlocked_${file.name}`; a.click()
      URL.revokeObjectURL(url)
      setPwFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'done' as const } : f))
    } catch (e) {
      const message = e instanceof Error && e.message === 'NOT_OWNER_ONLY'
        ? t.unlock.needsPassword
        : (e instanceof Error ? e.message : String(e))
      setPwFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'error' as const, error: message } : f))
    }
  }, [t])

  const handlePwProcess = useCallback(async () => {
    if (pwFiles.length === 0) return
    setPwProcessing(true)
    if (pwMode === 'owner') {
      for (const file of pwFiles.filter(f => f.status === 'pending')) await removeOwnerLock(file)
    } else {
      const pending = pwFiles.find(f => f.status === 'pending')
      if (pending) setPwPrompt({ fileId: pending.id, fileName: pending.name })
    }
    setPwProcessing(false)
  }, [pwFiles, pwMode, removeOwnerLock])

  const handlePwConfirm = useCallback(async () => {
    if (!pwPrompt || !pwInput) return
    setPwError('')
    const file = pwFiles.find(f => f.id === pwPrompt.fileId)
    if (!file) return
    try {
      const bytes = await unlockUserPassword(file.binary, pwInput)
      const downloadBlob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(downloadBlob)
      const a = document.createElement('a')
      a.href = url; a.download = `decrypted_${file.name}`; a.click()
      URL.revokeObjectURL(url)
      setPwFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'done' as const } : f))
      setPwPrompt(null); setPwInput('')
    } catch {
      setPwError(t.unlock.wrongPassword)
    }
  }, [pwPrompt, pwInput, pwFiles, t])

  const hasPending = pwFiles.some(f => f.status === 'pending')
  const allDone = pwFiles.length > 0 && !hasPending

  const handleMainAction = () => {
    if (allDone) {
      setPwFiles(prev => prev.map(f => ({ ...f, status: 'pending' as const, error: undefined })))
      return
    }
    void handlePwProcess()
  }

  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="bg-gray-900/60 rounded-2xl p-5 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">{t.unlock.title}</h2>

          <div className="space-y-2 mb-4">
            <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              pwMode === 'owner' ? 'bg-blue-600/10 border border-blue-500/40' : 'border border-gray-700/50 hover:bg-gray-800/50'
            }`}>
              <input type="radio" name="pwMode" checked={pwMode === 'owner'} disabled={pwProcessing}
                onChange={() => handleModeChange('owner')} className="accent-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-200">{t.unlock.ownerTitle}</p>
                <p className="text-sm text-gray-400 mt-0.5">{t.unlock.ownerDesc}</p>
              </div>
            </label>
            <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
              pwMode === 'user' ? 'bg-blue-600/10 border border-blue-500/40' : 'border border-gray-700/50 hover:bg-gray-800/50'
            }`}>
              <input type="radio" name="pwMode" checked={pwMode === 'user'} disabled={pwProcessing}
                onChange={() => handleModeChange('user')} className="accent-blue-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-200">{t.unlock.userTitle}</p>
                <p className="text-sm text-gray-400 mt-0.5">{t.unlock.userDesc}</p>
              </div>
            </label>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setPwDragging(true) }}
            onDragLeave={() => setPwDragging(false)}
            onDrop={handlePwDrop}
            onClick={() => pwFiles.length === 0 && pwInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
              pwDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
            } ${pwFiles.length === 0 ? 'cursor-pointer' : ''}`}
          >
            {pwFiles.length === 0 ? (
              <p className="text-sm text-gray-400">{t.unlock.dropTitle}</p>
            ) : (
              <div className="space-y-1.5 text-left">
                {pwFiles.map(f => (
                  <div key={f.id} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-gray-800/60">
                    <span className="text-sm leading-5">{f.status === 'done' ? '✅' : f.status === 'error' ? '❌' : '📄'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-300 truncate">{f.name}</p>
                      {f.status === 'error' && <p className="mt-0.5 text-[11px] leading-relaxed text-red-400 break-words">{f.error}</p>}
                    </div>
                    {f.status !== 'pending' && (
                      <button onClick={() => resetFileStatus(f.id)} title={t.unlock.reprocess}
                        aria-label={t.unlock.reprocess}
                        className="text-gray-400 hover:text-blue-400 text-xs cursor-pointer shrink-0">↻</button>
                    )}
                    <button onClick={() => setPwFiles(prev => prev.filter(x => x.id !== f.id))}
                      className="text-gray-400 hover:text-red-400 text-xs cursor-pointer shrink-0">✕</button>
                  </div>
                ))}
                <button onClick={() => pwInputRef.current?.click()}
                  className="w-full py-1.5 text-xs text-gray-400 hover:text-gray-300 cursor-pointer">{t.unlock.addMore}</button>
              </div>
            )}
          </div>
          <input ref={pwInputRef} type="file" accept=".pdf" multiple onChange={handlePwFileSelect} className="hidden" />

          {pwFiles.length > 0 && (
            <>
              <label className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ownershipConfirmed}
                  disabled={pwProcessing}
                  onChange={e => setOwnershipConfirmed(e.target.checked)}
                  className="mt-0.5 shrink-0 accent-emerald-500"
                />
                <span>
                  {t.unlock.ownership}{' '}
                  <a href="/terms/" target="_blank" rel="noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-blue-400 hover:text-blue-300 hover:underline">
                    {t.common.footer.terms}
                  </a>
                </span>
              </label>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{t.unlock.ownershipHint}</p>
              <button onClick={handleMainAction} disabled={pwProcessing || !ownershipConfirmed}
                className="w-full mt-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-emerald-600/20">
                {pwProcessing
                  ? t.unlock.processing
                  : allDone
                    ? t.unlock.reprocess
                    : pwMode === 'owner' ? t.unlock.unlockOwner : t.unlock.unlockUser}
              </button>
            </>
          )}
          {pwFiles.length > 0 && !hasPending && (
            <p className="mt-2 text-[11px] text-gray-400">{t.unlock.reprocessHint}</p>
          )}
          <p className="mt-3 text-[11px] leading-relaxed text-gray-500">{t.unlock.disclaimer}</p>
        </div>
        <ToolGuide copy={t.guides.unlock} />
      </div>

      {/* Password prompt overlay */}
      {pwPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 space-y-4">
            <p className="text-sm text-gray-200">{t.unlock.detected(pwPrompt.fileName)}</p>
            <p className="text-xs text-gray-400">{t.unlock.enterPassword}</p>
            <input type="password" value={pwInput} onChange={e => setPwInput(e.target.value)}
              placeholder={t.unlock.passwordPlaceholder}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && handlePwConfirm()} autoFocus />
            {pwError && <p className="text-xs text-red-400">{pwError}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setPwPrompt(null); setPwInput(''); setPwError('') }}
                className="flex-1 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 cursor-pointer">{t.unlock.cancel}</button>
              <button onClick={handlePwConfirm}
                className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-medium cursor-pointer">{t.unlock.confirm}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}