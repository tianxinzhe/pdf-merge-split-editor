import { useI18n } from '../i18n'

export function SiteFooter() {
  const { t } = useI18n()
  const links = [
    ['/about/', t.common.footer.about],
    ['/contact/', t.common.footer.contact],
    ['/privacy/', t.common.footer.privacy],
    ['/terms/', t.common.footer.terms],
    ['/guides/', t.common.footer.guides],
    ['/help/', t.common.footer.help],
  ] as const

  return (
    <footer className="shrink-0 border-t border-gray-800/80 bg-gray-950/90 px-4 py-1">
      <nav
        aria-label="Footer"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-0.5 text-[11px] text-gray-500"
      >
        {links.map(([href, label]) => (
          <a key={href} href={href} className="transition-colors hover:text-gray-300">
            {label}
          </a>
        ))}
        <span className="text-gray-600">© Lemon PDF Studio</span>
      </nav>
    </footer>
  )
}