import { useState, useCallback } from 'react'
import type { SearchState, DisclosureItem } from '../types/disclosure'

const SEARCH_YEARS = 5

function getFiscalYears(): number[] {
  // 日本の会計年度 (4月〜翌3月) で直近5年分を返す
  // 例: 2024年12月時点 → [2024, 2023, 2022, 2021, 2020]
  const today = new Date()
  const currentFiscalYear =
    today.getMonth() < 3 // 1月〜3月は前会計年度
      ? today.getFullYear() - 1
      : today.getFullYear()
  return Array.from({ length: SEARCH_YEARS }, (_, i) => currentFiscalYear - i)
}

export function useDisclosureSearch() {
  const [state, setState] = useState<SearchState>({
    status: 'idle',
    yearProgress: 0,
    totalYears: SEARCH_YEARS + 1,
    searchingLabel: '',
    items: [],
    error: null,
  })

  const search = useCallback(async (secCode: string) => {
    const code = secCode.trim()
    if (!code || !/^\d{4}$/.test(code)) return

    const years = getFiscalYears()
    const total = years.length + 1 // EDINET×5年 + TDnet×1

    setState({
      status: 'searching',
      yearProgress: 0,
      totalYears: total,
      searchingLabel: '検索を開始しています...',
      items: [],
      error: null,
    })

    const allItems: DisclosureItem[] = []

    try {
      // EDINET: 年度ごとに順次検索（プログレッシブ表示）
      for (let i = 0; i < years.length; i++) {
        const year = years[i]
        setState(prev => ({
          ...prev,
          yearProgress: i + 1,
          searchingLabel: `EDINET ${year}年度を検索中...`,
        }))

        const res = await fetch(`/api/search?secCode=${encodeURIComponent(code)}&year=${year}`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error ?? `EDINET検索失敗 (${year}年度)`)
        }

        const data = (await res.json()) as { items: DisclosureItem[] }
        allItems.push(...data.items)

        // 結果を随時表示（最新順）
        const sorted = [...allItems].sort((a, b) => b.filedDate.localeCompare(a.filedDate))
        setState(prev => ({
          ...prev,
          items: sorted,
        }))
      }

      // TDnet: 決算短信を検索
      setState(prev => ({
        ...prev,
        yearProgress: years.length + 1,
        searchingLabel: 'TDnet 決算短信を検索中...',
      }))

      const tdRes = await fetch(`/api/tdnet-search?secCode=${encodeURIComponent(code)}`)
      if (tdRes.ok) {
        const tdData = (await tdRes.json()) as { items: DisclosureItem[]; warning?: string }
        allItems.push(...tdData.items)
      }

      // 最終ソート（最新順）
      allItems.sort((a, b) => b.filedDate.localeCompare(a.filedDate))

      setState({
        status: 'done',
        yearProgress: total,
        totalYears: total,
        searchingLabel: '',
        items: allItems,
        error: null,
      })
    } catch (err) {
      setState(prev => ({
        ...prev,
        status: 'error',
        items: allItems, // 途中まで取得できた結果は保持
        error: err instanceof Error ? err.message : '検索中にエラーが発生しました',
      }))
    }
  }, [])

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      yearProgress: 0,
      totalYears: SEARCH_YEARS + 1,
      searchingLabel: '',
      items: [],
      error: null,
    })
  }, [])

  return { state, search, reset }
}
