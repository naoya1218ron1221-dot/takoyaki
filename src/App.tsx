import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { clsx } from 'clsx'
import { useStockEvents } from './hooks/useStockEvents'
import { SwipePages } from './components/SwipePages'
import { EventModal } from './components/EventModal'
import type { StockItem } from './types'

export default function App() {
  const { data, updatePageName, addItem, updateItem, deleteItem } = useStockEvents()
  const [currentPage, setCurrentPage] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<(StockItem & { _pageId: number }) | null>(null)
  const [editingPageName, setEditingPageName] = useState(false)
  const [pageNameInput, setPageNameInput] = useState('')
  const pageNameRef = useRef<HTMLInputElement>(null)

  const page = data[currentPage]

  function handleHeaderTap() {
    setPageNameInput(page.name)
    setEditingPageName(true)
    setTimeout(() => pageNameRef.current?.select(), 50)
  }

  function handlePageNameSave() {
    const trimmed = pageNameInput.trim()
    if (trimmed) updatePageName(page.id, trimmed)
    setEditingPageName(false)
  }

  function handleFabPress() {
    setEditingItem(null)
    setModalOpen(true)
  }

  function handleEdit(pageId: number, item: StockItem) {
    setEditingItem({ ...item, _pageId: pageId })
    setModalOpen(true)
  }

  function handleDelete(pageId: number, itemId: string) {
    if (window.confirm('この銘柄を削除しますか？')) {
      deleteItem(pageId, itemId)
    }
  }

  function handleSave(item: Omit<StockItem, 'id'> & { id?: string }) {
    if (item.id && editingItem) {
      updateItem(editingItem._pageId, { ...item, id: item.id } as StockItem)
    } else {
      addItem(currentPage, item as Omit<StockItem, 'id'>)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0f172a] flex flex-col overflow-hidden">
      {/* Header */}
      <header
        className="shrink-0 flex items-center justify-between px-4 border-b border-slate-800"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)', paddingBottom: '12px' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-1.5 w-28">
          <span className="text-lg">📊</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">
            Stock<br />Deck
          </span>
        </div>

        {/* Page name — tappable to edit */}
        <div className="flex-1 flex justify-center">
          <AnimatePresence mode="wait">
            {editingPageName ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-1"
              >
                <input
                  ref={pageNameRef}
                  type="text"
                  value={pageNameInput}
                  onChange={(e) => setPageNameInput(e.target.value)}
                  onBlur={handlePageNameSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePageNameSave()
                    if (e.key === 'Escape') setEditingPageName(false)
                  }}
                  maxLength={20}
                  className="bg-slate-800 border border-blue-500/60 rounded-lg px-2 py-1 text-sm text-white text-center focus:outline-none w-32"
                  autoFocus
                />
                <button
                  onPointerDown={(e) => { e.preventDefault(); handlePageNameSave() }}
                  className="p-1 text-blue-400"
                >
                  <Check size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleHeaderTap}
                className="flex items-center gap-1 text-sm font-bold text-white px-3 py-1 rounded-lg hover:bg-slate-800 transition-colors active:bg-slate-700"
              >
                {page.name}
                <span className="text-slate-600 text-xs">✎</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Item count */}
        <div className="w-28 flex justify-end">
          <span className="text-xs text-slate-500 font-semibold">
            {page.items.length}
            <span className="text-slate-600">銘柄</span>
          </span>
        </div>
      </header>

      {/* Page navigation row */}
      <div className="shrink-0 flex items-center justify-between px-2 py-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Dot indicators */}
        <div className="flex items-center gap-1.5">
          {data.map((pg, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={clsx(
                'rounded-full transition-all duration-200',
                i === currentPage
                  ? 'w-4 h-2 bg-blue-400'
                  : pg.items.length > 0
                    ? 'w-2 h-2 bg-slate-500'
                    : 'w-1.5 h-1.5 bg-slate-700'
              )}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentPage((p) => Math.min(9, p + 1))}
          disabled={currentPage === 9}
          className="p-1.5 rounded-lg text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Main swipe area */}
      <SwipePages
        pages={data}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={handleFabPress}
        className="fixed right-5 w-14 h-14 rounded-full bg-blue-600 shadow-xl shadow-blue-900/50 flex items-center justify-center z-30 hover:bg-blue-500 transition-colors"
        style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
        aria-label="銘柄を追加"
      >
        <Plus size={26} className="text-white" strokeWidth={2.5} />
      </motion.button>

      {/* Modal */}
      <EventModal
        open={modalOpen}
        initial={editingItem}
        onClose={() => { setModalOpen(false); setEditingItem(null) }}
        onSave={handleSave}
      />
    </div>
  )
}
