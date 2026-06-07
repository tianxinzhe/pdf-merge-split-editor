export function renderTextWatermark(
  text: string,
  fontSize: number,
  opacity: number,
  angle: number,
  pageWidth: number,
  pageHeight: number,
): string {
  const canvas = document.createElement('canvas')
  const dpr = window.devicePixelRatio || 1
  canvas.width = pageWidth * dpr
  canvas.height = pageHeight * dpr
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)

  ctx.clearRect(0, 0, pageWidth, pageHeight)
  ctx.save()
  ctx.translate(pageWidth / 2, pageHeight / 2)
  ctx.rotate((angle * Math.PI) / 180)
  ctx.font = `${fontSize}px "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif`
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const textWidth = ctx.measureText(text).width
  const spacing = textWidth * 2.5
  const rows = Math.ceil(pageHeight / spacing) + 2
  const cols = Math.ceil(pageWidth / spacing) + 2
  for (let r = -rows; r <= rows; r++) {
    for (let c = -cols; c <= cols; c++) {
      ctx.fillText(text, c * spacing, r * spacing)
    }
  }
  ctx.restore()

  return canvas.toDataURL('image/png')
}

export function renderSingleTextWatermark(
  text: string,
  fontSize: number,
  opacity: number,
  angle: number,
): string {
  const temp = document.createElement('canvas')
  const tCtx = temp.getContext('2d')!
  tCtx.font = `${fontSize}px "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif`
  const metrics = tCtx.measureText(text)
  const tw = metrics.width
  const th = fontSize * 1.4

  const rad = (angle * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  const cw = Math.ceil(tw * cos + th * sin) + 16
  const ch = Math.ceil(tw * sin + th * cos) + 16

  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!

  ctx.save()
  ctx.translate(cw / 2, ch / 2)
  ctx.rotate(rad)
  ctx.font = `${fontSize}px "Microsoft YaHei", "PingFang SC", "Noto Sans SC", sans-serif`
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 0, 0)
  ctx.restore()

  return canvas.toDataURL('image/png')
}

export function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1]
  const binary = atob(base64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i)
  }
  return arr
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
