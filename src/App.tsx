import { useState, useCallback } from 'react'
import { Plus, Sparkles, CalendarHeart, Moon, Sun } from 'lucide-react'
import { useGoals } from './hooks/useGoals'
import { useDateCounters } from './hooks/useDateCounters'
import { useReminder } from './hooks/useReminder'
import { useTheme } from './hooks/useTheme'
import GoalCard from './components/GoalCard'
import GoalModal from './components/GoalModal'
import DateCounterCard from './components/DateCounterCard'
import DateCounterModal from './components/DateCounterModal'
import Confetti from './components/Confetti'
import type { Goal, DateCounter, ReminderInterval } from './types/goal'

function formatYen(amount: number) {
  return amount.toLocaleString('ja-JP')
}

export default function App() {
  const { goals, addGoal, updateGoal, deleteGoal, addMemo, deleteMemo } = useGoals()
  const { counters, addCounter, updateCounter, deleteCounter } = useDateCounters()
  const { permission, requestPermission } = useReminder(goals, counters)
  const { theme, toggleTheme } = useTheme()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [counterModalOpen, setCounterModalOpen] = useState(false)
  const [editingCounter, setEditingCounter] = useState<DateCounter | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalCurrent = goals.reduce((s, g) => s + g.currentAmount, 0)
  const overallPercent = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0

  // Goal handlers
  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('この野望を削除しますか?')) {
      deleteGoal(id)
    }
  }

  const handleSave = (data: { name: string; emoji: string; targetAmount: number; currentAmount: number; reminderEnabled: boolean; reminderInterval: ReminderInterval }) => {
    if (editingGoal) {
      const prevAmount = editingGoal.currentAmount
      const prevPercent = editingGoal.targetAmount > 0 ? (prevAmount / editingGoal.targetAmount) * 100 : 0
      const newPercent = data.targetAmount > 0 ? (data.currentAmount / data.targetAmount) * 100 : 0

      updateGoal(editingGoal.id, data)

      // Trigger confetti when goal just reached 100%
      if (prevPercent < 100 && newPercent >= 100) {
        setShowConfetti(true)
      }
    } else {
      addGoal(data)
      // Confetti if adding a goal that's already complete
      if (data.targetAmount > 0 && data.currentAmount >= data.targetAmount) {
        setShowConfetti(true)
      }
    }
    setEditingGoal(null)
  }

  const handleToggleReminder = async (id: string) => {
    const goal = goals.find((g) => g.id === id)
    if (!goal) return

    if (!goal.reminderEnabled && permission !== 'granted') {
      const result = await requestPermission()
      if (result !== 'granted') return
    }

    updateGoal(id, { reminderEnabled: !goal.reminderEnabled })
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingGoal(null)
  }

  // Date counter handlers
  const handleEditCounter = (counter: DateCounter) => {
    setEditingCounter(counter)
    setCounterModalOpen(true)
  }

  const handleDeleteCounter = (id: string) => {
    if (window.confirm('このカウンターを削除しますか?')) {
      deleteCounter(id)
    }
  }

  const handleSaveCounter = (data: Omit<DateCounter, 'id' | 'createdAt'>) => {
    if (editingCounter) {
      updateCounter(editingCounter.id, data)
    } else {
      addCounter(data)
    }
    setEditingCounter(null)
  }

  const handleToggleCounterReminder = async (id: string) => {
    const counter = counters.find((c) => c.id === id)
    if (!counter) return

    if (!counter.reminderEnabled && permission !== 'granted') {
      const result = await requestPermission()
      if (result !== 'granted') return
    }

    updateCounter(id, { reminderEnabled: !counter.reminderEnabled })
  }

  const handleCloseCounterModal = () => {
    setCounterModalOpen(false)
    setEditingCounter(null)
  }

  const handleConfettiDone = useCallback(() => {
    setShowConfetti(false)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-50/30 dark:from-gray-900 dark:to-gray-950 transition-colors">
      {showConfetti && <Confetti onDone={handleConfettiDone} />}

      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 dark:from-indigo-600 dark:via-violet-600 dark:to-purple-600 text-white px-5 pt-12 pb-8 rounded-b-[2rem] shadow-lg shadow-indigo-200/50 dark:shadow-indigo-900/30">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles size={20} className="text-amber-300" />
              <h1 className="text-xl font-bold tracking-tight">野望進捗トラッカー</h1>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-white/15 transition-colors"
              aria-label={theme === 'dark' ? 'ライトモードに切替' : 'ダークモードに切替'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <p className="text-indigo-200 text-sm mb-5">ふたりの夢を、ひとつずつ叶えよう</p>

          {goals.length > 0 && (
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-indigo-100">全体の進捗</span>
                <span className="font-bold">{overallPercent}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-200 transition-all duration-700"
                  style={{ width: `${overallPercent}%` }}
                />
              </div>
              <p className="text-xs text-indigo-200 mt-2">
                ¥{formatYen(totalCurrent)} / ¥{formatYen(totalTarget)}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-5 py-6 pb-28">
        {/* Date Counters Section */}
        {counters.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <CalendarHeart size={18} className="text-rose-400" />
              <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400">日にちカウンター</h2>
            </div>
            <div className="space-y-4">
              {counters.map((counter) => (
                <DateCounterCard
                  key={counter.id}
                  counter={counter}
                  onEdit={handleEditCounter}
                  onDelete={handleDeleteCounter}
                  onToggleReminder={handleToggleCounterReminder}
                />
              ))}
            </div>
          </div>
        )}

        {/* Goals Section */}
        {goals.length === 0 && counters.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-6xl mb-4">🌟</p>
            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">まだ野望がありません</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              下のボタンから、ふたりの夢を追加しましょう!
            </p>
          </div>
        ) : goals.length > 0 && (
          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleReminder={handleToggleReminder}
                onAddMemo={(goalId, text) => addMemo(goalId, text)}
                onDeleteMemo={(goalId, memoId) => deleteMemo(goalId, memoId)}
              />
            ))}
          </div>
        )}
      </main>

      {/* FABs */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 items-end">
        <button
          onClick={() => { setEditingCounter(null); setCounterModalOpen(true) }}
          className="w-12 h-12 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-full shadow-lg shadow-rose-200/50 dark:shadow-rose-900/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="日にちカウンターを追加"
        >
          <CalendarHeart size={22} />
        </button>
        <button
          onClick={() => { setEditingGoal(null); setModalOpen(true) }}
          className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-full shadow-lg shadow-indigo-300/50 dark:shadow-indigo-900/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="新しい野望を追加"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Modals */}
      <GoalModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initial={editingGoal}
      />
      <DateCounterModal
        open={counterModalOpen}
        onClose={handleCloseCounterModal}
        onSave={handleSaveCounter}
        initial={editingCounter}
      />
    </div>
  )
}
