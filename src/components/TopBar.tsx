import type { TabId } from '../types'
import { TABS } from '../types'

interface TopBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function TopBar({ activeTab, onTabChange }: TopBarProps) {
  return (
    <div className="h-12 flex items-center justify-between px-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm shrink-0 z-50">
      <div className="flex items-center gap-2 select-none">
        <span className="text-lg">🍋</span>
        <span className="text-sm font-semibold text-white tracking-tight">Lemon PDF Studio</span>
      </div>

      <div className="flex items-center gap-1">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
