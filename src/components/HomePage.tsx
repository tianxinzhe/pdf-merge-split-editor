import type { TabId } from '../types'
import { useI18n } from '../i18n'
import type { ModuleId } from '../i18n/types'

interface HomePageProps {
  onNavigate: (tab: TabId) => void
}

interface ModuleMeta {
  id: ModuleId
  icon: string
  iconClass: string
  checkClass: string
  linkClass: string
}

const MODULE_META: ModuleMeta[] = [
  {
    id: 'splitter',
    icon: '✂️',
    iconClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    checkClass: 'text-blue-400',
    linkClass: 'text-blue-400 hover:text-blue-300',
  },
  {
    id: 'editor',
    icon: '✍️',
    iconClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    checkClass: 'text-violet-400',
    linkClass: 'text-violet-400 hover:text-violet-300',
  },
  {
    id: 'merger',
    icon: '📂',
    iconClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    checkClass: 'text-emerald-400',
    linkClass: 'text-emerald-400 hover:text-emerald-300',
  },
  {
    id: 'toolbox',
    icon: '🧰',
    iconClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    checkClass: 'text-amber-400',
    linkClass: 'text-amber-400 hover:text-amber-300',
  },
]

export function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useI18n()
  const home = t.home
  const modules = MODULE_META.map(meta => ({ ...meta, ...home.modules[meta.id] }))

  const scrollToModules = () => {
    document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-14 md:py-20">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/80 border border-gray-700 text-xs text-gray-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {home.badge}
          </span>

          <h1 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
            {home.titleLead}
            <span className="text-blue-400">{home.titleHighlight}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-gray-400 leading-relaxed">{home.subtitle}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('splitter')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer shadow-lg shadow-blue-600/20"
            >
              {home.ctaPrimary}
            </button>
            <button
              onClick={scrollToModules}
              className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 text-sm font-medium transition-colors cursor-pointer"
            >
              {home.ctaSecondary}
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
            {home.stats.map(stat => (
              <div key={stat.label} className="px-4 py-3 rounded-xl bg-gray-900/60 border border-gray-800">
                <p className="text-sm font-semibold text-white">{stat.value}</p>
                <p className="mt-0.5 text-xs text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="max-w-5xl mx-auto px-6 py-12 scroll-mt-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{home.modulesTitle}</h2>
            <p className="mt-1.5 text-sm text-gray-400">{home.modulesSubtitle}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {modules.map(m => (
            <article
              key={m.id}
              className="flex flex-col p-6 rounded-2xl bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center text-xl ${m.iconClass}`}>
                  {m.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white">{m.title}</h3>
                  <p className="mt-1 text-sm text-gray-400">{m.tagline}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-300 leading-relaxed">{m.description}</p>

              <ul className="mt-4 space-y-2">
                {m.features.map(feature => (
                  <li key={feature} className="flex gap-2 text-sm text-gray-400 leading-relaxed">
                    <span className={`mt-0.5 shrink-0 ${m.checkClass}`}>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onNavigate(m.id)}
                className={`mt-auto pt-5 self-start text-sm font-medium transition-colors cursor-pointer ${m.linkClass}`}
              >
                {m.cta}
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid gap-3 sm:grid-cols-3">
          {home.steps.map(step => (
            <div key={step.no} className="flex items-start gap-3 p-4 rounded-xl bg-gray-900/40 border border-gray-800">
              <span className="text-lg font-bold text-gray-600 tabular-nums">{step.no}</span>
              <div>
                <p className="text-sm font-medium text-white">{step.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Privacy */}
      <section className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-xl font-semibold text-white">{home.privacyTitle}</h2>
          <p className="mt-1.5 text-sm text-gray-400">{home.privacySubtitle}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {home.privacy.map(item => (
              <div key={item.title} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800">
                <div className="text-xl">{item.icon}</div>
                <p className="mt-2 text-sm font-medium text-white">{item.title}</p>
                <p className="mt-1 text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
          <span>{home.footerBrand}</span>
          <span>{home.footerNote}</span>
        </div>
      </footer>
    </div>
  )
}