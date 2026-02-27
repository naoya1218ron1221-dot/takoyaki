import { useState } from 'react'
import { Download, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { DisclosureItem } from '../../types/disclosure'

interface Props {
  selectedItems: DisclosureItem[]
  onClear: () => void
}

const MAX_ZIP_ITEMS = 20

export default function DownloadBar({ selectedItems, onClear }: Props) {
  const [downloading, setDownloading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const count = selectedItems.length
  const overLimit = count > MAX_ZIP_ITEMS

  const handleBatchDownload = async () => {
    if (overLimit) return
    setDownloading(true)
    setError(null)
    setSuccess(false)

    try {
      const body = {
        items: selectedItems.map(item => ({
          id: item.id,
          source: item.source,
          secCode: item.secCode,
          filedDate: item.filedDate,
          origUrl: item.pdfUrl.includes('origUrl=')
            ? decodeURIComponent(item.pdfUrl.split('origUrl=')[1])
            : undefined,
          filename: `${item.filedDate}_${item.docTypeLabel}_${item.id}.pdf`.replace(/[\\/:*?"<>|]/g, '_'),
        })),
      }

      const res = await fetch('/api/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error ?? `ZIP作成失敗 (${res.status})`)
      }

      const disposition = res.headers.get('content-disposition') ?? ''
      const nameMatch = disposition.match(/filename="([^"]+)"/)
      const filename = nameMatch ? nameMatch[1] : `disclosures_${new Date().toISOString().slice(0, 10)}.zip`

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // 成功フィードバック
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ダウンロードに失敗しました')
    } finally {
      setDownloading(false)
    }
  }

  return (
    // z-[60] でボトムナビバー(z-50)より上に表示
    <div className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none">
      <div className="pointer-events-auto">
        {error && (
          <div className="bg-rose-50 dark:bg-rose-900/40 border-t border-rose-200 dark:border-rose-800 px-5 py-2 flex items-center gap-2">
            <AlertCircle size={14} className="text-rose-500 flex-shrink-0" />
            <p className="text-xs text-rose-600 dark:text-rose-400 flex-1">{error}</p>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600">
              <X size={14} />
            </button>
          </div>
        )}
        <div
          className={`backdrop-blur-md border-t px-5 py-3 transition-all duration-300 ${
            success
              ? 'bg-emerald-50/95 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700'
              : 'bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700'
          }`}
          // ボトムナビ(約56px) + safe-area-inset-bottom 分の余白
          style={{ paddingBottom: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold transition-colors ${
                success ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-100'
              }`}>
                {success ? 'ダウンロード開始!' : `${count}件選択中`}
              </p>
              {overLimit ? (
                <p className="text-xs text-rose-500">最大{MAX_ZIP_ITEMS}件まで一括DL可能</p>
              ) : (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {downloading ? 'ZIPを作成中...' : 'ZIPでまとめてダウンロード'}
                </p>
              )}
            </div>

            <button
              onClick={onClear}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
              aria-label="選択解除"
            >
              <X size={20} />
            </button>

            <button
              onClick={handleBatchDownload}
              disabled={downloading || overLimit}
              className={`flex items-center gap-2 px-5 py-3 font-bold rounded-xl disabled:opacity-50 active:scale-[0.98] transition-all flex-shrink-0 ${
                success
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
              }`}
            >
              {success ? (
                <CheckCircle2 size={18} />
              ) : (
                <Download size={18} className={downloading ? 'animate-bounce' : ''} />
              )}
              {downloading ? '作成中...' : success ? '完了!' : 'ZIP保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
