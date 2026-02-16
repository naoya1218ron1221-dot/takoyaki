import { useState, useEffect, useCallback } from 'react'
import type { Goal, ReminderInterval } from '../types/goal'

const LAST_NOTIFIED_KEY = 'yabou-tracker-last-notified'

type NotificationPermission = 'default' | 'granted' | 'denied'

function getIntervalMs(interval: ReminderInterval): number {
  switch (interval) {
    case 'daily':
      return 24 * 60 * 60 * 1000
    case 'weekly':
      return 7 * 24 * 60 * 60 * 1000
    case 'monthly':
      return 30 * 24 * 60 * 60 * 1000
  }
}

function loadLastNotified(): Record<string, number> {
  try {
    const raw = localStorage.getItem(LAST_NOTIFIED_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLastNotified(data: Record<string, number>) {
  localStorage.setItem(LAST_NOTIFIED_KEY, JSON.stringify(data))
}

function isDue(goalId: string, interval: ReminderInterval): boolean {
  const lastNotified = loadLastNotified()
  const last = lastNotified[goalId]
  if (!last) return true
  return Date.now() - last >= getIntervalMs(interval)
}

function markNotified(goalId: string) {
  const data = loadLastNotified()
  data[goalId] = Date.now()
  saveLastNotified(data)
}

function sendNotification(goal: Goal) {
  const percent = goal.targetAmount > 0
    ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
    : 0

  new Notification(`${goal.emoji} ${goal.name}`, {
    body: `現在 ${percent}% 達成中！進捗を更新しましょう 💪`,
    tag: `reminder-${goal.id}`,
  })
}

export function useReminder(goals: Goal[]) {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  )

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setPermission(result)
    return result
  }, [])

  const checkReminders = useCallback(() => {
    if (permission !== 'granted') return

    for (const goal of goals) {
      if (!goal.reminderEnabled) continue
      const percent = goal.targetAmount > 0
        ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
        : 0
      if (percent >= 100) continue

      if (isDue(goal.id, goal.reminderInterval)) {
        sendNotification(goal)
        markNotified(goal.id)
      }
    }
  }, [goals, permission])

  // Check reminders on mount and periodically (every 60 minutes)
  useEffect(() => {
    if (permission !== 'granted') return

    checkReminders()
    const timer = setInterval(checkReminders, 60 * 60 * 1000)
    return () => clearInterval(timer)
  }, [checkReminders, permission])

  return { permission, requestPermission }
}
