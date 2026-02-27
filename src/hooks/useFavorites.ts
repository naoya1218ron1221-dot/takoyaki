import { useState, useCallback } from 'react'
import type { StockInfo } from '../data/stockList'

const STORAGE_KEY = 'disclosure-favorites'
const MAX_FAVORITES = 20

function load(): StockInfo[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function save(list: StockInfo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<StockInfo[]>(load)

  const toggle = useCallback((stock: StockInfo) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.code === stock.code)
      const next = exists
        ? prev.filter(f => f.code !== stock.code)
        : [stock, ...prev].slice(0, MAX_FAVORITES)
      save(next)
      return next
    })
  }, [])

  const has = useCallback((code: string) => {
    return favorites.some(f => f.code === code)
  }, [favorites])

  const remove = useCallback((code: string) => {
    setFavorites(prev => {
      const next = prev.filter(f => f.code !== code)
      save(next)
      return next
    })
  }, [])

  return { favorites, toggle, has, remove }
}
