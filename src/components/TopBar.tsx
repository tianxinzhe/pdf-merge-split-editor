import type { TabId } from '../types'
import { TABS } from '../types'
import { LOCALES, useI18n, type Locale } from '../i18n'

interface TopBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function TopBar({ activeTab, onTabChange }: TopBarProps) {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="h-12 flex items-center justify-between gap-3 px-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm shrink-0 z-50">
      <button
        onClick={() => onTabChange('home')}
        title={t.common.backHome}
        className="flex items-center gap-2 select-none shrink-0 cursor-pointer"
      >
        <span className="text-lg">🍋</span>
        <span className="text-base font-semibold text-white tracking-tight">Lemon PDF Studio</span>
      </button>

      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1 overflow-x-auto min-w-0">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {t.nav[tab.id]}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <span aria-hidden="true" className="text-sm">
            🌐
          </span>
          <label className="sr-only" htmlFor="locale-select">
            {t.common.language}
          </label>
          <select
            id="locale-select"
            value={locale}
            onChange={event => setLocale(event.target.value as Locale)}
            title={t.common.switchLanguage}
            className="appearance-none rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs text-gray-200 hover:border-gray-600 focus:border-blue-500 focus:outline-none cursor-pointer"
          >
            {LOCALES.map(item => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}