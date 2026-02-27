interface Props {
  current: number
  total: number
  label: string
}

export default function SearchProgress({ current, total, label }: Props) {
  const pct = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  const steps = Array.from({ length: total }, (_, i) => i + 1)

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
      {/* ラベルとパーセント */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* パルスアニメーション */}
          <span className="relative flex-shrink-0 h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{label}</p>
        </div>
        <span className="text-sm font-bold text-blue-500 dark:text-blue-400 flex-shrink-0 ml-2">{pct}%</span>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* ステップドット（7ステップ以下の場合のみ表示） */}
      {total <= 7 && (
        <div className="flex items-center gap-1.5 justify-center">
          {steps.map(step => (
            <div
              key={step}
              className={`rounded-full transition-all duration-500 ${
                step < current
                  ? 'w-2 h-2 bg-blue-500'
                  : step === current
                  ? 'w-2.5 h-2.5 bg-blue-400 animate-pulse'
                  : 'w-2 h-2 bg-gray-200 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
