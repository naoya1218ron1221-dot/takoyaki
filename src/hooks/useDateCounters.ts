import { useState, useEffect, useCallback } from 'react'
import type { DateCounter } from '../types/goal'

const STORAGE_KEY = 'yabou-tracker-date-counters'

function load(): DateCounter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(counters: DateCounter[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counters))
}

export function useDateCounters() {
  const [counters, setCounters] = useState<DateCounter[]>(load)

  useEffect(() => {
    save(counters)
  }, [counters])

  const addCounter = useCallback((counter: Omit<DateCounter, 'id' | 'createdAt'>) => {
    setCounters((prev) => [
      ...prev,
      {
        ...counter,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
    ])
  }, [])

  const updateCounter = useCallback((id: string, updates: Partial<Omit<DateCounter, 'id' | 'createdAt'>>) => {
    setCounters((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }, [])

  const deleteCounter = useCallback((id: string) => {
    setCounters((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { counters, addCounter, updateCounter, deleteCounter }
}
