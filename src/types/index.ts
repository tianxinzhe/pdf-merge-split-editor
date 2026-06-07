export type TabId = 'splitter' | 'editor' | 'merger' | 'password'

export interface TabDef {
  id: TabId
  label: string
  icon: string
}

export const TABS: TabDef[] = [
  { id: 'splitter', label: '页面拆分', icon: '✂️' },
  { id: 'editor', label: '编辑精修', icon: '✍️' },
  { id: 'merger', label: '多文件合并', icon: '📂' },
  { id: 'password', label: '闪电密码箱', icon: '⚡' },
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
  pngData?: string
  imageData?: string
  imageName?: string
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

export interface HistoryCommand {
  id: string
  description: string
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
  | { type: 'ERROR'; payload: { message: string } }
