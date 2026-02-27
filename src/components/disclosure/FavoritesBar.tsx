import { Star, X, ChevronRight } from 'lucide-react'
import type { StockInfo } from '../../data/stockList'

interface Props {
  favorites: StockInfo[]
  onSelect: (code: string) => void
  onRemove: (code: string) => void
}

export default function FavoritesBar({ favorites, onSelect, onRemove }: Props) {
  if (favorites.length === 0) {
    return (
      <div className="mt-3 flex items-center gap-2 px-1">
        <Star size={13} className="text-amber-300 flex-shrink-0" />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          検索後、★ボタンで銘柄をお気に入り登録できます
        </p>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1.5 mb-1.5 px-1">
        <Star size={12} className="text-amber-400 fill-amber-400" />
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">お気に入り</span>
        <ChevronRight size={12} className="text-gray-300 dark:text-gray-600" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-5 px-5">
        {favorites.map(stock => (
          <div
            key={stock.code}
            className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-3 py-2 flex-shrink-0 group"
          >
            <button
              className="flex items-center gap-1.5 min-w-0"
              onClick={() => onSelect(stock.code)}
            >
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                {stock.code}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[5rem]">
                {stock.name}
              </span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(stock.code) }}
              className="ml-1 text-amber-300 dark:text-amber-700 hover:text-amber-500 dark:hover:text-amber-400 flex-shrink-0 transition-colors"
              aria-label="お気に入りから削除"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
