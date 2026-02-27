import { useState, useEffect } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'

interface Props {
  onSearch: (code: string) => void
  isSearching: boolean
}

const HISTORY_KEY = 'disclosure-search-history'
const MAX_HISTORY = 5

// よく使われる人気銘柄
const POPULAR_STOCKS = [
  { code: '7203', name: 'トヨタ' },
  { code: '6758', name: 'ソニー' },
  { code: '9984', name: 'ソフトバンクG' },
  { code: '6861', name: 'キーエンス' },
  { code: '7974', name: '任天堂' },
]

function loadHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveHistory(codes: string[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(codes.slice(0, MAX_HISTORY)))
}

export default function SearchBar({ onSearch, isSearching }: Props) {
  const [code, setCode] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(code.trim())
  }

  const doSearch = (value: string) => {
    if (!/^\d{4}$/.test(value)) return
    const next = [value, ...history.filter(h => h !== value)]
    setHistory(next)
    saveHistory(next)
    setCode(value)
    setFocused(false)
    onSearch(value)
  }

  const removeHistory = (c: string) => {
    const next = history.filter(h => h !== c)
    setHistory(next)
    saveHistory(next)
  }

  const isValid = /^\d{4}$/.test(code.trim())
  const showDropdown = focused && !isSearching && (history.length > 0 || code.length === 0)

  return (
    <div className="mt-4 relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="証券コード（例: 7203）"
            className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500 text-base"
            disabled={isSearching}
          />
          {code && (
            <button
              type="button"
              onClick={() => setCode('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 transition-colors"
              aria-label="クリア"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isSearching || !isValid}
          className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl disabled:opacity-50 hover:from-blue-600 hover:to-cyan-600 active:scale-[0.98] transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md shadow-blue-200/50 dark:shadow-blue-900/30"
        >
          {isSearching ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              検索中
            </>
          ) : (
            <>
              <Search size={18} />
              検索
            </>
          )}
        </button>
      </form>

      {/* ドロップダウン（履歴 + 人気銘柄） */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-xl shadow-gray-200/60 dark:shadow-gray-900/60 overflow-hidden z-30">
          {/* 検索履歴 */}
          {history.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
                <Clock size={12} className="text-gray-400" />
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">最近の検索</span>
              </div>
              {history.map(h => (
                <div
                  key={h}
                  className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onMouseDown={() => doSearch(h)}
                >
                  <Clock size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">{h}</span>
                  <button
                    onMouseDown={(e) => { e.stopPropagation(); removeHistory(h) }}
                    className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 p-0.5"
                    aria-label="履歴を削除"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 人気銘柄 */}
          <div>
            <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
              <TrendingUp size={12} className="text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">人気銘柄</span>
            </div>
            {POPULAR_STOCKS.map(s => (
              <div
                key={s.code}
                className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onMouseDown={() => doSearch(s.code)}
              >
                <span className="text-sm font-mono font-bold text-blue-500 dark:text-blue-400 w-10">{s.code}</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{s.name}</span>
              </div>
            ))}
            <div className="h-2" />
          </div>
        </div>
      )}
    </div>
  )
}
