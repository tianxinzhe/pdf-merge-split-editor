import { useCallback, useState } from 'react'
import { TopBar } from './components/TopBar'
import { PageSplitter } from './components/PageSplitter'
import { EditorStudio } from './components/EditorStudio'
import { MultiFileMerger } from './components/MultiFileMerger'
import { PasswordHub } from './components/PasswordHub'
import type { TabId } from './types'
import './utils/pdfjs-config' // Initialize pdfjs worker + wasm globally

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('splitter')
  const [injectedFile, setInjectedFile] = useState<{ name: string; binary: ArrayBuffer } | null>(null)

  // Track which tabs have been visited (lazy mount, then keep alive)
  const [mountedTabs, setMountedTabs] = useState<Set<TabId>>(new Set(['splitter']))

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab)
    setMountedTabs(prev => {
      if (prev.has(tab)) return prev
      const next = new Set(prev)
      next.add(tab)
      return next
    })
  }, [])

  // Merger -> Editor: merge file and switch to editor tab
  const handleSendToEditor = useCallback((name: string, binary: ArrayBuffer) => {
    setInjectedFile({ name, binary })
    handleTabChange('editor')
  }, [handleTabChange])

  const handleInjectedFileConsumed = useCallback(() => {
    setInjectedFile(null)
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-white overflow-hidden font-sans">
      <TopBar activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Keep-Alive: render each mounted tab, show/hide via CSS */}
        {mountedTabs.has('splitter') && (
          <div className={`absolute inset-0 flex ${activeTab === 'splitter' ? '' : 'invisible pointer-events-none'}`}>
            <PageSplitter />
          </div>
        )}
        {mountedTabs.has('editor') && (
          <div className={`absolute inset-0 flex ${activeTab === 'editor' ? '' : 'invisible pointer-events-none'}`}>
            <EditorStudio
              injectedFile={injectedFile}
              onInjectedFileConsumed={handleInjectedFileConsumed}
            />
          </div>
        )}
        {mountedTabs.has('merger') && (
          <div className={`absolute inset-0 flex ${activeTab === 'merger' ? '' : 'invisible pointer-events-none'}`}>
            <MultiFileMerger onSendToEditor={handleSendToEditor} />
          </div>
        )}
        {mountedTabs.has('password') && (
          <div className={`absolute inset-0 flex ${activeTab === 'password' ? '' : 'invisible pointer-events-none'}`}>
            <PasswordHub />
          </div>
        )}
      </div>
    </div>
  )
}
