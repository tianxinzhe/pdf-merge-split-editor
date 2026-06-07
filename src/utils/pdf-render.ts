import * as pdfjsLib from 'pdfjs-dist'
import { pdfLoadingOptions } from './pdfjs-config'

const loadingTaskOptions = {
  ...pdfLoadingOptions,
  stopAtErrors: false,
  maxImageSize: -1,
}

function getLoadOptions(data: ArrayBuffer) {
  return {
    data: data.slice(0),
    ...loadingTaskOptions,
  }
}

// Suppress pdf.js's noisy console.warn about large images
const origWarn = console.warn
console.warn = function (...args: unknown[]) {
  const msg = args.join(' ')
  if (msg.includes('Image exceeded maximum allowed size')) return
  if (msg.includes('Invalid object ref')) return
  if (msg.includes('Trying to parse invalid object')) return
  origWarn.apply(console, args)
}

export async function renderPagePreview(
  pdfBuffer: ArrayBuffer,
  pageIndex: number,
  scale?: number,
): Promise<string> {
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
  const effectiveScale = scale ?? Math.max(1, dpr * 0.75)

  const loadingTask = pdfjsLib.getDocument(getLoadOptions(pdfBuffer))
  const pdf = await loadingTask.promise
  
  const page = await pdf.getPage(pageIndex + 1)
  const viewport = page.getViewport({ scale: effectiveScale })

  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  await page.render({ canvas, canvasContext: ctx, viewport }).promise

  return canvas.toDataURL('image/webp', 0.92)
}

export async function renderPageHD(
  pdfBuffer: ArrayBuffer,
  pageIndex: number,
  scale = 2,
): Promise<string> {
  const loadingTask = pdfjsLib.getDocument(getLoadOptions(pdfBuffer))
  const pdf = await loadingTask.promise
  
  const page = await pdf.getPage(pageIndex + 1)
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  await page.render({ canvas, canvasContext: ctx, viewport }).promise

  return canvas.toDataURL('image/webp', 0.95)
}

export function restoreConsoleWarn() {
  console.warn = origWarn
}
