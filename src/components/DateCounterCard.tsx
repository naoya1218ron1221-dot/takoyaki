import { Pencil, Trash2, Bell, BellOff, CalendarDays, CalendarClock } from 'lucide-react'
import type { DateCounter } from '../types/goal'

const INTERVAL_LABEL: Record<string, string> = {
  daily: '毎日',
  weekly: '毎週',
  monthly: '毎月',
}

function diffDays(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function formatElapsed(dateStr: string): { days: number; months: number; extraDays: number } {
  const target = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalDays = Math.abs(Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24)))

  let months = (today.getFullYear() - target.getFullYear()) * 12 + (today.getMonth() - target.getMonth())
  const tempDate = new Date(target)
  tempDate.setMonth(tempDate.getMonth() + months)
  if (tempDate > today) {
    months--
    tempDate.setMonth(tempDate.getMonth() - 1)
  }
  const extraDays = Math.floor((today.getTime() - tempDate.getTime()) / (1000 * 60 * 60 * 24))

  return { days: totalDays, months: Math.abs(months), extraDays: Math.abs(extraDays) }
}

interface DateCounterCardProps {
  counter: DateCounter
  onEdit: (counter: DateCounter) => void
  onDelete: (id: string) => void
  onToggleReminder: (id: string) => void
}

export default function DateCounterCard({ counter, onEdit, onDelete, onToggleReminder }: DateCounterCardProps) {
  const isCountup = counter.type === 'countup'
  const diff = diffDays(counter.date)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{counter.emoji}</span>
          <div>
            <h3 className="font-bold text-gray-800 text-lg leading-tight">{counter.name}</h3>
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
              {isCountup ? <CalendarDays size={13} /> : <CalendarClock size={13} />}
              {counter.date.replace(/-/g, '/')}
              {isCountup ? ' から' : ' まで'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onToggleReminder(counter.id)}
            className={`p-2 rounded-lg transition-colors ${
              counter.reminderEnabled
                ? 'text-amber-500 hover:bg-amber-50'
                : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
            }`}
            aria-label={counter.reminderEnabled ? 'リマインダーOFF' : 'リマインダーON'}
            title={counter.reminderEnabled ? `リマインダーON（${INTERVAL_LABEL[counter.reminderInterval]}）` : 'リマインダーOFF'}
          >
            {counter.reminderEnabled ? <Bell size={16} /> : <BellOff size={16} />}
          </button>
          <button
            onClick={() => onEdit(counter)}
            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
            aria-label="編集"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => onDelete(counter.id)}
            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            aria-label="削除"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {isCountup ? (
        <CountupDisplay dateStr={counter.date} />
      ) : (
        <CountdownDisplay diff={diff} />
      )}
    </div>
  )
}

function CountupDisplay({ dateStr }: { dateStr: string }) {
  const { days, months, extraDays } = formatElapsed(dateStr)

  return (
    <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4">
      <div className="text-center">
        <p className="text-3xl font-bold text-rose-500">
          {days}<span className="text-lg ml-1">日目</span>
        </p>
        <p className="text-sm text-rose-400 mt-1">
          {months > 0 && <>{months}ヶ月 {extraDays}日</>}
        </p>
      </div>
    </div>
  )
}

function CountdownDisplay({ diff }: { diff: number }) {
  const isPast = diff < 0
  const absDiff = Math.abs(diff)

  return (
    <div className={`rounded-xl p-4 ${
      isPast
        ? 'bg-gradient-to-r from-gray-50 to-slate-50'
        : 'bg-gradient-to-r from-sky-50 to-indigo-50'
    }`}>
      <div className="text-center">
        {isPast ? (
          <>
            <p className="text-3xl font-bold text-gray-400">
              {absDiff}<span className="text-lg ml-1">日前に終了</span>
            </p>
          </>
        ) : diff === 0 ? (
          <p className="text-3xl font-bold text-amber-500">今日です!</p>
        ) : (
          <p className="text-3xl font-bold text-indigo-500">
            あと <span className="text-4xl">{absDiff}</span><span className="text-lg ml-1">日</span>
          </p>
        )}
      </div>
    </div>
  )
}
