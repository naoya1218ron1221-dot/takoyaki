import { useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import type { Page, StockItem } from '../types'
import { EventCard } from './EventCard'

interface Props {
  pages: Page[]
  currentPage: number
  onPageChange: (page: number) => void
  onEdit: (pageId: number, item: StockItem) => void
  onDelete: (pageId: number, itemId: string) => void
}

const PAGE_COUNT = 10

export function SwipePages({ pages, currentPage, onPageChange, onEdit, onDelete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)

  function handleDragEnd(_: unknown, info: { offset: { x: number }; velocity: { x: number } }) {
    const width = containerRef.current?.offsetWidth ?? window.innerWidth
    const threshold = width * 0.25
    const vel = info.velocity.x

    let target = currentPage
    if (info.offset.x < -threshold || vel < -300) {
      target = Math.min(currentPage + 1, PAGE_COUNT - 1)
    } else if (info.offset.x > threshold || vel > 300) {
      target = Math.max(currentPage - 1, 0)
    }

    onPageChange(target)
    animate(x, 0, { type: 'spring', damping: 30, stiffness: 300 })
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden w-full flex-1">
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className="flex w-full h-full"
        // Prevent vertical scroll conflict
        dragDirectionLock
      >
        {/* Single visible page at a time — we just render the current, prev, next for perf */}
        {pages.map((page, idx) => {
          const offset = idx - currentPage
          if (Math.abs(offset) > 1) return null
          return (
            <motion.div
              key={page.id}
              animate={{ x: `${offset * 100}%` }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-0 overflow-y-auto overscroll-contain"
            >
              <PageContent
                page={page}
                onEdit={(item) => onEdit(page.id, item)}
                onDelete={(itemId) => onDelete(page.id, itemId)}
              />
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

function PageContent({
  page,
  onEdit,
  onDelete,
}: {
  page: Page
  onEdit: (item: StockItem) => void
  onDelete: (id: string) => void
}) {
  if (page.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-3 text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl">
          📈
        </div>
        <p className="text-slate-500 text-sm">このページには銘柄がありません</p>
        <p className="text-slate-600 text-xs">右下の＋ボタンから追加できます</p>
      </div>
    )
  }

  // Sort: upcoming first, then by days ascending
  const sorted = [...page.items].sort((a, b) => {
    const da = new Date(a.date).getTime()
    const db = new Date(b.date).getTime()
    return da - db
  })

  return (
    <div className="px-3 pt-3 pb-28 space-y-3">
      {sorted.map((item) => (
        <EventCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
