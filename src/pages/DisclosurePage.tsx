import { useState, useMemo } from 'react'
import { FileSearch, Moon, Sun, Briefcase } from 'lucide-react'
import { useDisclosureSearch } from '../hooks/useDisclosureSearch'
import { useTheme } from '../hooks/useTheme'
import { useFavorites } from '../hooks/useFavorites'
import type { DisclosureItem, DocTypeLabel, DisclosureSource } from '../types/disclosure'
import type { StockInfo } from '../data/stockList'
import { getStockName } from '../data/stockList'
import SearchBar from '../components/disclosure/SearchBar'
import SearchProgress from '../components/disclosure/SearchProgress'
import FilterBar from '../components/disclosure/FilterBar'
import ResultsList from '../components/disclosure/ResultsList'
import DownloadBar from '../components/disclosure/DownloadBar'
import FavoritesBar from '../components/disclosure/FavoritesBar'
import PdfPreviewModal from '../components/disclosure/PdfPreviewModal'
import SortAndTextFilter, { type SortOrder } from '../components/disclosure/SortAndTextFilter'
import ResultsSummary from '../components/disclosure/ResultsSummary'
import PortfolioModal from '../components/disclosure/PortfolioModal'

export default function DisclosurePage() {
  const { state, search } = useDisclosureSearch()
  const { theme, toggleTheme } = useTheme()
  const { favorites, toggle: toggleFavorite, has: isFavorite, remove: removeFavorite } = useFavorites()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterSource, setFilterSource] = useState<DisclosureSource | 'all'>('all')
  const [filterDocType, setFilterDocType] = useState<DocTypeLabel | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [textFilter, setTextFilter] = useState('')
  const [previewItem, setPreviewItem] = useState<DisclosureItem | null>(null)
  const [showPortfolio, setShowPortfolio] = useState(false)

  // 現在の検索対象銘柄コード（お気に入りトグル用）
  const [currentCode, setCurrentCode] = useState('')

  const filteredItems = useMemo<DisclosureItem[]>(() => {
    let result = state.items.filter(item => {
      if (filterSource !== 'all' && item.source !== filterSource) return false
      if (filterDocType !== 'all' && item.docTypeLabel !== filterDocType) return false
      if (textFilter.trim()) {
        const q = textFilter.trim().toLowerCase()
        if (!item.title.toLowerCase().includes(q) && !item.companyName.toLowerCase().includes(q)) return false
      }
      return true
    })

    // ソート
    if (sortOrder === 'newest') {
      result = [...result].sort((a, b) => b.filedDate.localeCompare(a.filedDate))
    } else if (sortOrder === 'oldest') {
      result = [...result].sort((a, b) => a.filedDate.localeCompare(b.filedDate))
    } else if (sortOrder === 'type') {
      const typeOrder: Record<string, number> = { '決算短信': 0, '有価証券報告書': 1, '四半期報告書': 2, '半期報告書': 3, 'その他': 4 }
      result = [...result].sort((a, b) => {
        const ta = typeOrder[a.docTypeLabel] ?? 9
        const tb = typeOrder[b.docTypeLabel] ?? 9
        return ta !== tb ? ta - tb : b.filedDate.localeCompare(a.filedDate)
      })
    }

    return result
  }, [state.items, filterSource, filterDocType, textFilter, sortOrder])

  // 検索結果から会社名・銘柄コードを取得
  const resultMeta = useMemo(() => {
    const first = state.items.find(i => i.companyName)
    return {
      companyName: first?.companyName ?? '',
      secCode: first?.secCode ?? '',
    }
  }, [state.items])

  const handleSearch = (code: string) => {
    setSelectedIds(new Set())
    setFilterSource('all')
    setFilterDocType('all')
    setTextFilter('')
    setSortOrder('newest')
    setCurrentCode(code)
    search(code)
  }

  const handleFavoritesSelect = (code: string) => {
    handleSearch(code)
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleToggleFavoriteByItem = (item: DisclosureItem) => {
    const stockName = getStockName(item.secCode) || item.companyName
    const stock: StockInfo = { code: item.secCode, name: stockName }
    toggleFavorite(stock)
  }

  const handleSelectAll = () => setSelectedIds(new Set(filteredItems.map(i => i.id)))
  const handleDeselectAll = () => setSelectedIds(new Set())
  const selectedItems = state.items.filter(item => selectedIds.has(item.id))

  const hasResults = state.items.length > 0

  // お気に入りトグル（ヘッダーボタン用）
  const currentIsFavorite = currentCode ? isFavorite(currentCode) : false
  const handleToggleCurrentFavorite = () => {
    if (!currentCode) return
    const stockName = resultMeta.companyName || getStockName(currentCode)
    const stock: StockInfo = { code: currentCode, name: stockName }
    toggleFavorite(stock)
  }

  // お気に入りIDセット（カード用）
  const favoriteIdSet = useMemo(() => new Set(favorites.map(f => f.code)), [favorites])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-950 transition-colors">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 dark:from-blue-600 dark:via-cyan-600 dark:to-teal-600 text-white px-5 pt-12 pb-5 rounded-b-[2rem] shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <FileSearch size={20} className="text-blue-200 flex-shrink-0" />
                <h1 className="text-xl font-bold tracking-tight">開示検索</h1>
              </div>

              {/* 検索後は会社名を表示 */}
              {hasResults && resultMeta.secCode ? (
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-mono font-bold">
                    {resultMeta.secCode}
                  </span>
                  {resultMeta.companyName && (
                    <span className="text-sm font-semibold text-white/90 truncate">
                      {resultMeta.companyName}
                    </span>
                  )}
                  <span className="text-xs text-blue-200">
                    {state.items.length}件
                  </span>
                </div>
              ) : (
                <p className="text-blue-200 text-sm mt-1">EDINET・TDnet 過去5年分の開示書類</p>
              )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              {/* ポートフォリオボタン */}
              <button
                onClick={() => setShowPortfolio(true)}
                className="p-2 rounded-xl hover:bg-white/15 transition-colors"
                aria-label="ポートフォリオ検索"
                title="複数銘柄を一括検索"
              >
                <Briefcase size={18} />
              </button>

              {/* お気に入りトグル（検索済みの場合のみ） */}
              {hasResults && currentCode && (
                <button
                  onClick={handleToggleCurrentFavorite}
                  className={`p-2 rounded-xl hover:bg-white/15 transition-colors ${
                    currentIsFavorite ? 'text-amber-300' : 'text-white/70 hover:text-white'
                  }`}
                  aria-label={currentIsFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                >
                  <svg
                    width="18" height="18" viewBox="0 0 24 24"
                    fill={currentIsFavorite ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              )}

              {/* ダークモードトグル */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-white/15 transition-colors"
                aria-label={theme === 'dark' ? 'ライトモードに切替' : 'ダークモードに切替'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-lg mx-auto px-5 py-4 pb-44">
        <SearchBar onSearch={handleSearch} isSearching={state.status === 'searching'} />

        {/* お気に入りバー */}
        <FavoritesBar
          favorites={favorites}
          onSelect={handleFavoritesSelect}
          onRemove={removeFavorite}
        />

        {/* 検索プログレス */}
        {state.status === 'searching' && (
          <SearchProgress
            current={state.yearProgress}
            total={state.totalYears}
            label={state.searchingLabel}
          />
        )}

        {/* エラー表示 */}
        {state.status === 'error' && state.error && (
          <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl">
            <p className="text-sm text-rose-600 dark:text-rose-400">{state.error}</p>
            {state.items.length > 0 && (
              <p className="text-xs text-rose-400 dark:text-rose-500 mt-1">
                途中まで取得した{state.items.length}件を表示しています
              </p>
            )}
          </div>
        )}

        {/* フィルターと結果一覧 */}
        {hasResults && (
          <>
            {/* 統計サマリー */}
            <ResultsSummary items={state.items} />

            <FilterBar
              items={state.items}
              filterSource={filterSource}
              filterDocType={filterDocType}
              onFilterSource={setFilterSource}
              onFilterDocType={setFilterDocType}
              totalFiltered={filteredItems.length}
            />

            {/* ソート・テキストフィルター */}
            <SortAndTextFilter
              sortOrder={sortOrder}
              textFilter={textFilter}
              onSortOrder={setSortOrder}
              onTextFilter={setTextFilter}
              resultCount={filteredItems.length}
            />

            <ResultsList
              items={filteredItems}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              favoriteIds={favoriteIdSet}
              onToggleFavorite={handleToggleFavoriteByItem}
              onPreview={setPreviewItem}
              groupByYear={sortOrder !== 'type'}
            />
          </>
        )}

        {/* 検索完了で結果なし */}
        {state.status === 'done' && state.items.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-600 dark:text-gray-300 font-semibold">開示書類が見つかりませんでした</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              銘柄コードを確認して再検索してください
            </p>
          </div>
        )}

        {/* 初期状態（ガイド） */}
        {state.status === 'idle' && (
          <div className="mt-10">
            <div className="text-center mb-6">
              <p className="text-5xl mb-4">📄</p>
              <p className="text-gray-600 dark:text-gray-300 font-semibold">証券コードを入力して検索</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 leading-relaxed">
                有価証券報告書・四半期報告書（EDINET）<br />
                決算短信（TDnet）を過去5年分まとめて取得
              </p>
            </div>

            {/* 使い方ガイド */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { icon: '🔎', title: 'コード入力', desc: '4桁のコードまたは会社名で検索' },
                { icon: '🗂️', title: 'フィルター', desc: '決算短信のみ等で絞り込み' },
                { icon: '📦', title: 'ZIP保存', desc: '複数を選択して一括DL' },
              ].map(step => (
                <div
                  key={step.title}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-3 text-center border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <p className="text-2xl mb-1">{step.icon}</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{step.title}</p>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* 追加機能ガイド */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { icon: '⭐', title: 'お気に入り', desc: '銘柄を登録してワンタップ検索' },
                { icon: '💼', title: 'ポートフォリオ', desc: '複数銘柄を一括検索（右上ボタン）' },
                { icon: '👁️', title: 'プレビュー', desc: 'アプリ内でPDFを確認' },
                { icon: '🔢', title: 'ソート', desc: '日付順・種別順で並び替え' },
              ].map(step => (
                <div
                  key={step.title}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-3 flex items-start gap-2.5 border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <span className="text-xl flex-shrink-0">{step.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-200">{step.title}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 leading-tight">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 一括ダウンロードバー */}
      {selectedItems.length > 0 && (
        <DownloadBar selectedItems={selectedItems} onClear={handleDeselectAll} />
      )}

      {/* PDFプレビューモーダル */}
      {previewItem && (
        <PdfPreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      )}

      {/* ポートフォリオモーダル */}
      {showPortfolio && (
        <PortfolioModal
          favorites={favorites}
          onClose={() => setShowPortfolio(false)}
          onSelectItem={item => {
            setPreviewItem(item)
          }}
        />
      )}
    </div>
  )
}
