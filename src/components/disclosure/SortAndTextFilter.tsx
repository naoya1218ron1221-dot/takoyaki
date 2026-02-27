import { ArrowDownUp, ArrowUpDown, Layers, Search, X } from 'lucide-react'

export type SortOrder = 'newest' | 'oldest' | 'type'

interface Props {
  sortOrder: SortOrder
  textFilter: string
  onSortOrder: (order: SortOrder) => void
  onTextFilter: (text: string) => void
  resultCount: number
}

const SORT_OPTIONS: { value: SortOrder; label: string; Icon: React.ComponentType<{ size: number; className?: string }> }[] = [
  { value: 'newest', label: '新→古', Icon: ArrowDownUp },
  { value: 'oldest', label: '古→新', Icon: ArrowUpDown },
  { value: 'type', label: '種別順', Icon: Layers },
]

export default function SortAndTextFilter({
  sortOrder,
  textFilter,
  onSortOrder,
  onTextFilter,
  resultCount,
}: Props) {
  return (
    <div className="mt-3 space-y-2">
      {/* ソートボタン行 */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">並び順</span>
        <div className="flex gap-1.5 flex-1">
          {SORT_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => onSortOrder(value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                sortOrder === value
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <Icon size={12} className="flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-auto">
          {resultCount}件
        </span>
      </div>

      {/* テキスト絞り込み */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600"
        />
        <input
          type="text"
          value={textFilter}
          onChange={e => onTextFilter(e.target.value)}
          placeholder="タイトルで絞り込み…"
          className="w-full pl-8 pr-8 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
        />
        {textFilter && (
          <button
            onClick={() => onTextFilter('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
            aria-label="クリア"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
