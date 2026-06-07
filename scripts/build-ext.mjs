import { copyFileSync, mkdirSync, writeFileSync, existsSync, unlinkSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const dist = resolve(root, 'dist')

// Clean up Vite template artifacts
for (const f of readdirSync(dist)) {
  if (f.endsWith('.svg')) {
    unlinkSync(resolve(dist, f))
  }
}

copyFileSync(resolve(root, 'manifest.json'), resolve(dist, 'manifest.json'))

// Generate icons with Python PIL
const iconsDir = resolve(dist, 'icons')
if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true })
execSync(`python "${resolve(__dirname, 'gen_icons.py')}"`, { cwd: root })

// Write background.js as plain JS (no Vite bundling)
const bgCode = `chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});
`
writeFileSync(resolve(dist, 'background.js'), bgCode)

console.log('Extension build complete. Files ready in dist/')
