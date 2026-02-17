export type ReminderInterval = 'daily' | 'weekly' | 'monthly'

export interface SavingsEntry {
  date: string
  amount: number
  deposit: number
}

export interface Memo {
  id: string
  date: string
  text: string
}

export interface Goal {
  id: string
  name: string
  emoji: string
  targetAmount: number
  currentAmount: number
  createdAt: string
  reminderEnabled: boolean
  reminderInterval: ReminderInterval
  history: SavingsEntry[]
  memos: Memo[]
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
