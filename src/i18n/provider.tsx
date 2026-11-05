import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { HTML_LANG, STORAGE_KEY, detectLocale } from './config'
import { I18nContext, type I18nValue } from './context'
import { messages } from './messages'
import type { Locale } from './types'

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // storage can be unavailable in private or embedded contexts
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale]
    document.title = messages[locale].common.appTitle
  }, [locale])

  const value = useMemo<I18nValue>(
    () => ({ locale, setLocale, t: messages[locale] }),
    [locale, setLocale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}