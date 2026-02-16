import { Pencil, Trash2, TrendingUp, Bell, BellOff } from 'lucide-react'
import type { Goal } from '../types/goal'

function formatYen(amount: number) {
  return amount.toLocaleString('ja-JP')
}

function getProgressColor(percent: number) {
  if (percent >= 90) return 'from-amber-400 to-yellow-300'
  if (percent >= 60) return 'from-emerald-400 to-teal-300'
  if (percent >= 30) return 'from-sky-400 to-blue-300'
  return 'from-indigo-400 to-violet-300'
}

function getProgressBg(percent: number) {
  if (percent >= 90) return 'bg-amber-100'
  if (percent >= 60) return 'bg-emerald-100'
  if (percent >= 30) return 'bg-sky-100'
  return 'bg-indigo-100'
}

const INTERVAL_LABEL: Record<string, string> = {
  daily: '毎日',
  weekly: '毎週',
  monthly: '毎月',
}

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
  onToggleReminder: (id: string) => void
}

export default function GoalCard({ goal, onEdit, onDelete, onToggleReminder }: GoalCardProps) {
  const percent = goal.targetAmount > 0
    ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
    : 0

  const isComplete = percent >= 100

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{goal.emoji}</span>
          <div>
            <h3 className="font-bold text-gray-800 text-lg leading-tight">{goal.name}</h3>
            <p className="text-sm text-gray-400 mt-0.5">
              目標: ¥{formatYen(goal.targetAmount)}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onToggleReminder(goal.id)}
            className={`p-2 rounded-lg transition-colors ${
              goal.reminderEnabled
                ? 'text-amber-500 hover:bg-amber-50'
                : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
            }`}
            aria-label={goal.reminderEnabled ? 'リマインダーOFF' : 'リマインダーON'}
            title={goal.reminderEnabled ? `リマインダーON（${INTERVAL_LABEL[goal.reminderInterval]}）` : 'リマインダーOFF'}
          >
            {goal.reminderEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
          <button
            onClick={() => onEdit(goal)}
            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            aria-label="編集"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            aria-label="削除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className={`w-full rounded-full h-4 ${getProgressBg(percent)} overflow-hidden`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(percent)} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          <TrendingUp size={14} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            ¥{formatYen(goal.currentAmount)}
          </span>
        </div>
        <span
          className={`text-sm font-bold ${
            isComplete ? 'text-amber-500' : 'text-indigo-500'
          }`}
        >
          {isComplete ? '達成!' : `${percent}%`}
        </span>
      </div>
    </div>
  )
}
