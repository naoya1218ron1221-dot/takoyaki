import type { SavingsEntry } from '../types/goal'

function formatYen(amount: number) {
  return amount.toLocaleString('ja-JP')
}

interface SavingsChartProps {
  history: SavingsEntry[]
  targetAmount: number
}

export default function SavingsChart({ history, targetAmount }: SavingsChartProps) {
  if (history.length < 2) {
    return (
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-3">
        2回以上記録するとグラフが表示されます
      </p>
    )
  }

  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date))
  const maxAmount = Math.max(targetAmount, ...sorted.map((h) => h.amount))

  const W = 280
  const H = 120
  const padX = 8
  const padY = 12
  const chartW = W - padX * 2
  const chartH = H - padY * 2

  const points = sorted.map((entry, i) => {
    const x = padX + (i / (sorted.length - 1)) * chartW
    const y = padY + chartH - (entry.amount / maxAmount) * chartH
    return { x, y, entry }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z`

  const targetY = padY + chartH - (targetAmount / maxAmount) * chartH

  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Target line */}
        <line
          x1={padX} y1={targetY} x2={W - padX} y2={targetY}
          stroke="currentColor" className="text-amber-400/50" strokeWidth="1" strokeDasharray="4 3"
        />
        <text x={W - padX} y={targetY - 3} textAnchor="end" className="fill-amber-400 text-[8px]">
          目標
        </text>

        {/* Area fill */}
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#chartGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="#6366f1" />
            {(i === 0 || i === points.length - 1) && (
              <text
                x={p.x}
                y={p.y - 6}
                textAnchor={i === 0 ? 'start' : 'end'}
                className="fill-gray-500 dark:fill-gray-400 text-[7px]"
              >
                ¥{formatYen(p.entry.amount)}
              </text>
            )}
          </g>
        ))}

        {/* Date labels */}
        <text x={padX} y={H - 1} className="fill-gray-400 text-[7px]">
          {sorted[0].date.slice(5)}
        </text>
        <text x={W - padX} y={H - 1} textAnchor="end" className="fill-gray-400 text-[7px]">
          {sorted[sorted.length - 1].date.slice(5)}
        </text>
      </svg>
    </div>
  )
}
