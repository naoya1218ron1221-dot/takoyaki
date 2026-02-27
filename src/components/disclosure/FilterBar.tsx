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
  count,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
        active
          ? 'bg-blue-500 dark:bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-blue-900/50'
          : 'bg-gray-100 dark:bg-gray-700/80 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
          active
            ? 'bg-white/25 text-white'
            : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  )
}

const SOURCE_LABEL: Record<string, string> = {
  edinet: 'EDINET',
  tdnet: 'TDnet',
}

export default function FilterBar({
  items,
  filterSource,
  filterDocType,
  onFilterSource,
  onFilterDocType,
  totalFiltered,
}: Props) {
  // ソース別件数
  const sourceCounts = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.source] = (acc[i.source] ?? 0) + 1
    return acc
  }, {})

  // 書類種別別件数
  const docTypeCounts = items.reduce<Record<string, number>>((acc, i) => {
    acc[i.docTypeLabel] = (acc[i.docTypeLabel] ?? 0) + 1
    return acc
  }, {})

  const sources = Object.keys(sourceCounts) as DisclosureSource[]
  const docTypes = Object.keys(docTypeCounts) as DocTypeLabel[]

  return (
    <div className="mt-4 space-y-2.5">
      {/* ソース別フィルター */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        <Chip
          active={filterSource === 'all'}
          onClick={() => onFilterSource('all')}
          count={items.length}
        >
          すべて
        </Chip>
        {sources.map(s => (
          <Chip
            key={s}
            active={filterSource === s}
            onClick={() => onFilterSource(s)}
            count={sourceCounts[s]}
          >
            {SOURCE_LABEL[s] ?? s}
          </Chip>
        ))}
      </div>

      {/* 書類種別フィルター */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        <Chip
          active={filterDocType === 'all'}
          onClick={() => onFilterDocType('all')}
        >
          全種別
        </Chip>
        {docTypes.map(t => (
          <Chip
            key={t}
            active={filterDocType === t}
            onClick={() => onFilterDocType(t)}
            count={docTypeCounts[t]}
          >
            {t}
          </Chip>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 pl-0.5">
        {totalFiltered}件を表示
      </p>
    </div>
  )
}
