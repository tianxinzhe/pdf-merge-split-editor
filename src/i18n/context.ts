import { createContext, useContext } from 'react'
import type { Locale, Messages } from './types'

export interface I18nValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Messages
}

export const I18nContext = createContext<I18nValue | null>(null)

export function useI18n(): I18nValue {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used inside I18nProvider')
  return context
}