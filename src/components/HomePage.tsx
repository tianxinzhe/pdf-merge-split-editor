import { useI18n, type ModuleId } from '../i18n'
import { TAB_PATHS } from '../routes'

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
    linkClass: 'text-blue-400 group-hover:text-blue-300',
  },
  {
    id: 'editor',
    icon: '✍️',
    iconClass: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    checkClass: 'text-violet-400',
    linkClass: 'text-violet-400 group-hover:text-violet-300',
  },
  {
    id: 'merger',
    icon: '📂',
    iconClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    checkClass: 'text-emerald-400',
    linkClass: 'text-emerald-400 group-hover:text-emerald-300',
  },
  {
    id: 'toolbox',
    icon: '🧰',
    iconClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    checkClass: 'text-amber-400',
    linkClass: 'text-amber-400 group-hover:text-amber-300',
  },
  {
    id: 'img2pdf',
    icon: '🖼️',
    iconClass: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    checkClass: 'text-teal-400',
    linkClass: 'text-teal-400 group-hover:text-teal-300',
  },
  {
    id: 'unlock',
    icon: '🔐',
    iconClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    checkClass: 'text-rose-400',
    linkClass: 'text-rose-400 group-hover:text-rose-300',
  },
  {
    id: 'encrypt',
    icon: '🔒',
    iconClass: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    checkClass: 'text-sky-400',
    linkClass: 'text-sky-400 group-hover:text-sky-300',
  },
]

export function HomePage() {
  const { t } = useI18n()
  const home = t.home
  const modules = MODULE_META.map(meta => ({ ...meta, ...home.modules[meta.id] }))
  const [featured, ...rest] = modules

  const scrollToModules = () => {
    document.getElementById('modules')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-gray-950">
      <section className="relative overflow-hidden border-b border-gray-800/70">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-8 h-80 w-80 rounded-full bg-violet-500/10 blur-3xl"
        />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-6 text-center md:px-8 md:py-8">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-medium text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            {home.badge}
          </span>

          <h1 className="mt-3 max-w-4xl text-3xl font-bold leading-[1.15] tracking-tight text-white md:text-4xl">
            {home.titleLead}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              {home.titleHighlight}
            </span>
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400 md:text-base">
            {home.subtitle}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={TAB_PATHS.splitter}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
            >
              {home.ctaPrimary}
              <span aria-hidden>→</span>
            </a>
            <button
              type="button"
              onClick={scrollToModules}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900/60 px-5 py-2.5 text-sm font-medium text-gray-200 transition-colors hover:border-gray-500 hover:bg-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
            >
              {home.ctaSecondary}
            </button>
          </div>

          <dl className="mt-5 grid w-full max-w-2xl grid-cols-2 gap-x-8 gap-y-2 text-center sm:grid-cols-4">
            {home.stats.map(stat => (
              <div key={stat.label}>
                <dt className="text-[11px] text-gray-500">{stat.label}</dt>
                <dd className="mt-0.5 text-base font-semibold tracking-tight text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
        <div className="mb-5 md:mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
            {home.modulesTitle}
          </h2>
          <p className="mt-1 text-xs text-gray-400 md:text-sm">{home.modulesSubtitle}</p>
        </div>

        <div className="home-modules-grid">
          <a
            key={featured.id}
            href={TAB_PATHS[featured.id]}
            className="group relative flex min-h-[210px] flex-col overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-gray-900/60 to-gray-900/40 p-5 text-left transition-all hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-xl hover:shadow-blue-950/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer sm:col-span-2"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/10 blur-2xl"
            />

            <div className="relative flex items-start gap-4">
              <span
                aria-hidden
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-3xl transition-transform group-hover:scale-105 md:h-16 md:w-16 md:text-4xl ${featured.iconClass}`}
              >
                {featured.icon}
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-xl font-semibold text-white md:text-2xl">{featured.title}</h3>
                <p className="mt-1 text-xs text-blue-200/80 line-clamp-1 md:text-sm">
                  {featured.tagline}
                </p>
              </div>
            </div>

            <p className="relative mt-3 text-xs leading-relaxed text-gray-400 line-clamp-2 md:text-[13px]">
              {featured.description}
            </p>

            <ul className="relative mt-2.5 space-y-1">
              {featured.features.slice(0, 2).map(feature => (
                <li key={feature} className="flex gap-2 text-[11px] text-gray-400">
                  <span aria-hidden className="text-blue-400">•</span>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
            </ul>

            <span className={`relative mt-auto pt-4 text-xs font-medium ${featured.linkClass}`}>
              {featured.cta}
            </span>
          </a>

          {rest.map(module => (
            <a
              key={module.id}
              href={TAB_PATHS[module.id]}
              className="group flex min-h-[180px] flex-col rounded-2xl border border-gray-800 bg-gray-900/50 p-4 text-left transition-all hover:-translate-y-1 hover:border-gray-600 hover:bg-gray-900 hover:shadow-xl hover:shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            >
              <span
                aria-hidden
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xl transition-transform group-hover:scale-105 ${module.iconClass}`}
              >
                {module.icon}
              </span>
              <h3 className="mt-3 text-base font-semibold text-white">{module.title}</h3>
              <p className="mt-0.5 text-[11px] text-gray-400 line-clamp-1">{module.tagline}</p>
              <p className="mt-2 text-[11px] leading-relaxed text-gray-500 line-clamp-2">
                {module.description}
              </p>
              <span className={`mt-auto pt-3 text-[11px] font-medium ${module.linkClass}`}>
                {module.cta}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-6 md:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-gray-800/70 pt-5 text-[11px] text-gray-500">
          {home.privacy.map(item => (
            <span key={item.title} className="inline-flex items-center gap-1.5">
              <span aria-hidden>{item.icon}</span>
              <span>{item.title}</span>
            </span>
          ))}
          <span className="text-gray-600">{home.footerNote}</span>
        </div>
      </section>
    </div>
  )
}