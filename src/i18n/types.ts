import type { TabId } from '../types'

export type Locale = 'zh' | 'en' | 'ko' | 'ja' | 'de'

export type ModuleId = Exclude<TabId, 'home'>

/** Every module has a short guide shown below the tool. */
export type GuideModuleId = ModuleId

export interface ModuleCopy {
  title: string
  tagline: string
  description: string
  features: string[]
  cta: string
}

export interface HomeCopy {
  badge: string
  titleLead: string
  titleHighlight: string
  subtitle: string
  ctaPrimary: string
  ctaSecondary: string
  stats: { value: string; label: string }[]
  modulesTitle: string
  modulesSubtitle: string
  modules: Record<ModuleId, ModuleCopy>
  steps: { no: string; title: string; description: string }[]
  privacyTitle: string
  privacySubtitle: string
  privacy: { icon: string; title: string; description: string }[]
  footerBrand: string
  footerNote: string
}

export interface CommonCopy {
  language: string
  switchLanguage: string
  backHome: string
  appTitle: string
  loading: string
  footer: {
    about: string
    contact: string
    privacy: string
    terms: string
    help: string
    guides: string
  }
}

export interface HistoryCopy {
  title: string
  undoTitle: string
  redoTitle: string
  empty: string
  rotate: (page: number) => string
  remove: (page: number) => string
  move: (page: number) => string
  addRedaction: string
  removeRedaction: string
  clearRedactions: string
}

export interface SplitterCopy {
  dropTitle: string
  dropHint: string
  pageAlt: (page: number) => string
  loadFailed: (message: string) => string
  exportFailed: (message: string) => string
  sourceOverview: (total: number) => string
  changeFile: string
  close: string
  rangeMode: string
  scatterMode: string
  to: string
  selectedCount: (count: number) => string
  scatterPlaceholder: string
  startAlt: string
  startPage: (page: number) => string
  skipped: (count: number) => string
  endAlt: string
  endPage: (page: number) => string
  selectedThumbAlt: (page: number) => string
  loading: string
  pageLabel: (page: number) => string
  scatterEmptyTitle: string
  scatterEmptyHint: string
  exporting: string
  exportButton: string
}

export interface EditorCopy {
  dropTitle: string
  dropHint: string
  operationFailed: (message: string) => string
  wrongPassword: string
  pageAlt: (page: number) => string
  totalPages: (total: number) => string
  canvas: string
  canvasPage: (current: number, total: number) => string
  reselectTitle: string
  reselect: string
  closeTitle: string
  close: string
  removeRedaction: string
  rotate: string
  remove: string
  history: HistoryCopy
}

export interface ThumbnailsCopy {
  expandTitle: string
  pages: string
  pageAlt: (page: number) => string
  pageLabel: (page: number) => string
}

export interface MergerCopy {
  mergeFailed: (message: string) => string
  dropTitle: string
  dropHint: string
  pdf: string
  image: string
  addFiles: string
  clearAll: string
  merging: string
  download: string
  sendToEditor: string
}

export interface ImageToPdfCopy {
  mergeFailed: (message: string) => string
  rejectPdf: string
  dropTitle: string
  dropHint: string
  addFiles: string
  clearAll: string
  imageLabel: string
  merging: string
  download: string
  sendToEditor: string
}

export interface UnlockCopy {
  title: string
  ownerTitle: string
  ownerDesc: string
  userTitle: string
  userDesc: string
  dropTitle: string
  addMore: string
  processing: string
  unlockOwner: string
  unlockUser: string
  detected: (file: string) => string
  enterPassword: string
  passwordPlaceholder: string
  wrongPassword: string
  cancel: string
  confirm: string
  reprocess: string
  reprocessHint: string
  needsPassword: string
  ownership: string
  ownershipHint: string
  disclaimer: string
}

export interface EncryptCopy {
  title: string
  subtitle: string
  dropTitle: string
  changeFile: string
  userPassword: string
  userPasswordHint: string
  userPasswordPlaceholder: string
  confirmPassword: string
  confirmPasswordPlaceholder: string
  ownerPassword: string
  ownerPasswordHint: string
  ownerPasswordPlaceholder: string
  permissions: string
  permissionPrint: string
  permissionCopy: string
  permissionModify: string
  permissionAnnotate: string
  permissionForms: string
  permissionAssemble: string
  encryptionNote: string
  encrypting: string
  encrypt: string
  passwordRequired: string
  passwordMismatch: string
  alreadyEncrypted: string
  encryptFailed: (message: string) => string
  success: string
}

export interface ToolboxCopy {
  exportFailed: (message: string) => string
  pageFileName: (base: string, page: number, format: string) => string
  imagesZipName: (base: string) => string
  longImageName: (base: string, format: string) => string
  convertTitle: string
  pageCount: (count: number) => string
  changeFile: string
  dropPdf: string
  dpi: string
  dpiHints: string[]
  format: string
  exportMode: string
  single: string
  longImage: string
  exporting: string
  exportImages: (count: number, dpi: number, format: string) => string
  exportLong: (dpi: number, format: string) => string
}

export interface DrawerCopy {
  expandTitle: string
  title: string
  split: {
    title: string
    searchPlaceholder: string
    pageLabel: (page: number) => string
    range: string
    scatter: string
    rangePlaceholder: string
    export: string
  }
  watermark: {
    title: string
    textTab: string
    imageTab: string
    textPlaceholder: string
    fontSize: (size: number) => string
    opacity: (value: string) => string
    rotation: (degrees: number) => string
    color: (hex: string) => string
    mode: string
    tile: string
    single: string
    spacing: (gap: number) => string
    uploadImage: string
    imageScale: (percent: number) => string
    hint: string
    pageRange: string
    allPages: string
    firstPage: string
    custom: string
    rangePlaceholder: string
    appliesTo: (count: number) => string
    imageFallback: string
  }
  export: {
    finalPdf: string
    splitPdf: string
  }
  redaction: {
    title: string
    hint: string
    done: string
    enter: string
    currentPage: string
    clearAll: (count: number) => string
    empty: string
  }
  history: HistoryCopy
}

export interface PasswordCopy {
  title: string
  placeholder: string
  cancel: string
  unlock: string
}

export interface WorkerCopy {
  watermarkEmbedFailed: (message: string) => string
}

/** Long-form copy shown under each tool to give Auto ads real content to scan. */
export interface GuideCopy {
  title: string
  intro: string
  tips: string[]
}

/** Copy shared by every locale and used by the landing page and navigation. */
export interface HomeMessages {
  nav: Record<TabId, string>
  common: CommonCopy
  home: HomeCopy
}

/** Full message tree. Tool copy is merged in `messages.ts`. */
export interface Messages extends HomeMessages {
  splitter: SplitterCopy
  editor: EditorCopy
  thumbnails: ThumbnailsCopy
  merger: MergerCopy
  img2pdf: ImageToPdfCopy
  toolbox: ToolboxCopy
  unlock: UnlockCopy
  encrypt: EncryptCopy
  drawer: DrawerCopy
  password: PasswordCopy
  worker: WorkerCopy
  guides: Record<GuideModuleId, GuideCopy>
}