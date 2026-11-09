import { useCallback, useRef, useState, type DragEvent } from 'react'
import { useI18n } from '../i18n'
import { ToolGuide } from './ToolGuide'

interface EncryptFile {
  name: string
  binary: ArrayBuffer
}

interface PermissionState {
  print: boolean
  copy: boolean
  modify: boolean
  annotate: boolean
  fillForms: boolean
  assemble: boolean
}

const DEFAULT_PERMISSIONS: PermissionState = {
  print: true,
  copy: false,
  modify: false,
  annotate: true,
  fillForms: true,
  assemble: false,
}

export function PdfEncrypt() {
  const { t } = useI18n()
  const [file, setFile] = useState<EncryptFile | null>(null)
  const [userPassword, setUserPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [permissions, setPermissions] = useState<PermissionState>(DEFAULT_PERMISSIONS)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectFile = useCallback(async (input: File | undefined) => {
    if (!input || input.type !== 'application/pdf') return
    const binary = await input.arrayBuffer()
    setFile({ name: input.name, binary })
    setError('')
    setDone(false)
  }, [])

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    void selectFile(Array.from(event.dataTransfer.files).find(item => item.type === 'application/pdf'))
  }, [selectFile])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    void selectFile(event.target.files?.[0])
    event.target.value = ''
  }, [selectFile])

  const togglePermission = useCallback((key: keyof PermissionState) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const handleEncrypt = useCallback(async () => {
    if (!file) return
    if (!userPassword) {
      setError(t.encrypt.passwordRequired)
      return
    }
    if (userPassword !== confirmPassword) {
      setError(t.encrypt.passwordMismatch)
      return
    }

    setBusy(true)
    setError('')
    setDone(false)
    try {
      const { PDF } = await import('@libpdf/core')
      const pdf = await PDF.load(new Uint8Array(file.binary))
      if (pdf.isEncrypted) {
        setError(t.encrypt.alreadyEncrypted)
        return
      }

      pdf.setProtection({
        userPassword,
        ownerPassword: ownerPassword || undefined,
        algorithm: 'AES-256',
        permissions: {
          print: permissions.print,
          printHighQuality: permissions.print,
          modify: permissions.modify,
          copy: permissions.copy,
          annotate: permissions.annotate,
          fillForms: permissions.fillForms,
          accessibility: true,
          assemble: permissions.assemble,
        },
      })

      const bytes = await pdf.save()
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `protected_${file.name}`
      anchor.click()
      URL.revokeObjectURL(url)
      setDone(true)
    } catch (exception) {
      const message = exception instanceof Error ? exception.message : String(exception)
      setError(/password|encrypt|decrypt/i.test(message)
        ? t.encrypt.alreadyEncrypted
        : t.encrypt.encryptFailed(message))
    } finally {
      setBusy(false)
    }
  }, [file, userPassword, confirmPassword, ownerPassword, permissions, t])

  const permissionRows: Array<{ key: keyof PermissionState; label: string }> = [
    { key: 'print', label: t.encrypt.permissionPrint },
    { key: 'copy', label: t.encrypt.permissionCopy },
    { key: 'modify', label: t.encrypt.permissionModify },
    { key: 'annotate', label: t.encrypt.permissionAnnotate },
    { key: 'fillForms', label: t.encrypt.permissionForms },
    { key: 'assemble', label: t.encrypt.permissionAssemble },
  ]

  return (
    <div className="flex-1 flex flex-col items-center overflow-y-auto p-6">
      <div className="w-full max-w-2xl space-y-5">
        <div className="bg-gray-900/60 rounded-2xl p-5 border border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200">{t.encrypt.title}</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-400">{t.encrypt.subtitle}</p>

          <div
            onDragOver={event => { event.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`mt-4 border-2 border-dashed rounded-xl p-5 text-center transition-all ${
              dragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-500 hover:bg-gray-800/30'
            } ${!file ? 'cursor-pointer' : ''}`}
          >
            {file ? (
              <div className="flex items-center gap-3 text-left">
                <span className="text-lg">📄</span>
                <span className="min-w-0 flex-1 truncate text-xs text-gray-300" title={file.name}>{file.name}</span>
                <button
                  type="button"
                  onClick={event => { event.stopPropagation(); fileInputRef.current?.click() }}
                  className="shrink-0 rounded-lg border border-gray-700 px-2.5 py-1 text-[11px] text-gray-300 hover:border-gray-500 hover:text-white cursor-pointer"
                >
                  {t.encrypt.changeFile}
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">{t.encrypt.dropTitle}</p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {file && (
            <div className="mt-5 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-[11px] text-gray-400">{t.encrypt.userPassword}</span>
                  <input
                    type="password"
                    value={userPassword}
                    onChange={event => { setUserPassword(event.target.value); setError('') }}
                    placeholder={t.encrypt.userPasswordPlaceholder}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[11px] text-gray-400">{t.encrypt.confirmPassword}</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={event => { setConfirmPassword(event.target.value); setError('') }}
                    placeholder={t.encrypt.confirmPasswordPlaceholder}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </label>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-500">{t.encrypt.userPasswordHint}</p>

              <label className="block">
                <span className="mb-1 block text-[11px] text-gray-400">{t.encrypt.ownerPassword}</span>
                <input
                  type="password"
                  value={ownerPassword}
                  onChange={event => setOwnerPassword(event.target.value)}
                  placeholder={t.encrypt.ownerPasswordPlaceholder}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <span className="mt-1 block text-[11px] leading-relaxed text-gray-500">{t.encrypt.ownerPasswordHint}</span>
              </label>

              <div>
                <p className="mb-2 text-[11px] text-gray-400">{t.encrypt.permissions}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {permissionRows.map(row => (
                    <label
                      key={row.key}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-800 bg-gray-800/40 px-3 py-2 text-[11px] text-gray-300 hover:border-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={permissions[row.key]}
                        onChange={() => togglePermission(row.key)}
                        className="accent-blue-500"
                      />
                      <span>{row.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200/80">
                {t.encrypt.encryptionNote}
              </p>

              {error && <p className="text-xs text-red-400">{error}</p>}
              {done && <p className="text-xs text-emerald-400">✅ {t.encrypt.success}</p>}

              <button
                type="button"
                onClick={handleEncrypt}
                disabled={busy}
                className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500 disabled:opacity-40 cursor-pointer"
              >
                {busy ? t.encrypt.encrypting : t.encrypt.encrypt}
              </button>
            </div>
          )}
        </div>
        <ToolGuide copy={t.guides.encrypt} />
      </div>
    </div>
  )
}