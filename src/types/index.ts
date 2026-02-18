export type EventType = 'earnings' | 'rights' | 'product' | 'ipo' | 'other'

export interface StockItem {
  id: string
  code: string
  name: string
  date: string // ISO date string
  type: EventType
  memo: string
}

export interface Page {
  id: number
  name: string
  items: StockItem[]
}

export type AppData = Page[]

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  earnings: '決算',
  rights: '権利付',
  product: '新製品/発表',
  ipo: 'IPO',
  other: 'その他',
}

export const EVENT_TYPE_COLORS: Record<EventType, { bg: string; text: string; ring: string }> = {
  earnings: { bg: 'bg-red-500/20', text: 'text-red-400', ring: 'ring-red-500/30' },
  rights: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
  product: { bg: 'bg-blue-500/20', text: 'text-blue-400', ring: 'ring-blue-500/30' },
  ipo: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', ring: 'ring-yellow-500/30' },
  other: { bg: 'bg-slate-500/20', text: 'text-slate-400', ring: 'ring-slate-500/30' },
}
