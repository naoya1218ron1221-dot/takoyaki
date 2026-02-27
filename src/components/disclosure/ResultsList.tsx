import type { DisclosureItem } from '../../types/disclosure'
import DisclosureCard from './DisclosureCard'

interface Props {
  items: DisclosureItem[]
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
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

  return (
    <div className="mt-4">
      {/* 全選択コントロール */}
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={allSelected ? onDeselectAll : onSelectAll}
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
          <span
            className="text-sm text-gray-500 dark:text-gray-400"
            onClick={allSelected ? onDeselectAll : onSelectAll}
          >
            {allSelected ? 'すべて解除' : 'すべて選択'}
          </span>
        </label>

        {selectedIds.size > 0 && (
          <span className="text-xs font-medium text-blue-500 dark:text-blue-400">
            {selectedIds.size}件選択中
          </span>
        )}
      </div>

      {/* 書類リスト */}
      <div className="space-y-3">
        {items.map(item => (
          <DisclosureCard
            key={item.id}
            item={item}
            selected={selectedIds.has(item.id)}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </div>
  )
}
