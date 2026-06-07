import { useState, useCallback, useRef } from 'react'
import type { PDFStudioState, PageItem, SourceFile, HistoryCommand, Redaction, Watermark } from '../types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function createInitialState(): PDFStudioState {
  return {
    sourceFileId: null,
    pages: [],
    currentPageIndex: 0,
    splitMode: 'range',
    splitRangeStart: 1,
    splitRangeEnd: 1,
    scatterPages: '',
    searchQuery: '',
    searchResults: [],
  }
}

export function usePDFState() {
  const [state, setState] = useState<PDFStudioState>(createInitialState)
  const [sourceFile, setSourceFile] = useState<SourceFile | null>(null)

  const historyStack = useRef<HistoryCommand[]>([])
  const historyPointer = useRef(-1)

  const pushHistory = useCallback((cmd: HistoryCommand) => {
    historyStack.current = historyStack.current.slice(0, historyPointer.current + 1)
    historyStack.current.push(cmd)
    historyPointer.current = historyStack.current.length - 1
  }, [])

  const undo = useCallback(() => {
    if (historyPointer.current < 0) return
    const cmd = historyStack.current[historyPointer.current]
    cmd.undo()
    historyPointer.current--
  }, [])

  const redo = useCallback(() => {
    if (historyPointer.current >= historyStack.current.length - 1) return
    historyPointer.current++
    const cmd = historyStack.current[historyPointer.current]
    cmd.execute()
  }, [])

  const jumpToHistory = useCallback((targetIndex: number) => {
    if (targetIndex < -1 || targetIndex >= historyStack.current.length) return
    while (historyPointer.current > targetIndex) {
      const cmd = historyStack.current[historyPointer.current]
      cmd.undo()
      historyPointer.current--
    }
    while (historyPointer.current < targetIndex) {
      historyPointer.current++
      const cmd = historyStack.current[historyPointer.current]
      cmd.execute()
    }
  }, [])

  const loadFileInner = useCallback((sf: SourceFile, pages: Array<{ index: number }>) => {
    setSourceFile(sf)
    const pageItems: PageItem[] = pages.map(p => ({
      id: `${sf.id}-${p.index}-${generateId()}`,
      sourceFileId: sf.id,
      originalPageIndex: p.index,
      rotation: 0,
      deleted: false,
      redactions: [],
      watermarks: [],
    }))
    setState(prev => ({
      ...prev,
      sourceFileId: sf.id,
      pages: pageItems,
      currentPageIndex: 0,
      splitRangeEnd: pageItems.length,
    }))
    historyStack.current = []
    historyPointer.current = -1
  }, [])

  const rotatePage = useCallback((pageIndex: number) => {
    const cmd: HistoryCommand = {
      id: generateId(),
      description: `旋转第 ${pageIndex + 1} 页`,
      execute: () => {
        setState(prev => ({
          ...prev,
          pages: prev.pages.map((p, i) => i === pageIndex ? { ...p, rotation: (p.rotation + 90) % 360 } : p),
        }))
      },
      undo: () => {
        setState(prev => ({
          ...prev,
          pages: prev.pages.map((p, i) => i === pageIndex ? { ...p, rotation: (p.rotation + 270) % 360 } : p),
        }))
      },
    }
    cmd.execute()
    pushHistory(cmd)
  }, [pushHistory])

  const deletePage = useCallback((pageIndex: number) => {
    const cmd: HistoryCommand = {
      id: generateId(),
      description: `剔除第 ${pageIndex + 1} 页`,
      execute: () => {
        setState(prev => ({
          ...prev,
          pages: prev.pages.map((p, i) => i === pageIndex ? { ...p, deleted: true } : p),
          currentPageIndex: Math.min(prev.currentPageIndex, prev.pages.filter((p2, i2) => i2 !== pageIndex && !p2.deleted).length - 1),
        }))
      },
      undo: () => {
        setState(prev => ({
          ...prev,
          pages: prev.pages.map((p, i) => i === pageIndex ? { ...p, deleted: false } : p),
        }))
      },
    }
    cmd.execute()
    pushHistory(cmd)
  }, [pushHistory])

  const movePage = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const cmd: HistoryCommand = {
      id: generateId(),
      description: `移动第 ${fromIndex + 1} 页`,
      execute: () => {
        setState(prev => {
          const pages = [...prev.pages]
          const [moved] = pages.splice(fromIndex, 1)
          pages.splice(toIndex, 0, moved)
          let ci = prev.currentPageIndex
          if (ci === fromIndex) ci = toIndex
          else if (fromIndex < ci && toIndex >= ci) ci--
          else if (fromIndex > ci && toIndex <= ci) ci++
          return { ...prev, pages, currentPageIndex: ci }
        })
      },
      undo: () => {
        setState(prev => {
          const pages = [...prev.pages]
          const [moved] = pages.splice(toIndex, 1)
          pages.splice(fromIndex, 0, moved)
          let ci = prev.currentPageIndex
          if (ci === toIndex) ci = fromIndex
          else if (toIndex < ci && fromIndex >= ci) ci--
          else if (toIndex > ci && fromIndex <= ci) ci++
          return { ...prev, pages, currentPageIndex: ci }
        })
      },
    }
    cmd.execute()
    pushHistory(cmd)
  }, [pushHistory])

  const addRedaction = useCallback((pageIndex: number, redaction: Redaction) => {
    const cmd: HistoryCommand = {
      id: generateId(),
      description: `添加遮蔽块`,
      execute: () => {
        setState(prev => ({
          ...prev,
          pages: prev.pages.map((p, i) => i === pageIndex
            ? { ...p, redactions: [...p.redactions, redaction] }
            : p),
        }))
      },
      undo: () => {
        setState(prev => ({
          ...prev,
          pages: prev.pages.map((p, i) => i === pageIndex
            ? { ...p, redactions: p.redactions.filter(r => r.id !== redaction.id) }
            : p),
        }))
      },
    }
    cmd.execute()
    pushHistory(cmd)
  }, [pushHistory])

  const removeRedaction = useCallback((pageIndex: number, redactionId: string) => {
    setState(prev => {
      const page = prev.pages[pageIndex]
      const target = page?.redactions.find(r => r.id === redactionId)
      if (!target) return prev
      const cmd: HistoryCommand = {
        id: generateId(),
        description: `删除遮蔽块`,
        execute: () => {
          setState(s => ({
            ...s,
            pages: s.pages.map((p, i) => i === pageIndex
              ? { ...p, redactions: p.redactions.filter(x => x.id !== redactionId) }
              : p),
          }))
        },
        undo: () => {
          setState(s => ({
            ...s,
            pages: s.pages.map((p, i) => i === pageIndex
              ? { ...p, redactions: [...p.redactions, target] }
              : p),
          }))
        },
      }
      cmd.execute()
      pushHistory(cmd)
      return {
        ...prev,
        pages: prev.pages.map((p, i) => i === pageIndex
          ? { ...p, redactions: p.redactions.filter(r => r.id !== redactionId) }
          : p),
      }
    })
  }, [pushHistory])

  const addWatermark = useCallback((pageIndex: number, watermark: Watermark) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map((p, i) => i === pageIndex
        ? { ...p, watermarks: [...p.watermarks, watermark] }
        : p),
    }))
  }, [])

  const removeWatermark = useCallback((pageIndex: number, watermarkId: string) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map((p, i) => i === pageIndex
        ? { ...p, watermarks: p.watermarks.filter(w => w.id !== watermarkId) }
        : p),
    }))
  }, [])

  const setPreviewUrl = useCallback((pageIndex: number, url: string | undefined) => {
    setState(prev => ({
      ...prev,
      pages: prev.pages.map((p, i) => i === pageIndex ? { ...p, previewUrl: url } : p),
    }))
  }, [])

  const setCurrentPage = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentPageIndex: index }))
  }, [])

  const setSplitMode = useCallback((mode: 'range' | 'scatter') => {
    setState(prev => ({ ...prev, splitMode: mode }))
  }, [])

  const setSplitRange = useCallback((start: number, end: number) => {
    setState(prev => ({ ...prev, splitRangeStart: start, splitRangeEnd: end }))
  }, [])

  const setScatterPages = useCallback((value: string) => {
    setState(prev => ({ ...prev, scatterPages: value }))
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }))
  }, [])

  const setSearchResults = useCallback((results: number[]) => {
    setState(prev => ({ ...prev, searchResults: results }))
  }, [])

  const clearRedactions = useCallback(() => {
    const snapshots = state.pages.map(p => ({ redactions: [...p.redactions] }))
    const cmd: HistoryCommand = {
      id: generateId(),
      description: `清除全部遮蔽`,
      execute: () => {
        setState(s => ({ ...s, pages: s.pages.map(p => ({ ...p, redactions: [] })) }))
      },
      undo: () => {
        setState(s => ({
          ...s,
          pages: s.pages.map((p, i) => ({ ...p, redactions: snapshots[i]?.redactions || [] })),
        }))
      },
    }
    cmd.execute()
    pushHistory(cmd)
  }, [state.pages, pushHistory])

  const clearFile = useCallback(() => {
    // Release preview URLs to free memory
    setState(prev => {
      prev.pages.forEach(p => { if (p.previewUrl) URL.revokeObjectURL(p.previewUrl) })
      return { ...createInitialState() }
    })
    setSourceFile(null)
    historyStack.current = []
    historyPointer.current = -1
  }, [])

  return {
    state,
    sourceFile,
    loadFileInner,
    clearFile,
    rotatePage,
    deletePage,
    movePage,
    addRedaction,
    removeRedaction,
    clearRedactions,
    addWatermark,
    removeWatermark,
    setPreviewUrl,
    setCurrentPage,
    setSplitMode,
    setSplitRange,
    setScatterPages,
    setSearchQuery,
    setSearchResults,
    undo,
    redo,
    jumpToHistory,
    getHistory: () => ({ stack: historyStack.current, pointer: historyPointer.current }),
  }
}
