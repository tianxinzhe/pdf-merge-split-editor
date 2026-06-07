import * as pdfjsLib from 'pdfjs-dist'

// Worker
const pdfWorkerUrl = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// Shared loading options for getDocument()
export const pdfLoadingOptions = {
  standardFontDataUrl: new URL('pdfjs-dist/standard_fonts/', import.meta.url).toString(),
  cMapUrl: new URL('pdfjs-dist/cmaps/', import.meta.url).toString(),
  cMapPacked: true,
  useSystemFonts: true,
  isEvalSupported: false,
  useWorkerFetch: false,
  wasmUrl: new URL('pdfjs-dist/wasm/', import.meta.url).toString(),
}
