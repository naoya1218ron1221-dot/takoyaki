import { useState, useMemo } from 'react'
import { FileSearch } from 'lucide-react'
import { useDisclosureSearch } from '../hooks/useDisclosureSearch'
import type { DisclosureItem, DocTypeLabel, DisclosureSource } from '../types/disclosure'
import SearchBar from '../components/disclosure/SearchBar'
import SearchProgress from '../components/disclosure/SearchProgress'
import FilterBar from '../components/disclosure/FilterBar'
import ResultsList from '../components/disclosure/ResultsList'
import DownloadBar from '../components/disclosure/DownloadBar'

export default function DisclosurePage() {
  const { state, search } = useDisclosureSearch()
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

  const handleSelectAll = () => {
    setSelectedIds(new Set(filteredItems.map(i => i.id)))
  }

  const handleDeselectAll = () => {
    setSelectedIds(new Set())
  }

  const selectedItems = state.items.filter(item => selectedIds.has(item.id))

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-950 transition-colors">
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 dark:from-blue-600 dark:via-cyan-600 dark:to-teal-600 text-white px-5 pt-12 pb-6 rounded-b-[2rem] shadow-lg shadow-blue-200/50 dark:shadow-blue-900/30">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <FileSearch size={20} className="text-blue-200" />
            <h1 className="text-xl font-bold tracking-tight">開示検索</h1>
          </div>
          <p className="text-blue-200 text-sm mt-1">EDINET・TDnet 過去5年分の開示書類</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-lg mx-auto px-5 py-4 pb-40">
        <SearchBar onSearch={handleSearch} isSearching={state.status === 'searching'} />

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
        {state.items.length > 0 && (
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
            <p className="text-gray-500 dark:text-gray-400 font-medium">開示書類が見つかりませんでした</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              銘柄コードを確認して再検索してください
            </p>
          </div>
        )}

        {/* 初期状態 */}
        {state.status === 'idle' && (
          <div className="mt-16 text-center">
            <p className="text-5xl mb-4">📄</p>
            <p className="text-gray-500 dark:text-gray-400 font-medium">証券コードを入力して検索</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 leading-relaxed">
              有価証券報告書・四半期報告書（EDINET）<br />
              決算短信（TDnet）を過去5年分まとめて取得
            </p>
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
