import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  onSearch: (code: string) => void
  isSearching: boolean
}

export default function SearchBar({ onSearch, isSearching }: Props) {
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (trimmed.length === 4 && /^\d{4}$/.test(trimmed)) {
      onSearch(trimmed)
    }
  }

  const isValid = /^\d{4}$/.test(code.trim())

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <div className="relative flex-1">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="証券コード（例: 7203）"
          className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500 text-base"
          disabled={isSearching}
        />
        {code && (
          <button
            type="button"
            onClick={() => setCode('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400"
            aria-label="クリア"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isSearching || !isValid}
        className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl disabled:opacity-50 hover:from-blue-600 hover:to-cyan-600 active:scale-[0.98] transition-all flex items-center gap-1.5 whitespace-nowrap"
      >
        <Search size={18} />
        {isSearching ? '検索中' : '検索'}
      </button>
    </form>
  )
}
