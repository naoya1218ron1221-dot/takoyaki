import { useState, useMemo } from 'react'
import { FileSearch, Moon, Sun } from 'lucide-react'
import { useDisclosureSearch } from '../hooks/useDisclosureSearch'
import { useTheme } from '../hooks/useTheme'
import type { DisclosureItem, DocTypeLabel, DisclosureSource } from '../types/disclosure'
import SearchBar from '../components/disclosure/SearchBar'
import SearchProgress from '../components/disclosure/SearchProgress'
import FilterBar from '../components/disclosure/FilterBar'
import ResultsList from '../components/disclosure/ResultsList'
import DownloadBar from '../components/disclosure/DownloadBar'

export default function DisclosurePage() {
  const { state, search } = useDisclosureSearch()
  const { theme, toggleTheme } = useTheme()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [filterSource, setFilterSource] = useState<DisclosureSource | 'all'>('all')
  const [filterDocType, setFilterDocType] = useState<DocTypeLabel | 'all'>('all')

  const filteredItems = useMemo<DisclosureItem[]>(() => {
    return state.items.filter(item => {
      if (filterSource !== 'all' && item.source !== filterSource) return false
      if (filterDocType !== 'all' && item.docTypeLabel !== filterDocType) return false
      return true
    })
  }, [state.items, filterSource, filterDocType])

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
    search(code)
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => setSelectedIds(new Set(filteredItems.map(i => i.id)))
  const handleDeselectAll = () => setSelectedIds(new Set())
  const selectedItems = state.items.filter(item => selectedIds.has(item.id))

  const hasResults = state.items.length > 0

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

            {/* ダークモードトグル */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-white/15 transition-colors flex-shrink-0 ml-2"
              aria-label={theme === 'dark' ? 'ライトモードに切替' : 'ダークモードに切替'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-lg mx-auto px-5 py-4 pb-44">
        <SearchBar onSearch={handleSearch} isSearching={state.status === 'searching'} />

        {/* 検索プログレス */}
        {state.status === 'searching' && (
          <SearchProgress
            current={state.yearProgress}
            total={state.totalYears}
            label={state.searchingLabel}
          />
        )}

        {/* エラー表示（途中まで取得できた場合も結果表示） */}
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
            <FilterBar
              items={state.items}
              filterSource={filterSource}
              filterDocType={filterDocType}
              onFilterSource={setFilterSource}
              onFilterDocType={setFilterDocType}
              totalFiltered={filteredItems.length}
            />
            <ResultsList
              items={filteredItems}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
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
                { icon: '🔎', title: 'コード入力', desc: '4桁の証券コードを入力' },
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
          </div>
        )}
      </main>

      {/* 一括ダウンロードバー */}
      {selectedItems.length > 0 && (
        <DownloadBar selectedItems={selectedItems} onClear={handleDeselectAll} />
      )}
    </div>
  )
}
