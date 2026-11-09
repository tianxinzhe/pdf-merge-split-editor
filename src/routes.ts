import { TABS, type TabId } from './types'

const base = import.meta.env.BASE_URL

export const TAB_PATHS: Record<TabId, string> = {
  home: base,
  splitter: `${base}splitter/`,
  editor: `${base}editor/`,
  merger: `${base}merger/`,
  img2pdf: `${base}img2pdf/`,
  toolbox: `${base}toolbox/`,
  unlock: `${base}unlock/`,
  encrypt: `${base}encrypt/`,
}

export function isTabId(value: string | null | undefined): value is TabId {
  return typeof value === 'string' && TABS.some(tab => tab.id === value)
}