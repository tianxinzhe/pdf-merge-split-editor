import { useState, useCallback, useRef, useEffect } from 'react'

interface PasswordDialogProps {
  fileName: string
  error?: string
  onSubmit: (password: string) => void
  onCancel: () => void
}

export function PasswordDialog({ fileName, error, onSubmit, onCancel }: PasswordDialogProps) {
  const [password, setPassword] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim()) onSubmit(password)
  }, [password, onSubmit])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}>
      <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-[380px] p-6"
        onClick={e => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="text-3xl mb-2">🔐</div>
          <h3 className="text-sm font-semibold text-white mb-1">PDF 已加密</h3>
          <p className="text-sm text-gray-400 truncate">{fileName}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="输入密码..."
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none mb-3"
          />
          {error && (
            <p className="text-sm text-red-400 mb-3">{error}</p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onCancel}
              className="flex-1 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-[12px] text-gray-300 transition-colors">
              取消
            </button>
            <button type="submit" disabled={!password.trim()}
              className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-[12px] text-white font-medium transition-colors">
              解锁
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
