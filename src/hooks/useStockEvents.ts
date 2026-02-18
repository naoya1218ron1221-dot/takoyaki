import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { AppData, StockItem, Page } from '../types'

const STORAGE_KEY = 'stock-event-deck-v1'

function createInitialData(): AppData {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i,
    name: `Page ${i + 1}`,
    items: [],
  }))
}

export function useStockEvents() {
  const [data, setData] = useLocalStorage<AppData>(STORAGE_KEY, createInitialData())

  const updatePageName = useCallback((pageId: number, name: string) => {
    setData((prev) => prev.map((p) => (p.id === pageId ? { ...p, name } : p)))
  }, [setData])

  const addItem = useCallback((pageId: number, item: Omit<StockItem, 'id'>) => {
    const newItem: StockItem = {
      ...item,
      id: crypto.randomUUID(),
    }
    setData((prev) =>
      prev.map((p) =>
        p.id === pageId ? { ...p, items: [...p.items, newItem] } : p
      )
    )
  }, [setData])

  const updateItem = useCallback((pageId: number, updated: StockItem) => {
    setData((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? { ...p, items: p.items.map((it) => (it.id === updated.id ? updated : it)) }
          : p
      )
    )
  }, [setData])

  const deleteItem = useCallback((pageId: number, itemId: string) => {
    setData((prev) =>
      prev.map((p) =>
        p.id === pageId
          ? { ...p, items: p.items.filter((it) => it.id !== itemId) }
          : p
      )
    )
  }, [setData])

  const getPage = useCallback((pageId: number): Page | undefined => {
    return data.find((p) => p.id === pageId)
  }, [data])

  return { data, updatePageName, addItem, updateItem, deleteItem, getPage }
}
