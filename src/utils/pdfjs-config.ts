import * as pdfjsLib from 'pdfjs-dist'

// Worker：由 Vite 作为构建资源处理（带 hash，随 base 自动变化）
const pdfWorkerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// 资源目录：由 scripts/copy-pdfjs-assets.mjs 复制到 public/pdfjs/，
// 构建后位于 dist/pdfjs/。用 document.baseURI 解析，天然支持部署在任意子路径。
const assetBase = new URL('pdfjs/', document.baseURI).toString()

// Shared loading options for getDocument()
export const pdfLoadingOptions = {
  standardFontDataUrl: `${assetBase}standard_fonts/`,
  cMapUrl: `${assetBase}cmaps/`,
  cMapPacked: true,
  useSystemFonts: true,
  isEvalSupported: false,
  useWorkerFetch: false,
  wasmUrl: `${assetBase}wasm/`,
}