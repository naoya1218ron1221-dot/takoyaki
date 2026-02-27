import { ExternalLink } from 'lucide-react'
import type { DisclosureItem } from '../../types/disclosure'

const SOURCE_BADGE: Record<string, string> = {
  edinet: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  tdnet: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
}

const DOC_TYPE_COLOR: Record<string, string> = {
  '決算短信': 'text-amber-600 dark:text-amber-400',
  '有価証券報告書': 'text-blue-600 dark:text-blue-400',
  '四半期報告書': 'text-cyan-600 dark:text-cyan-400',
  '半期報告書': 'text-teal-600 dark:text-teal-400',
}

interface Props {
  item: DisclosureItem
  selected: boolean
  onToggleSelect: (id: string) => void
}

export default function DisclosureCard({ item, selected, onToggleSelect }: Props) {
  const handlePdfOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(item.pdfUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      onClick={() => onToggleSelect(item.id)}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border p-4 transition-all cursor-pointer select-none active:scale-[0.99] ${
        selected
          ? 'border-blue-400 dark:border-blue-600 ring-2 ring-blue-300 dark:ring-blue-700 bg-blue-50/30 dark:bg-blue-900/10'
          : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* チェックボックス */}
        <div
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            selected
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          aria-hidden="true"
        >
          {selected && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SOURCE_BADGE[item.source] ?? ''}`}>
              {item.source.toUpperCase()}
            </span>
            <span className={`text-[11px] font-semibold ${DOC_TYPE_COLOR[item.docTypeLabel] ?? 'text-gray-500 dark:text-gray-400'}`}>
              {item.docTypeLabel}
            </span>
          </div>

          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
            {item.title}
          </p>

          {item.companyName && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.companyName}</p>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{item.filedDate}</p>
        </div>

        {/* PDFリンク */}
        <button
          onClick={handlePdfOpen}
          className="p-2 text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex-shrink-0"
          aria-label="PDFを開く"
        >
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  )
}
