import { useState, useEffect, useCallback } from 'react'
import type { Goal } from '../types/goal'

const STORAGE_KEY = 'yabou-tracker-goals'

function loadGoals(): Goal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return parsed.map((g: Goal) => ({
      ...g,
      history: (g.history ?? []).map((h) => ({
        ...h,
        deposit: h.deposit ?? 0,
      })),
      memos: g.memos ?? [],
    }))
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

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'history' | 'memos'>) => {
    const now = new Date().toISOString()
    setGoals((prev) => [
      ...prev,
      {
        ...goal,
        id: crypto.randomUUID(),
        createdAt: now,
        history: goal.currentAmount > 0
          ? [{ date: now.slice(0, 10), amount: goal.currentAmount, deposit: goal.currentAmount }]
          : [],
        memos: [],
      },
    ])
  }, [])

  const updateGoal = useCallback((id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g
        const updated = { ...g, ...updates }

        if (updates.currentAmount !== undefined && updates.currentAmount !== g.currentAmount) {
          const today = new Date().toISOString().slice(0, 10)
          const history = [...(updated.history ?? [])]
          const deposit = updates.currentAmount - g.currentAmount

          const todayIdx = history.findIndex((h) => h.date === today)
          if (todayIdx >= 0) {
            // Accumulate deposits for the same day
            history[todayIdx] = {
              date: today,
              amount: updates.currentAmount,
              deposit: history[todayIdx].deposit + deposit,
            }
          } else {
            history.push({ date: today, amount: updates.currentAmount, deposit })
          }
          updated.history = history
        }
        return updated
      })
    )
  }, [])

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const addMemo = useCallback((goalId: string, text: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        return {
          ...g,
          memos: [
            ...g.memos,
            { id: crypto.randomUUID(), date: new Date().toISOString(), text },
          ],
        }
      })
    )
  }, [])

  const deleteMemo = useCallback((goalId: string, memoId: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        return { ...g, memos: g.memos.filter((m) => m.id !== memoId) }
      })
    )
  }, [])

  return { goals, addGoal, updateGoal, deleteGoal, addMemo, deleteMemo }
}
