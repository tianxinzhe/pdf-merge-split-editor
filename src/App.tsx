import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { TopBar } from './components/TopBar'
import { HomePage } from './components/HomePage'
import { SiteFooter } from './components/SiteFooter'
import { useI18n } from './i18n'
import { TAB_PATHS } from './routes'
import type { TabId } from './types'
import { clearHandoff, loadHandoff, saveHandoff } from './utils/handoff'

const PageSplitter = lazy(() =>
  import('./components/PageSplitter').then(module => ({ default: module.PageSplitter })),
)
const EditorStudio = lazy(() =>
  import('./components/EditorStudio').then(module => ({ default: module.EditorStudio })),
)
const MultiFileMerger = lazy(() =>
  import('./components/MultiFileMerger').then(module => ({ default: module.MultiFileMerger })),
)
const ImageToPdf = lazy(() =>
  import('./components/ImageToPdf').then(module => ({ default: module.ImageToPdf })),
)
const Toolbox = lazy(() =>
  import('./components/Toolbox').then(module => ({ default: module.Toolbox })),
)
const PdfUnlock = lazy(() =>
  import('./components/PdfUnlock').then(module => ({ default: module.PdfUnlock })),
)
const PdfEncrypt = lazy(() =>
  import('./components/PdfEncrypt').then(module => ({ default: module.PdfEncrypt })),
)

interface AppProps {
  page: TabId
}

export default function App({ page }: AppProps) {
  const { t } = useI18n()
  const [injectedFile, setInjectedFile] = useState<{ name: string; binary: ArrayBuffer } | null>(null)

  useEffect(() => {
    if (page !== 'editor') return
    let cancelled = false
    loadHandoff()
      .then(file => {
        if (!cancelled && file) setInjectedFile(file)
      })
      .catch(error => console.warn('Failed to load editor handoff', error))
    return () => { cancelled = true }
  }, [page])

  const handleInjectedFileConsumed = useCallback(() => {
    setInjectedFile(null)
    void clearHandoff()
  }, [])

  const handleSendToEditor = useCallback(async (name: string, binary: ArrayBuffer) => {
    try {
      await saveHandoff({ name, binary })
    } catch (error) {
      window.alert(t.editor.operationFailed(String(error)))
      return
    }
    window.location.assign(TAB_PATHS.editor)
  }, [t])

  return (
    <div className="h-dvh w-full flex flex-col bg-gray-950 text-white overflow-hidden font-sans">
      <TopBar activeTab={page} />
      <div className="flex-1 min-h-0 flex overflow-hidden relative">
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
              {t.common.loading}
            </div>
          }
        >
          {page === 'home' && <HomePage />}
          {page === 'splitter' && <PageSplitter />}
          {page === 'editor' && (
            <EditorStudio
              injectedFile={injectedFile}
              onInjectedFileConsumed={handleInjectedFileConsumed}
            />
          )}
          {page === 'merger' && <MultiFileMerger onSendToEditor={handleSendToEditor} />}
          {page === 'img2pdf' && <ImageToPdf onSendToEditor={handleSendToEditor} />}
          {page === 'toolbox' && <Toolbox />}
          {page === 'unlock' && <PdfUnlock />}
          {page === 'encrypt' && <PdfEncrypt />}
        </Suspense>
      </div>
      <SiteFooter />
    </div>
  )
}