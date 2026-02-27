import { useState, useCallback } from 'react'
import { X, Plus, Search, Star, Loader2, AlertCircle, ChevronRight } from 'lucide-react'
import { searchStocks } from '../../data/stockList'
import type { StockInfo } from '../../data/stockList'
import type { DisclosureItem } from '../../types/disclosure'

interface Props {
  favorites: StockInfo[]
  onClose: () => void
  onSelectItem: (item: DisclosureItem) => void
}

interface PortfolioResult {
  stock: StockInfo
  status: 'pending' | 'searching' | 'done' | 'error'
  items: DisclosureItem[]
  error?: string
}

async function fetchOneStock(code: string): Promise<DisclosureItem[]> {
  const currentYear = new Date().getFullYear()
  const all: DisclosureItem[] = []
  // Only search last 2 years for portfolio view (faster)
  for (let i = 0; i < 2; i++) {
    const year = currentYear - i
    try {
      const res = await fetch(`/api/search?code=${code}&year=${year}`)
      if (res.ok) {
        const data = await res.json() as { items: DisclosureItem[] }
        all.push(...(data.items ?? []))
      }
    } catch {
      // ignore per-year errors
    }
  }
  try {
    const res = await fetch(`/api/tdnet-search?code=${code}&years=2`)
    if (res.ok) {
      const data = await res.json() as { items: DisclosureItem[] }
      all.push(...(data.items ?? []))
    }
  } catch {
    // ignore
  }
  return all
}

export default function PortfolioModal({ favorites, onClose, onSelectItem }: Props) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<StockInfo[]>([])
  const [portfolio, setPortfolio] = useState<StockInfo[]>([])
  const [results, setResults] = useState<PortfolioResult[]>([])
  const [running, setRunning] = useState(false)

  const handleQueryChange = (v: string) => {
    setQuery(v)
    setSuggestions(v.trim() ? searchStocks(v.trim(), 5) : [])
  }

  const addStock = useCallback((stock: StockInfo) => {
    if (portfolio.some(p => p.code === stock.code)) return
    if (portfolio.length >= 10) return
    setPortfolio(prev => [...prev, stock])
    setQuery('')
    setSuggestions([])
  }, [portfolio])

  const removeStock = (code: string) => {
    setPortfolio(prev => prev.filter(p => p.code !== code))
  }

  const addFromFavorites = (stock: StockInfo) => {
    if (!portfolio.some(p => p.code === stock.code) && portfolio.length < 10) {
      setPortfolio(prev => [...prev, stock])
    }
  }

  const runSearch = async () => {
    if (portfolio.length === 0) return
    setRunning(true)
    const initial: PortfolioResult[] = portfolio.map(s => ({
      stock: s,
      status: 'pending',
      items: [],
    }))
    setResults(initial)

    for (let i = 0; i < portfolio.length; i++) {
      const stock = portfolio[i]
      setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'searching' } : r))
      try {
        const items = await fetchOneStock(stock.code)
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'done', items } : r))
      } catch {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error', error: '取得失敗' } : r))
      }
    }
    setRunning(false)
  }

  const hasResults = results.some(r => r.items.length > 0)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-t-3xl mt-auto max-h-[90vh]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100">ポートフォリオ検索</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">複数銘柄を一括検索（最大10銘柄）</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* 銘柄追加 */}
          {!running && (
            <div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-600" />
                <input
                  type="text"
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  placeholder="銘柄コード or 会社名で追加…"
                  className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                />
              </div>

              {/* サジェスト */}
              {suggestions.length > 0 && (
                <div className="mt-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-lg overflow-hidden">
                  {suggestions.map(s => (
                    <button
                      key={s.code}
                      onClick={() => addStock(s)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="text-sm font-mono font-bold text-blue-500 dark:text-blue-400 w-10 flex-shrink-0">{s.code}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-200 flex-1 truncate">{s.name}</span>
                      <Plus size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* お気に入りから追加 */}
              {favorites.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">お気に入りから追加</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {favorites.map(fav => {
                      const added = portfolio.some(p => p.code === fav.code)
                      return (
                        <button
                          key={fav.code}
                          onClick={() => addFromFavorites(fav)}
                          disabled={added || portfolio.length >= 10}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            added
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 opacity-50'
                              : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                          }`}
                        >
                          <span className="font-mono">{fav.code}</span>
                          <span className="hidden sm:inline">{fav.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 選択済み銘柄リスト */}
          {portfolio.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                検索対象 ({portfolio.length}/10)
              </p>
              {portfolio.map(stock => {
                const result = results.find(r => r.stock.code === stock.code)
                return (
                  <div
                    key={stock.code}
                    className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2"
                  >
                    <span className="text-sm font-mono font-bold text-blue-500 dark:text-blue-400 w-10 flex-shrink-0">
                      {stock.code}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-200 flex-1 truncate">
                      {stock.name}
                    </span>

                    {/* ステータス */}
                    {result && (
                      <span className="flex-shrink-0">
                        {result.status === 'searching' && (
                          <Loader2 size={14} className="animate-spin text-blue-400" />
                        )}
                        {result.status === 'done' && (
                          <span className="text-xs text-gray-400">{result.items.length}件</span>
                        )}
                        {result.status === 'error' && (
                          <AlertCircle size={14} className="text-rose-400" />
                        )}
                      </span>
                    )}

                    {!running && (
                      <button
                        onClick={() => removeStock(stock.code)}
                        className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 flex-shrink-0 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* 結果表示 */}
          {hasResults && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">検索結果（過去2年分）</p>
              {results.filter(r => r.items.length > 0).map(result => (
                <div key={result.stock.code} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-mono font-bold text-blue-500 dark:text-blue-400">{result.stock.code}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex-1 truncate">{result.stock.name}</span>
                    <span className="text-xs text-gray-400">{result.items.length}件</span>
                  </div>
                  {result.items.slice(0, 3).map(item => (
                    <button
                      key={item.id}
                      onClick={() => { onSelectItem(item); onClose() }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left border-b border-gray-50 dark:border-gray-700/50 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">{item.filedDate} · {item.docTypeLabel}</p>
                      </div>
                      <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    </button>
                  ))}
                  {result.items.length > 3 && (
                    <p className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500 text-center">
                      他{result.items.length - 3}件…
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* フッターボタン */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <button
            onClick={runSearch}
            disabled={portfolio.length === 0 || running}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl disabled:opacity-50 hover:from-blue-600 hover:to-cyan-600 active:scale-[0.98] transition-all shadow-md shadow-blue-200/50 dark:shadow-blue-900/30"
          >
            {running ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                検索中…
              </>
            ) : (
              <>
                <Search size={18} />
                {portfolio.length}銘柄を一括検索
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
