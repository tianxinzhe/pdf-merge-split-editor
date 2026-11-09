import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// Vite's dev server falls back to the SPA entry for directory URLs served from
// `public/` (e.g. /privacy/). Production hosts resolve /privacy/ to
// /privacy/index.html automatically, so mirror that in development.
const staticPageDirs = ['/about', '/contact', '/privacy', '/terms', '/help']

const staticDirIndex = (): Plugin => ({
  name: 'static-dir-index',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const [pathname, query] = (req.url ?? '').split('?')
      const dir = staticPageDirs.find(dir => pathname === dir || pathname === `${dir}/`)
      if (dir) req.url = `${dir}/index.html${query ? `?${query}` : ''}`
      next()
    })
  },
})

export default defineConfig({
  base: '/',
  plugins: [staticDirIndex(), react(), tailwindcss()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        home: page('./index.html'),
        splitter: page('./splitter/index.html'),
        editor: page('./editor/index.html'),
        merger: page('./merger/index.html'),
        img2pdf: page('./img2pdf/index.html'),
        toolbox: page('./toolbox/index.html'),
        unlock: page('./unlock/index.html'),
        encrypt: page('./encrypt/index.html'),
      },
    },
  },
  worker: { format: 'es' },
  server: { port: 5173 },
  preview: { port: 4173 },
})