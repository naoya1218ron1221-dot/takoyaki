import { ExternalLink, FileText, BarChart3, FileBarChart2, BookOpen, Star, Eye } from 'lucide-react'
import type { DisclosureItem } from '../../types/disclosure'

// 書類種別ごとの色 (左ボーダー + バッジ)
const DOC_TYPE_STYLE: Record<string, { border: string; badge: string; icon: React.ReactNode }> = {
  '決算短信': {
    border: 'border-l-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    icon: <BarChart3 size={13} />,
  },
  '有価証券報告書': {
    border: 'border-l-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
    icon: <BookOpen size={13} />,
  },
  '四半期報告書': {
    border: 'border-l-cyan-400',
    badge: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400',
    icon: <FileBarChart2 size={13} />,
  },
  '半期報告書': {
    border: 'border-l-teal-400',
    badge: 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400',
    icon: <FileBarChart2 size={13} />,
  },
}

const DEFAULT_STYLE = {
  border: 'border-l-gray-300',
  badge: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  icon: <FileText size={13} />,
}

const SOURCE_STYLE: Record<string, string> = {
  edinet: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400',
  tdnet: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
}

interface Props {
  item: DisclosureItem
  selected: boolean
  onToggleSelect: (id: string) => void
  isFavorite?: boolean
  onToggleFavorite?: (item: DisclosureItem) => void
  onPreview?: (item: DisclosureItem) => void
}

export default function DisclosureCard({
  item,
  selected,
  onToggleSelect,
  isFavorite = false,
  onToggleFavorite,
  onPreview,
}: Props) {
  const style = DOC_TYPE_STYLE[item.docTypeLabel] ?? DEFAULT_STYLE

  const handlePdfOpen = (e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(item.pdfUrl, '_blank', 'noopener,noreferrer')
  }

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPreview?.(item)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.(item)
  }

  return (
    <div
      onClick={() => onToggleSelect(item.id)}
      className={`
        bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-l-4 border border-r border-t border-b
        p-3.5 transition-all duration-150 cursor-pointer select-none active:scale-[0.99]
        ${style.border}
        ${selected
          ? 'border-r-blue-200 border-t-blue-200 border-b-blue-200 dark:border-r-blue-800 dark:border-t-blue-800 dark:border-b-blue-800 ring-1 ring-blue-300 dark:ring-blue-700 bg-blue-50/40 dark:bg-blue-900/10'
          : 'border-r-gray-100 border-t-gray-100 border-b-gray-100 dark:border-r-gray-700 dark:border-t-gray-700 dark:border-b-gray-700'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {/* チェックボックス */}
        <div
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-all ${
            selected
              ? 'bg-blue-500 border-blue-500'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
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
          {/* バッジ行 */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${SOURCE_STYLE[item.source] ?? ''}`}>
              {item.source.toUpperCase()}
            </span>
            <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${style.badge}`}>
              {style.icon}
              {item.docTypeLabel}
            </span>
          </div>

          {/* タイトル */}
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2 mb-1">
            {item.title}
          </p>

          {/* 会社名・日付行 */}
          <div className="flex items-center gap-2 flex-wrap">
            {item.companyName && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.companyName}</span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">{item.filedDate}</span>
          </div>
        </div>

        {/* アクションボタン群 */}
        <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
          {/* お気に入りボタン */}
          {onToggleFavorite && (
            <button
              onClick={handleFavorite}
              className={`p-1.5 rounded-lg transition-all ${
                isFavorite
                  ? 'text-amber-400 hover:text-amber-500 bg-amber-50 dark:bg-amber-900/20'
                  : 'text-gray-300 dark:text-gray-600 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
              }`}
              aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
            >
              <Star size={15} className={isFavorite ? 'fill-amber-400' : ''} />
            </button>
          )}

          <div className="flex items-center gap-1">
            {/* プレビューボタン */}
            {onPreview && (
              <button
                onClick={handlePreview}
                className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-400 dark:text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 rounded-lg transition-all text-[11px] font-medium"
                aria-label="プレビュー"
              >
                <Eye size={13} />
              </button>
            )}

            {/* PDF開くボタン */}
            <button
              onClick={handlePdfOpen}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg transition-all text-[11px] font-medium"
              aria-label="PDFを開く"
            >
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
