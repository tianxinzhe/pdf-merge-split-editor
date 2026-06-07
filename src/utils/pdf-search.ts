import * as pdfjsLib from 'pdfjs-dist'
import { pdfLoadingOptions } from './pdfjs-config'

export interface SearchResult {
  pageIndex: number
  text: string
  index: number
}

export async function searchPdfText(
  pdfBuffer: ArrayBuffer,
  query: string,
): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const loadingTask = pdfjsLib.getDocument({
    data: pdfBuffer.slice(0),
    ...pdfLoadingOptions,
  })

  const pdf = await loadingTask.promise
  const results: SearchResult[] = []
  const lowerQuery = query.toLowerCase()

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const fullText = textContent.items
      .map(item => ('str' in item ? item.str : ''))
      .join(' ')

    const lowerText = fullText.toLowerCase()
    let startIndex = 0
    let idx: number

    while ((idx = lowerText.indexOf(lowerQuery, startIndex)) !== -1) {
      results.push({
        pageIndex: i - 1,
        text: fullText.substring(Math.max(0, idx - 20), idx + query.length + 20),
        index: idx,
      })
      startIndex = idx + 1
    }
  }

  return results
}

export async function getPageText(
  pdfBuffer: ArrayBuffer,
  pageIndex: number,
): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({
    data: pdfBuffer.slice(0),
    ...pdfLoadingOptions,
  })

  const pdf = await loadingTask.promise
  const page = await pdf.getPage(pageIndex + 1)
  const textContent = await page.getTextContent()
  return textContent.items
    .map(item => ('str' in item ? item.str : ''))
    .join(' ')
}
