import type { Locale } from './types'

export const LOCALES: { id: Locale; label: string }[] = [
  { id: 'zh', label: '中文' },
  { id: 'en', label: 'English' },
  { id: 'ko', label: '한국어' },
  { id: 'ja', label: '日本語' },
  { id: 'de', label: 'Deutsch' },
]

export const STORAGE_KEY = 'lemon-pdf-locale'

export const HTML_LANG: Record<Locale, string> = {
  zh: 'zh-CN',
  en: 'en',
  ko: 'ko',
  ja: 'ja',
  de: 'de',
}

export function isLocale(value: string | null): value is Locale {
  return value !== null && LOCALES.some(item => item.id === value)
}

export function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch {
    // storage can be unavailable in private or embedded contexts
  }

  const languages =
    typeof navigator === 'undefined'
      ? []
      : navigator.languages?.length
        ? navigator.languages
        : [navigator.language]

  for (const language of languages) {
    const code = language.toLowerCase()
    if (code.startsWith('zh')) return 'zh'
    if (code.startsWith('en')) return 'en'
    if (code.startsWith('ko')) return 'ko'
    if (code.startsWith('ja')) return 'ja'
    if (code.startsWith('de')) return 'de'
  }

  return 'en'
}