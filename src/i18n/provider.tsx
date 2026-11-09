import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { HTML_LANG, STORAGE_KEY, detectLocale } from './config'
import { I18nContext, type I18nValue } from './context'
import { messages } from './messages'
import type { Locale } from './types'
import type { TabId } from '../types'

interface I18nProviderProps {
  children: ReactNode
  page?: TabId
}

export function I18nProvider({ children, page = 'home' }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore storage failures (e.g. private mode).
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale]
    document.title = page === 'home'
      ? messages[locale].common.appTitle
      : `${messages[locale].nav[page]} · Lemon PDF Studio`
  }, [locale, page])

  const value = useMemo<I18nValue>(() => ({ locale, setLocale, t: messages[locale] }), [locale, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}