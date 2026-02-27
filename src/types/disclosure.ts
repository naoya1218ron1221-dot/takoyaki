export type DisclosureSource = 'edinet' | 'tdnet'

export type DocTypeLabel =
  | '有価証券報告書'
  | '四半期報告書'
  | '半期報告書'
  | '決算短信'
  | 'その他'

export interface DisclosureItem {
  id: string
  source: DisclosureSource
  docTypeLabel: DocTypeLabel
  title: string
  companyName: string
  secCode: string
  filedDate: string // 'YYYY-MM-DD'
  pdfUrl: string // '/api/proxy-pdf?id=...&source=...'
}

export interface SearchState {
  status: 'idle' | 'searching' | 'done' | 'error'
  yearProgress: number
  totalYears: number
  searchingLabel: string
  items: DisclosureItem[]
  error: string | null
}
