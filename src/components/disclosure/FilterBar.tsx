import type { DisclosureItem, DocTypeLabel, DisclosureSource } from '../../types/disclosure'

interface Props {
  items: DisclosureItem[]
  filterSource: DisclosureSource | 'all'
  filterDocType: DocTypeLabel | 'all'
  onFilterSource: (v: DisclosureSource | 'all') => void
  onFilterDocType: (v: DocTypeLabel | 'all') => void
  totalFiltered: number
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
        active
          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 ring-2 ring-blue-400 dark:ring-blue-600'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  )
}

export default function FilterBar({
  items,
  filterSource,
  filterDocType,
  onFilterSource,
  onFilterDocType,
  totalFiltered,
}: Props) {
  const sources = [...new Set(items.map(i => i.source))] as DisclosureSource[]
  const docTypes = [...new Set(items.map(i => i.docTypeLabel))] as DocTypeLabel[]

  const sourceLabel: Record<string, string> = {
    edinet: 'EDINET',
    tdnet: 'TDnet',
  }

  return (
    <div className="mt-4 space-y-2">
      {/* ソース別フィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Chip active={filterSource === 'all'} onClick={() => onFilterSource('all')}>
          すべて
        </Chip>
        {sources.map(s => (
          <Chip key={s} active={filterSource === s} onClick={() => onFilterSource(s)}>
            {sourceLabel[s] ?? s}
          </Chip>
        ))}
      </div>

      {/* 書類種別フィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Chip active={filterDocType === 'all'} onClick={() => onFilterDocType('all')}>
          全種別
        </Chip>
        {docTypes.map(t => (
          <Chip key={t} active={filterDocType === t} onClick={() => onFilterDocType(t)}>
            {t}
          </Chip>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">{totalFiltered}件</p>
    </div>
  )
}
