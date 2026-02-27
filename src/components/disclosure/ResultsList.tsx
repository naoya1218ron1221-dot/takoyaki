import type { DisclosureItem } from '../../types/disclosure'
import DisclosureCard from './DisclosureCard'

interface Props {
  items: DisclosureItem[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

function groupByYear(items: DisclosureItem[]): [string, DisclosureItem[]][] {
  const map = new Map<string, DisclosureItem[]>()
  for (const item of items) {
    const year = item.filedDate.slice(0, 4) || '不明'
    if (!map.has(year)) map.set(year, [])
    map.get(year)!.push(item)
  }
  // 年度降順（最新→古い）
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

export default function ResultsList({
  items,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
}: Props) {
  if (items.length === 0) {
    return (
      <p className="mt-8 text-center text-gray-400 dark:text-gray-500 text-sm">
        条件に一致する書類がありません
      </p>
    )
  }

  const allSelected = items.length > 0 && items.every(i => selectedIds.has(i.id))
  const grouped = groupByYear(items)

  return (
    <div className="mt-3">
      {/* 全選択コントロール */}
      <div className="flex items-center justify-between mb-4 px-0.5">
        <button
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="flex items-center gap-2 select-none"
        >
          <div
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
              allSelected
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {allSelected && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {allSelected ? 'すべて解除' : 'すべて選択'}
          </span>
        </button>

        {selectedIds.size > 0 && (
          <span className="text-xs font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">
            {selectedIds.size}件選択中
          </span>
        )}
      </div>

      {/* 年度別グループ */}
      <div className="space-y-5">
        {grouped.map(([year, yearItems]) => (
          <section key={year}>
            {/* 年度ヘッダー */}
            <div className="flex items-center gap-2 mb-2.5 sticky top-0 z-10 bg-gradient-to-b from-blue-50/90 dark:from-gray-900/90 to-transparent backdrop-blur-[2px] py-1">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full">
                {year}年
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {yearItems.length}件
              </span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>

            {/* カードリスト */}
            <div className="space-y-2.5">
              {yearItems.map(item => (
                <DisclosureCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  onToggleSelect={onToggleSelect}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
