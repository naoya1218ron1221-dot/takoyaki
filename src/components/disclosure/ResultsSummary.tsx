import { Database, TrendingUp, Calendar } from 'lucide-react'
import type { DisclosureItem } from '../../types/disclosure'

interface Props {
  items: DisclosureItem[]
}

export default function ResultsSummary({ items }: Props) {
  if (items.length === 0) return null

  const edinetCount = items.filter(i => i.source === 'edinet').length
  const tdnetCount = items.filter(i => i.source === 'tdnet').length

  // 日付範囲
  const dates = items.map(i => i.filedDate).sort()
  const oldest = dates[0] ?? ''
  const newest = dates[dates.length - 1] ?? ''

  // 書類種別ごとのカウント
  const typeCounts: Record<string, number> = {}
  for (const item of items) {
    typeCounts[item.docTypeLabel] = (typeCounts[item.docTypeLabel] ?? 0) + 1
  }
  const topTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  const formatDate = (d: string) => {
    if (!d) return '―'
    return d.slice(0, 7).replace('-', '/')
  }

  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {/* EDINET件数 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-center border border-blue-100 dark:border-blue-800/40">
        <Database size={14} className="mx-auto mb-1 text-blue-400" />
        <p className="text-xs text-blue-400 dark:text-blue-500 font-medium">EDINET</p>
        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{edinetCount}</p>
        <p className="text-[10px] text-blue-300 dark:text-blue-600">件</p>
      </div>

      {/* TDnet件数 */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center border border-amber-100 dark:border-amber-800/40">
        <TrendingUp size={14} className="mx-auto mb-1 text-amber-400" />
        <p className="text-xs text-amber-400 dark:text-amber-500 font-medium">TDnet</p>
        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{tdnetCount}</p>
        <p className="text-[10px] text-amber-300 dark:text-amber-600">件</p>
      </div>

      {/* 日付範囲 */}
      <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3 text-center border border-teal-100 dark:border-teal-800/40">
        <Calendar size={14} className="mx-auto mb-1 text-teal-400" />
        <p className="text-xs text-teal-400 dark:text-teal-500 font-medium">期間</p>
        <p className="text-[11px] font-bold text-teal-600 dark:text-teal-400 leading-tight mt-0.5">
          {formatDate(oldest)}
        </p>
        <p className="text-[10px] text-teal-300 dark:text-teal-600">〜{formatDate(newest)}</p>
      </div>

      {/* 書類種別内訳（3列スパン） */}
      {topTypes.length > 0 && (
        <div className="col-span-3 bg-white dark:bg-gray-800 rounded-xl px-4 py-2.5 border border-gray-100 dark:border-gray-700 flex items-center gap-3 flex-wrap">
          {topTypes.map(([label, count]) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{count}件</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
