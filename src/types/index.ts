export type TabId = 'home' | 'splitter' | 'editor' | 'merger' | 'img2pdf' | 'toolbox' | 'unlock' | 'encrypt'

export interface TabDef {
  id: TabId
  label: string
  icon: string
}

export const TABS: TabDef[] = [
  { id: 'home', label: '首页', icon: '🏠' },
  { id: 'splitter', label: '页面拆分', icon: '✂️' },
  { id: 'editor', label: '编辑精修', icon: '✍️' },
  { id: 'merger', label: '多文件合并', icon: '📂' },
  { id: 'img2pdf', label: '图片转 PDF', icon: '🖼️' },
  { id: 'toolbox', label: 'PDF 转图片', icon: '🧰' },
  { id: 'unlock', label: 'PDF 权限管理', icon: '🔐' },
  { id: 'encrypt', label: 'PDF 加密', icon: '🔒' },
]

export interface SourceFile {
  id: string
  name: string
  binary: ArrayBuffer
  type: 'pdf' | 'image'
  encrypted?: boolean
  renderedImages?: ArrayBuffer[]
}

export interface MergerFileItem {
  id: string
  name: string
  type: 'pdf' | 'image'
  binary: ArrayBuffer
  pageCount?: number
}

export interface PageItem {
  id: string
  sourceFileId: string
  originalPageIndex: number
  rotation: number
  deleted: boolean
  previewUrl?: string
  redactions: Redaction[]
  watermarks: Watermark[]
}

export interface Redaction {
  id: string
  x: number
  y: number
  w: number
  h: number
  viewW: number
  viewH: number
}

export interface Watermark {
  id: string
  text: string
  fontSize: number
  opacity: number
  angle: number
  position: 'full' | 'center' | 'tl' | 'tc' | 'tr' | 'ml' | 'mc' | 'mr' | 'bl' | 'bc' | 'br'
  /** Text colour as a hex string, defaults to black. */
  color?: string
  /** Gap between tiled watermark items in pixels (20-300). */
  spacing?: number
  /** Image watermark width as a fraction of the page width (0.1-1). */
  imageScale?: number
  pngData?: string
  imageData?: string
  imageName?: string
}

/** Live watermark preview shown on the canvas before it is committed. */
export interface WatermarkDraft {
  /** Page ids (PageItem.id) the draft should appear on. */
  pageIds: string[]
  watermark: Watermark
}

export type SplitMode = 'range' | 'scatter'

export interface PDFStudioState {
  sourceFileId: string | null
  pages: PageItem[]
  currentPageIndex: number
  splitMode: SplitMode
  splitRangeStart: number
  splitRangeEnd: number
  scatterPages: string
  searchQuery: string
  searchResults: number[]
}

export type HistoryAction =
  | { type: 'rotate'; page: number }
  | { type: 'remove'; page: number }
  | { type: 'move'; page: number }
  | { type: 'addRedaction' }
  | { type: 'removeRedaction' }
  | { type: 'clearRedactions' }

export interface HistoryCommand {
  id: string
  action: HistoryAction
  execute: () => void
  undo: () => void
}

export type WorkerAction =
  | { type: 'LOAD_PDF'; payload: { id: string; name: string; binary: ArrayBuffer } }
  | { type: 'EXPORT_PDF'; payload: { pages: PageItem[]; sourceId: string } }
  | { type: 'SPLIT_PDF'; payload: { pageIds: string[]; sourceId: string } }

export type WorkerResponse =
  | { type: 'PDF_LOADED'; payload: { sourceFileId: string; pages: Array<{ index: number }> } }
  | { type: 'EXPORT_RESULT'; payload: { bytes: Uint8Array; name: string } }
  | { type: 'ERROR'; payload: { message: string; code?: string } }
