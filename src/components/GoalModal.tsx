import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Goal } from '../types/goal'

const EMOJI_OPTIONS = ['✈️', '💎', '🏠', '🚗', '🎓', '💻', '🎸', '🏖️', '👶', '🎯', '💍', '🍽️', '🏔️', '🎮', '📱']

interface GoalModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: { name: string; emoji: string; targetAmount: number; currentAmount: number }) => void
  initial?: Goal | null
}

export default function GoalModal({ open, onClose, onSave, initial }: GoalModalProps) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [targetAmount, setTargetAmount] = useState('')
  const [currentAmount, setCurrentAmount] = useState('')

  useEffect(() => {
    if (initial) {
      setName(initial.name)
      setEmoji(initial.emoji)
      setTargetAmount(String(initial.targetAmount))
      setCurrentAmount(String(initial.currentAmount))
    } else {
      setName('')
      setEmoji('🎯')
      setTargetAmount('')
      setCurrentAmount('')
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
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 pb-8 sm:pb-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">
            {initial ? '野望を編集' : '新しい野望を追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">アイコン</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    emoji === e
                      ? 'bg-indigo-100 ring-2 ring-indigo-400 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">野望の名前</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: モルディブ旅行"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-800 placeholder:text-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">目標金額 (円)</label>
            <input
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="500000"
              min="1"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-800 placeholder:text-gray-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">現在の貯蓄額 (円)</label>
            <input
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-gray-800 placeholder:text-gray-300"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold rounded-xl hover:from-indigo-600 hover:to-violet-600 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
          >
            {initial ? '更新する' : '野望を追加!'}
          </button>
        </form>
      </div>
    </div>
  )
}
