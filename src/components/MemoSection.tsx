import { useState } from 'react'
import { Send, X } from 'lucide-react'
import type { Memo } from '../types/goal'

interface MemoSectionProps {
  memos: Memo[]
  onAdd: (text: string) => void
  onDelete: (memoId: string) => void
}

function formatDate(isoStr: string) {
  const d = new Date(isoStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function MemoSection({ memos, onAdd, onDelete }: MemoSectionProps) {
  const [text, setText] = useState('')
  const [expanded, setExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    onAdd(text.trim())
    setText('')
  }

  const recentMemos = expanded ? memos : memos.slice(-3)

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
      {memos.length > 0 && (
        <div className="space-y-1.5 mb-2">
          {recentMemos.map((memo) => (
            <div key={memo.id} className="flex items-start gap-2 group">
              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 shrink-0">
                {formatDate(memo.date)}
              </span>
              <p className="text-xs text-gray-600 dark:text-gray-300 flex-1 leading-relaxed">
                {memo.text}
              </p>
              <button
                onClick={() => onDelete(memo.id)}
                className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-300 hover:text-rose-400 transition-all shrink-0"
                aria-label="メモを削除"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {memos.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] text-indigo-400 hover:text-indigo-500"
            >
              {expanded ? '閉じる' : `他 ${memos.length - 3} 件を表示`}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メモを追加..."
          className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder:text-gray-500 focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100 outline-none transition-all placeholder:text-gray-300"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-1.5 text-indigo-400 hover:text-indigo-600 disabled:text-gray-300 dark:disabled:text-gray-600 transition-colors"
          aria-label="メモを送信"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}
