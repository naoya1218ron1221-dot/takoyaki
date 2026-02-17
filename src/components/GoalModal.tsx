import { useState, useEffect } from 'react'
import { X, Bell } from 'lucide-react'
import type { Goal, ReminderInterval } from '../types/goal'

const EMOJI_OPTIONS = ['✈️', '💎', '🏠', '🚗', '🎓', '💻', '🎸', '🏖️', '👶', '🎯', '💍', '🍽️', '🏔️', '🎮', '📱']

const INTERVAL_OPTIONS: { value: ReminderInterval; label: string }[] = [
  { value: 'daily', label: '毎日' },
  { value: 'weekly', label: '毎週' },
  { value: 'monthly', label: '毎月' },
]

interface GoalModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; emoji: string; targetAmount: number; currentAmount: number; reminderEnabled: boolean; reminderInterval: ReminderInterval }) => void
  initial?: Goal | null
}

export default function GoalModal({ open, onClose, onSave, initial }: GoalModalProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderInterval, setReminderInterval] = useState<ReminderInterval>('weekly')

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setEmoji(initial.emoji)
      setTargetAmount(String(initial.targetAmount))
      setCurrentAmount(String(initial.currentAmount))
      setReminderEnabled(initial.reminderEnabled ?? false)
      setReminderInterval(initial.reminderInterval ?? 'weekly')
    } else {
      setName('')
      setEmoji('🎯')
      setTargetAmount('')
      setCurrentAmount('')
      setReminderEnabled(false)
      setReminderInterval('weekly')
    }
  }, [initial, open])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !targetAmount) return
    onSave({
      name: name.trim(),
      emoji,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      reminderEnabled,
      reminderInterval,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {initial ? '野望を編集' : '新しい野望を追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">アイコン</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    emoji === e
                      ? 'bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-indigo-400 scale-110'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">野望の名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: モルディブ旅行"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">目標金額 (円)</label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="500000"
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">現在の貯蓄額 (円)</label>
            <input
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Bell size={16} />
                リマインダー
              </label>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  reminderEnabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    reminderEnabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            {reminderEnabled && (
              <div className="flex gap-2 mt-3">
                {INTERVAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setReminderInterval(opt.value)}
                    className={`flex-1 py-2 text-sm rounded-xl font-medium transition-all ${
                      reminderInterval === opt.value
                        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-400'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 active:scale-[0.98]"
          >
            {initial ? '更新する' : '野望を追加!'}
          </button>
        </form>
      </div>
    </div>
  )
}
