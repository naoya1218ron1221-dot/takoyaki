import { useState } from 'react'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { clsx } from 'clsx'
import { ExternalLink, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import type { StockItem } from '../types'
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '../types'

interface Props {
  item: StockItem
  onEdit: (item: StockItem) => void
  onDelete: (id: string) => void
}

function getDaysUntil(dateStr: string): number {
  try {
    return differenceInCalendarDays(parseISO(dateStr), new Date())
  } catch {
    return 0
  }
}

function CountdownBadge({ days }: { days: number }) {
  if (days < 0) {
    return (
      <span className="text-xs font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
        {Math.abs(days)}日前
      </span>
    )
  }
  if (days === 0) {
    return (
      <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded-full animate-pulse">
        今日！
      </span>
    )
  }
  if (days === 1) {
    return (
      <span className="text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full">
        明日！
      </span>
    )
  }
  if (days <= 7) {
    return (
      <span className="text-xs font-bold text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded-full ring-1 ring-orange-500/40">
        あと{days}日
      </span>
    )
  }
  if (days <= 30) {
    return (
      <span className="text-xs font-semibold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full ring-1 ring-blue-500/30">
        あと{days}日
      </span>
    )
  }
  return (
    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
      あと{days}日
    </span>
  )
}

export function EventCard({ item, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const days = getDaysUntil(item.date)
  const colors = EVENT_TYPE_COLORS[item.type]

  const dateStr = (() => {
    try {
      const d = parseISO(item.date)
      return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
    } catch {
      return item.date
    }
  })()

  return (
    <div
      className={clsx(
        'rounded-xl border bg-slate-900/80 backdrop-blur-sm transition-all duration-200',
        days === 0
          ? 'border-red-500/60 shadow-lg shadow-red-500/10'
          : days <= 3
            ? 'border-orange-500/40'
            : 'border-slate-700/60'
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-blue-400 font-mono tracking-wide shrink-0">
              {item.code}
            </span>
            <span className="text-sm font-semibold text-white truncate">{item.name}</span>
          </div>
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
            aria-label="編集"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="削除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Middle row: badge + countdown + date */}
      <div className="flex items-center gap-2 px-3 py-1 flex-wrap">
        <span
          className={clsx(
            'text-xs font-semibold px-2 py-0.5 rounded-full ring-1',
            colors.bg,
            colors.text,
            colors.ring
          )}
        >
          {EVENT_TYPE_LABELS[item.type]}
        </span>
        <CountdownBadge days={days} />
        <span className="text-xs text-slate-500 ml-auto">{dateStr}</span>
      </div>

      {/* Memo row */}
      {item.memo && (
        <div className="px-3 pb-1">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-start gap-1 w-full text-left group"
          >
            <span
              className={clsx(
                'text-xs text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed',
                !expanded && 'line-clamp-1'
              )}
            >
              {item.memo}
            </span>
            {item.memo.length > 50 && (
              <span className="shrink-0 text-slate-600 mt-0.5">
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Bottom: external links */}
      <div className="flex items-center gap-1 px-3 pb-2.5 pt-1 border-t border-slate-800/60 mt-1">
        <a
          href={`https://finance.yahoo.co.jp/quote/${item.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-purple-500/20 hover:text-purple-300 transition-colors"
        >
          <ExternalLink size={11} />
          Yahoo!
        </a>
        <a
          href={`https://kabutan.jp/stock/?code=${item.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-green-500/20 hover:text-green-300 transition-colors"
        >
          <ExternalLink size={11} />
          株探
        </a>
        <a
          href={`https://x.com/search?q=%24${item.code}&f=live`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-sky-500/20 hover:text-sky-300 transition-colors"
        >
          <ExternalLink size={11} />X
        </a>
      </div>
    </div>
  )
}
