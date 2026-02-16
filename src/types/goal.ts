export type ReminderInterval = 'daily' | 'weekly' | 'monthly'

export interface Goal {
  id: string
  name: string
  emoji: string
  targetAmount: number
  currentAmount: number
  createdAt: string
  reminderEnabled: boolean
  reminderInterval: ReminderInterval
}
