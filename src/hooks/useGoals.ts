import { useState, useEffect, useCallback } from 'react'
import type { Goal } from '../types/goal'

const STORAGE_KEY = 'yabou-tracker-goals'

function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveGoals(goals: Goal[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(loadGoals)

  useEffect(() => {
    saveGoals(goals)
  }, [goals])

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt'>) => {
    setGoals((prev) => [
      ...prev,
      {
        ...goal,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
    ])
  }, [])

  const updateGoal = useCallback((id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    )
  }, [])

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }, [])

  return { goals, addGoal, updateGoal, deleteGoal }
}
