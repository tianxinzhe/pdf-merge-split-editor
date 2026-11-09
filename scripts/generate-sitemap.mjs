import { writeFileSync } from 'node:fs'

const siteUrl = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://pdf.soulscop.com').replace(/\/+$/, '')

const pages = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/splitter/', priority: '0.9', changefreq: 'monthly' },
  { path: '/editor/', priority: '0.9', changefreq: 'monthly' },
  { path: '/merger/', priority: '0.9', changefreq: 'monthly' },
  { path: '/img2pdf/', priority: '0.9', changefreq: 'monthly' },
  { path: '/toolbox/', priority: '0.9', changefreq: 'monthly' },
  { path: '/unlock/', priority: '0.8', changefreq: 'monthly' },
  { path: '/encrypt/', priority: '0.8', changefreq: 'monthly' },
  { path: '/help/', priority: '0.8', changefreq: 'monthly' },
  { path: '/about/', priority: '0.5', changefreq: 'yearly' },
  { path: '/contact/', priority: '0.5', changefreq: 'yearly' },
  { path: '/privacy/', priority: '0.3', changefreq: 'yearly' },
  { path: '/terms/', priority: '0.3', changefreq: 'yearly' },
]

const today = new Date().toISOString().slice(0, 10)
const urls = pages
  .map(page => [
    '  <url>',
    `    <loc>${siteUrl}${page.path}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    `    <changefreq>${page.changefreq}</changefreq>`,
    `    <priority>${page.priority}</priority>`,
    '  </url>',
  ].join('\n'))
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml)
console.log(`[sitemap] Wrote ${pages.length} URLs for ${siteUrl}`)