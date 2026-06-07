export interface ViewRect {
  width: number
  height: number
}

export interface PDFPoint {
  x: number
  y: number
}

export function viewToPDF(
  viewX: number,
  viewY: number,
  viewW: number,
  viewH: number,
  pdfPageW: number,
  pdfPageH: number,
  _sigW: number,
  sigH: number,
): PDFPoint {
  const x = viewX * (pdfPageW / viewW)
  const y = (viewH - viewY - sigH) * (pdfPageH / viewH)
  return { x, y }
}

export function viewDimToPDF(dim: number, viewTotal: number, pdfTotal: number): number {
  return dim * (pdfTotal / viewTotal)
}
