import { TrendingUp, Calendar, Flame, Target } from 'lucide-react'
import type { Goal } from '../types/goal'

function formatYen(amount: number) {
  return amount.toLocaleString('ja-JP')
}

function getMonthlyDeposits(goals: Goal[]): Record<string, number> {
  const monthly: Record<string, number> = {}
  for (const goal of goals) {
    for (const entry of goal.history ?? []) {
      const month = entry.date.slice(0, 7) // "YYYY-MM"
      monthly[month] = (monthly[month] ?? 0) + (entry.deposit ?? 0)
    }
  }
  return monthly
}

function getStreak(goals: Goal[]): number {
  const monthly = getMonthlyDeposits(goals)
  const months = Object.keys(monthly).sort().reverse()
  if (months.length === 0) return 0

  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  let streak = 0
  let checkMonth = currentMonth

  for (let i = 0; i < 120; i++) {
    if (monthly[checkMonth] && monthly[checkMonth] > 0) {
      streak++
    } else if (checkMonth !== currentMonth) {
      // Current month might not have deposit yet, so allow skip
      break
    } else {
      // No deposit this month yet, check from last month
    }

    // Go to previous month
    const [y, m] = checkMonth.split('-').map(Number)
    const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
    if (checkMonth === currentMonth && !monthly[checkMonth]) {
      checkMonth = prev
      continue
    }
    checkMonth = prev
  }

  return streak
}

function getProjectedDate(goal: Goal): string | null {
  if (goal.currentAmount >= goal.targetAmount) return null

  const history = (goal.history ?? []).sort((a, b) => a.date.localeCompare(b.date))
  if (history.length < 2) return null

  const firstDate = new Date(history[0].date)
  const lastDate = new Date(history[history.length - 1].date)
  const daysDiff = Math.max(1, (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))

  const totalDeposits = history.reduce((sum, h) => sum + (h.deposit ?? 0), 0)
  if (totalDeposits <= 0) return null

  const dailyRate = totalDeposits / daysDiff
  const remaining = goal.targetAmount - goal.currentAmount
  const daysNeeded = Math.ceil(remaining / dailyRate)

  const projected = new Date()
  projected.setDate(projected.getDate() + daysNeeded)

  return `${projected.getFullYear()}/${String(projected.getMonth() + 1).padStart(2, '0')}/${String(projected.getDate()).padStart(2, '0')}`
}

interface StatsPanelProps {
  goals: Goal[]
}

export default function StatsPanel({ goals }: StatsPanelProps) {
  const allHistory = goals.flatMap((g) => g.history ?? [])
  if (allHistory.length === 0) return null

  const monthly = getMonthlyDeposits(goals)
  const monthKeys = Object.keys(monthly).sort()
  const streak = getStreak(goals)

  // This month's total deposit
  const today = new Date()
  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const thisMonthTotal = monthly[currentMonthKey] ?? 0

  // Average monthly deposit
  const positiveMonths = monthKeys.filter((k) => monthly[k] > 0)
  const avgMonthly = positiveMonths.length > 0
    ? Math.round(positiveMonths.reduce((s, k) => s + monthly[k], 0) / positiveMonths.length)
    : 0

  // Projected dates for incomplete goals
  const projections = goals
    .filter((g) => g.currentAmount < g.targetAmount)
    .map((g) => ({ goal: g, date: getProjectedDate(g) }))
    .filter((p) => p.date !== null)

  // Monthly bar chart data (last 6 months)
  const last6 = monthKeys.slice(-6)
  const maxMonthly = Math.max(...last6.map((k) => monthly[k]), 1)

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={18} className="text-indigo-400" />
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">統計</h2>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
          <Calendar size={16} className="mx-auto text-indigo-400 mb-1" />
          <p className="text-xs text-gray-400 dark:text-gray-500">今月</p>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">¥{formatYen(thisMonthTotal)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
          <TrendingUp size={16} className="mx-auto text-emerald-400 mb-1" />
          <p className="text-xs text-gray-400 dark:text-gray-500">月平均</p>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">¥{formatYen(avgMonthly)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 text-center">
          <Flame size={16} className="mx-auto text-orange-400 mb-1" />
          <p className="text-xs text-gray-400 dark:text-gray-500">連続</p>
          <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{streak}ヶ月</p>
        </div>
      </div>

      {/* Monthly bar chart */}
      {last6.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 mb-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">月別入金額</p>
          <div className="flex items-end gap-2 h-20">
            {last6.map((month) => {
              const val = monthly[month]
              const heightPct = (val / maxMonthly) * 100
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-gray-400 dark:text-gray-500">
                    {val > 0 ? `¥${formatYen(val)}` : ''}
                  </span>
                  <div className="w-full flex items-end" style={{ height: '48px' }}>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-500 to-violet-400 rounded-t-sm transition-all duration-500"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-gray-400 dark:text-gray-500">
                    {month.slice(5)}月
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Projected dates */}
      {projections.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={14} className="text-indigo-400" />
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">達成予測</p>
          </div>
          <div className="space-y-2">
            {projections.map(({ goal, date }) => (
              <div key={goal.id} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {goal.emoji} {goal.name}
                </span>
                <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">
                  {date} 頃
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export { getProjectedDate }
