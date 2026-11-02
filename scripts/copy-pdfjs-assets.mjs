/**
 * 把 pdfjs-dist 的运行时静态资源复制到 public/pdfjs/。
 *
 * pdfjs 的 cmaps / standard_fonts / wasm 无法通过 import 被打包，
 * 必须作为独立静态文件按 URL 加载。放在 public/ 下后：
 *   - dev 由 vite 直接提供
 *   - build 时原样复制到 dist/pdfjs/
 * 因此部署到任意子路径都能工作（配合 src/utils/pdfjs-config.ts 的 base 相对路径）。
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pdfjsRoot = dirname(require.resolve('pdfjs-dist/package.json'))
const target = resolve(root, 'public/pdfjs')

const DIRS = ['cmaps', 'standard_fonts', 'wasm', 'iccs', 'image_decoders']

if (!existsSync(pdfjsRoot)) {
  console.warn('[pdfjs-assets] 找不到 pdfjs-dist，先执行 npm install')
  process.exit(0)
}

rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })

let copied = 0
for (const dir of DIRS) {
  const from = resolve(pdfjsRoot, dir)
  if (!existsSync(from)) continue
  cpSync(from, resolve(target, dir), { recursive: true })
  copied++
}

console.log(`[pdfjs-assets] 已复制 ${copied} 个资源目录到 public/pdfjs/`)