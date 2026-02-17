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
  const maxDeposit = Math.max(...sorted.map((h) => Math.abs(h.deposit ?? 0)), 1)

  const W = 280
  const H = 150
  const padX = 8
  const padY = 12
  const chartH = 80
  const barAreaH = 35
  const barTop = padY + chartH + 8
  const chartW = W - padX * 2

  const points = sorted.map((entry, i) => {
    const x = padX + (i / (sorted.length - 1)) * chartW
    const y = padY + chartH - (entry.amount / maxAmount) * chartH
    return { x, y, entry }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${padY + chartH} L${points[0].x},${padY + chartH} Z`
  const targetY = padY + chartH - (targetAmount / maxAmount) * chartH

  // Bar width
  const barWidth = Math.min(12, (chartW / sorted.length) * 0.6)

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

        {/* Deposit bars */}
        <line
          x1={padX} y1={barTop} x2={W - padX} y2={barTop}
          stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="0.5"
        />
        {points.map((p, i) => {
          const dep = sorted[i].deposit ?? 0
          if (dep === 0) return null
          const isPositive = dep > 0
          const barH = (Math.abs(dep) / maxDeposit) * barAreaH
          return (
            <g key={`bar-${i}`}>
              <rect
                x={p.x - barWidth / 2}
                y={isPositive ? barTop - barH : barTop}
                width={barWidth}
                height={barH}
                rx={2}
                fill={isPositive ? '#10b981' : '#f43f5e'}
                opacity={0.7}
              />
              {(i === points.length - 1 || barH > barAreaH * 0.3) && (
                <text
                  x={p.x}
                  y={isPositive ? barTop - barH - 3 : barTop + barH + 8}
                  textAnchor="middle"
                  className={`text-[6px] ${isPositive ? 'fill-emerald-500' : 'fill-rose-500'}`}
                >
                  {isPositive ? '+' : ''}{formatYen(dep)}
                </text>
              )}
            </g>
          )
        })}

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
