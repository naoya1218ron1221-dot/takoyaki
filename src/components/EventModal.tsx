import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from 'clsx'
import type { StockItem, EventType } from '../types'
import { EVENT_TYPE_LABELS } from '../types'

interface Props {
  open: boolean
  initial?: StockItem | null
  onClose: () => void
  onSave: (item: Omit<StockItem, 'id'> & { id?: string }) => void
}

const EVENT_TYPES: EventType[] = ['earnings', 'rights', 'product', 'ipo', 'other']

const TYPE_BUTTON_STYLES: Record<EventType, string> = {
  earnings: 'data-[selected=true]:bg-red-500/30 data-[selected=true]:text-red-300 data-[selected=true]:ring-red-500/50',
  rights: 'data-[selected=true]:bg-emerald-500/30 data-[selected=true]:text-emerald-300 data-[selected=true]:ring-emerald-500/50',
  product: 'data-[selected=true]:bg-blue-500/30 data-[selected=true]:text-blue-300 data-[selected=true]:ring-blue-500/50',
  ipo: 'data-[selected=true]:bg-yellow-500/30 data-[selected=true]:text-yellow-300 data-[selected=true]:ring-yellow-500/50',
  other: 'data-[selected=true]:bg-slate-500/30 data-[selected=true]:text-slate-300 data-[selected=true]:ring-slate-500/50',
}

function todayStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function EventModal({ open, initial, onClose, onSave }: Props) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [date, setDate] = useState(todayStr())
  const [type, setType] = useState<EventType>('earnings')
  const [memo, setMemo] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      if (initial) {
        setCode(initial.code)
        setName(initial.name)
        setDate(initial.date)
        setType(initial.type)
        setMemo(initial.memo)
      } else {
        setCode('')
        setName('')
        setDate(todayStr())
        setType('earnings')
        setMemo('')
      }
      setErrors({})
    }
  }, [open, initial])

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!code.trim()) e.code = '銘柄コードを入力してください'
    else if (!/^\d{4}$/.test(code.trim())) e.code = '4桁の数字で入力してください'
    if (!name.trim()) e.name = '銘柄名を入力してください'
    if (!date) e.date = '日付を入力してください'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSave({
      id: initial?.id,
      code: code.trim(),
      name: name.trim(),
      date,
      type,
      memo: memo.trim(),
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-slate-900 border-t border-slate-700 pb-safe"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-600" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white">
                {initial ? '銘柄を編集' : '銘柄を追加'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-4 pt-4 pb-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Code + Name */}
              <div className="flex gap-3">
                <div className="w-28">
                  <label className="block text-xs text-slate-400 mb-1">銘柄コード *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                    className={clsx(
                      'w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/60',
                      errors.code ? 'border-red-500' : 'border-slate-700'
                    )}
                  />
                  {errors.code && <p className="text-xs text-red-400 mt-1">{errors.code}</p>}
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">銘柄名 *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例: トヨタ自動車"
                    className={clsx(
                      'w-full px-3 py-2 bg-slate-800 border rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60',
                      errors.name ? 'border-red-500' : 'border-slate-700'
                    )}
                  />
                  {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">イベント日付 *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 bg-slate-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60',
                    errors.date ? 'border-red-500' : 'border-slate-700'
                  )}
                />
                {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
              </div>

              {/* Event type */}
              <div>
                <label className="block text-xs text-slate-400 mb-2">イベント種別</label>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      data-selected={type === t}
                      onClick={() => setType(t)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold ring-1 transition-colors',
                        type === t
                          ? TYPE_BUTTON_STYLES[t]
                          : 'text-slate-500 bg-slate-800 ring-slate-700 hover:ring-slate-600'
                      )}
                    >
                      {EVENT_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Memo */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">メモ</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="自由記述..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm transition-all"
              >
                {initial ? '更新する' : '追加する'}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
