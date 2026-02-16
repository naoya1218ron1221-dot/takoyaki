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

export type DateCounterType = 'countup' | 'countdown'

export interface DateCounter {
  id: string
  name: string
  emoji: string
  date: string
  type: DateCounterType
  reminderEnabled: boolean
  reminderInterval: ReminderInterval
  createdAt: string
}
