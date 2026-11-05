const FONT_STACK = '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif'

export type WatermarkMode = 'tile' | 'single'

export interface TextWatermarkOptions {
  text: string
  fontSize: number
  opacity: number
  angle: number
  color?: string
  spacing?: number
  pageWidth?: number
  pageHeight?: number
  mode?: WatermarkMode
  pixelRatio?: number
}

function toRgba(color: string | undefined, opacity: number): string {
  const hex = (color || '#000000').trim()
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex)
  if (!match) return `rgba(0, 0, 0, ${opacity})`
  let value = match[1]
  if (value.length === 3) {
    value = value.split('').map(c => c + c).join('')
  }
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

function setupText(ctx: CanvasRenderingContext2D, o: TextWatermarkOptions) {
  ctx.font = `${o.fontSize}px ${FONT_STACK}`
  ctx.fillStyle = toRgba(o.color, o.opacity)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
}

/** Draw a staggered tiled grid of the watermark text, rotated around the page centre. */
function drawTiled(ctx: CanvasRenderingContext2D, o: TextWatermarkOptions) {
  const { text, fontSize, angle, spacing = 80 } = o
  const pageWidth = o.pageWidth ?? 600
  const pageHeight = o.pageHeight ?? 850

  ctx.save()
  ctx.translate(pageWidth / 2, pageHeight / 2)
  ctx.rotate((angle * Math.PI) / 180)
  setupText(ctx, o)

  const textWidth = Math.max(ctx.measureText(text).width, 8)
  const stepX = Math.max(textWidth + spacing, 24)
  const stepY = Math.max(fontSize * 1.6 + spacing, 24)
  const reach = Math.hypot(pageWidth, pageHeight) / 2 + Math.max(textWidth, fontSize)
  const cols = Math.ceil(reach / stepX) + 1
  const rows = Math.ceil(reach / stepY) + 1

  for (let r = -rows; r <= rows; r++) {
    const offsetX = Math.abs(r % 2) === 1 ? stepX / 2 : 0
    for (let c = -cols; c <= cols; c++) {
      ctx.fillText(text, c * stepX + offsetX, r * stepY)
    }
  }
  ctx.restore()
}

/**
 * Text watermark PNG for embedding into the PDF.
 * - tile: full-page canvas (the worker stretches it onto the page)
 * - single: tight transparent canvas around the text (the worker centres it)
 */
export function renderTextWatermarkPng(o: TextWatermarkOptions): string {
  const { text, mode = 'tile' } = o
  if (!text.trim()) return ''
  if (mode === 'single') return renderSingleTextWatermarkPng(o)

  const pageWidth = o.pageWidth ?? 600
  const pageHeight = o.pageHeight ?? 850
  const ratio = o.pixelRatio ?? 2
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(pageWidth * ratio)
  canvas.height = Math.round(pageHeight * ratio)
  const ctx = canvas.getContext('2d')!
  ctx.scale(ratio, ratio)
  drawTiled(ctx, o)
  return canvas.toDataURL('image/png')
}

/** Tightly cropped single text watermark PNG (used when exporting). */
function renderSingleTextWatermarkPng(o: TextWatermarkOptions): string {
  const { text, fontSize, angle } = o
  // 1x: the worker draws this image at its natural pixel size in PDF points.
  const ratio = 1

  const measure = document.createElement('canvas').getContext('2d')!
  measure.font = `${fontSize}px ${FONT_STACK}`
  const textWidth = measure.measureText(text).width
  const textHeight = fontSize * 1.4

  const rad = (angle * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const padding = 12
  const width = Math.ceil(textWidth * cos + textHeight * sin) + padding * 2
  const height = Math.ceil(textWidth * sin + textHeight * cos) + padding * 2

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(width * ratio)
  canvas.height = Math.ceil(height * ratio)
  const ctx = canvas.getContext('2d')!
  ctx.scale(ratio, ratio)
  ctx.translate(width / 2, height / 2)
  ctx.rotate(rad)
  setupText(ctx, o)
  ctx.fillText(text, 0, 0)
  return canvas.toDataURL('image/png')
}

export interface ImageWatermarkOptions {
  source: string
  opacity: number
  angle: number
  mode: WatermarkMode
  imageScale?: number
  pageWidth?: number
  pageHeight?: number
  pixelRatio?: number
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('图片水印加载失败'))
    image.src = src
  })
}

/**
 * Image watermark PNG for embedding into the PDF.
 * - tile: full-page canvas with rotated, repeated logos
 * - single: tight transparent canvas around the rotated logo
 */
export async function renderImageWatermarkPng(o: ImageWatermarkOptions): Promise<string> {
  const image = await loadImageElement(o.source)
  const pageWidth = o.pageWidth ?? 600
  const pageHeight = o.pageHeight ?? 850
  const mode = o.mode
  const ratio = mode === 'tile' ? (o.pixelRatio ?? 2) : 1

  const targetWidth = Math.max(16, pageWidth * (o.imageScale ?? 0.3))
  const aspect = image.width > 0 ? image.height / image.width : 1
  const targetHeight = Math.max(16, targetWidth * aspect)
  const rad = (o.angle * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const padding = 12

  const logicalWidth = mode === 'tile'
    ? pageWidth
    : Math.ceil(targetWidth * cos + targetHeight * sin) + padding * 2
  const logicalHeight = mode === 'tile'
    ? pageHeight
    : Math.ceil(targetWidth * sin + targetHeight * cos) + padding * 2

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(logicalWidth * ratio)
  canvas.height = Math.round(logicalHeight * ratio)
  const ctx = canvas.getContext('2d')!
  ctx.scale(ratio, ratio)
  ctx.globalAlpha = o.opacity

  if (mode === 'tile') {
    ctx.translate(pageWidth / 2, pageHeight / 2)
    ctx.rotate(rad)
    const stepX = targetWidth * 1.6
    const stepY = targetHeight * 1.6
    const reach = Math.hypot(pageWidth, pageHeight) / 2 + Math.max(targetWidth, targetHeight)
    const cols = Math.ceil(reach / stepX) + 1
    const rows = Math.ceil(reach / stepY) + 1
    for (let r = -rows; r <= rows; r++) {
      const offsetX = Math.abs(r % 2) === 1 ? stepX / 2 : 0
      for (let c = -cols; c <= cols; c++) {
        ctx.drawImage(image, c * stepX + offsetX - targetWidth / 2, r * stepY - targetHeight / 2, targetWidth, targetHeight)
      }
    }
  } else {
    ctx.translate(logicalWidth / 2, logicalHeight / 2)
    ctx.rotate(rad)
    ctx.drawImage(image, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight)
  }

  return canvas.toDataURL('image/png')
}

/**
 * Parse a page range such as "1-3,5" (1-based, inclusive) into zero-based page indices.
 * Invalid or out-of-range entries are ignored.
 */
export function parsePageRange(input: string, totalPages: number): number[] {
  const result = new Set<number>()
  if (!input.trim() || totalPages <= 0) return []

  for (const part of input.split(/[,，;；\s]+/)) {
    if (!part) continue
    const match = /^(\d+)(?:\s*[-~]\s*(\d+))?$/.exec(part)
    if (!match) continue
    let start = parseInt(match[1], 10)
    let end = match[2] ? parseInt(match[2], 10) : start
    if (Number.isNaN(start) || Number.isNaN(end)) continue
    if (start > end) [start, end] = [end, start]
    start = Math.max(1, start)
    end = Math.min(totalPages, end)
    for (let page = start; page <= end; page++) result.add(page - 1)
  }
  return [...result].sort((a, b) => a - b)
}