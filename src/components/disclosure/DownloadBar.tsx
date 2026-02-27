import { useState, useEffect } from 'react'
import { Download, X, AlertCircle, CheckCircle2, FolderOpen, FileStack } from 'lucide-react'
import type { DisclosureItem } from '../../types/disclosure'

interface Props {
  selectedItems: DisclosureItem[]
  onClear: () => void
}

const MAX_ITEMS = 20

function canUseFilesystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window
}

function buildRequestBody(items: DisclosureItem[]) {
  return {
    items: items.map(item => ({
      id: item.id,
      source: item.source,
      secCode: item.secCode,
      companyName: item.companyName,
      filedDate: item.filedDate,
      origUrl: item.pdfUrl.includes('origUrl=')
        ? decodeURIComponent(item.pdfUrl.split('origUrl=')[1])
        : undefined,
      filename: `${item.filedDate}_${item.docTypeLabel}_${item.id}.pdf`.replace(/[\\/:*?"<>|]/g, '_'),
    })),
  }
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

type Mode = 'idle' | 'folder' | 'merge' | 'zip'

export default function DownloadBar({ selectedItems, onClear }: Props) {
  const [activeMode, setActiveMode] = useState<Mode>('idle')
  const [folderProgress, setFolderProgress] = useState({ done: 0, total: 0 })
  const [success, setSuccess] = useState<Mode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasFolderAccess, setHasFolderAccess] = useState(false)

  useEffect(() => {
    setHasFolderAccess(canUseFilesystemAccess())
  }, [])

  const count = selectedItems.length
  const overLimit = count > MAX_ITEMS
  const isLoading = activeMode !== 'idle'

  const showSuccess = (mode: Mode) => {
    setSuccess(mode)
    setTimeout(() => setSuccess(null), 2500)
  }

  // ── フォルダに個別保存（File System Access API）───────────────────────
  const handleFolderSave = async () => {
    if (overLimit || isLoading) return
    setActiveMode('folder')
    setError(null)
    setFolderProgress({ done: 0, total: selectedItems.length })

    try {
      // @ts-expect-error - File System Access API (Chrome/Edge)
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' })

      let done = 0
      for (const item of selectedItems) {
        const proxyUrl = `/api/proxy-pdf?source=${item.source}&id=${encodeURIComponent(item.id)}&origUrl=${encodeURIComponent(item.pdfUrl)}`
        const res = await fetch(proxyUrl)

        if (!res.ok) {
          console.warn(`フェッチ失敗: ${item.id}`)
          done++
          setFolderProgress({ done, total: selectedItems.length })
          continue
        }

        const blob = await res.blob()
        const safeName = `${item.filedDate}_${item.docTypeLabel}_${item.id}.pdf`.replace(/[\\/:*?"<>|]/g, '_')

        const fileHandle = await dirHandle.getFileHandle(safeName, { create: true })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const writable = await (fileHandle as any).createWritable()
        await writable.write(blob)
        await writable.close()

        done++
        setFolderProgress({ done, total: selectedItems.length })
      }

      showSuccess('folder')
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // ユーザーがダイアログをキャンセル
      } else {
        setError(err instanceof Error ? err.message : 'フォルダ保存に失敗しました')
      }
    } finally {
      setActiveMode('idle')
    }
  }

  // ── PDF結合 ──────────────────────────────────────────────────────────
  const handleMergePdf = async () => {
    if (overLimit || isLoading) return
    setActiveMode('merge')
    setError(null)

    try {
      const res = await fetch('/api/merge-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequestBody(selectedItems)),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error((errData as { error?: string }).error ?? `PDF結合失敗 (${res.status})`)
      }

      const disposition = res.headers.get('content-disposition') ?? ''
      const nameMatch = disposition.match(/filename="([^"]+)"/)
      const filename = nameMatch ? nameMatch[1] : `merged_${new Date().toISOString().slice(0, 10)}.pdf`

      const blob = await res.blob()
      triggerBlobDownload(blob, filename)
      showSuccess('merge')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF結合に失敗しました')
    } finally {
      setActiveMode('idle')
    }
  }

  // ── ZIP（フォールバック）────────────────────────────────────────────
  const handleZip = async () => {
    if (overLimit || isLoading) return
    setActiveMode('zip')
    setError(null)

    try {
      const res = await fetch('/api/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildRequestBody(selectedItems)),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error((errData as { error?: string }).error ?? `ZIP作成失敗 (${res.status})`)
      }

      const disposition = res.headers.get('content-disposition') ?? ''
      const nameMatch = disposition.match(/filename="([^"]+)"/)
      const filename = nameMatch ? nameMatch[1] : `disclosures_${new Date().toISOString().slice(0, 10)}.zip`

      const blob = await res.blob()
      triggerBlobDownload(blob, filename)
      showSuccess('zip')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ZIPダウンロードに失敗しました')
    } finally {
      setActiveMode('idle')
    }
  }

  const statusLabel = () => {
    if (success === 'folder') return `${count}件をフォルダに保存!`
    if (success === 'merge') return 'PDF結合完了!'
    if (success === 'zip') return 'ZIPダウンロード完了!'
    if (activeMode === 'folder') return `${folderProgress.done} / ${folderProgress.total}件 保存中...`
    if (activeMode === 'merge') return 'PDF結合中...'
    if (activeMode === 'zip') return 'ZIP作成中...'
    return `${count}件選択中`
  }

  const subLabel = () => {
    if (success || isLoading) return null
    if (overLimit) return `最大${MAX_ITEMS}件まで処理可能`
    if (count === 1) return hasFolderAccess ? 'フォルダ保存 または PDF単体DL' : 'PDF単体DL または ZIP'
    return hasFolderAccess ? 'フォルダ保存 / PDF結合 / ZIP' : 'PDF結合 または ZIP'
  }

  const isSuccess = success !== null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none">
      <div className="pointer-events-auto">
        {/* エラーバナー */}
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
            isSuccess
              ? 'bg-emerald-50/95 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-700'
              : 'bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700'
          }`}
          style={{ paddingBottom: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="max-w-lg mx-auto">
            {/* ステータス行 */}
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold flex items-center gap-1.5 transition-colors ${
                  isSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-100'
                }`}>
                  {isSuccess && <CheckCircle2 size={15} className="flex-shrink-0" />}
                  {statusLabel()}
                </p>
                {subLabel() && (
                  <p className={`text-xs mt-0.5 ${overLimit ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500'}`}>
                    {subLabel()}
                  </p>
                )}
              </div>

              {!isLoading && (
                <button
                  onClick={onClear}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                  aria-label="選択解除"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* アクションボタン行 */}
            <div className="flex gap-2">
              {/* フォルダ保存（Chrome/Edgeのみ） */}
              {hasFolderAccess && (
                <button
                  onClick={handleFolderSave}
                  disabled={isLoading || overLimit}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-semibold text-sm rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
                >
                  {activeMode === 'folder' ? <Spinner /> : <FolderOpen size={16} />}
                  フォルダ保存
                </button>
              )}

              {/* PDF結合（1件でも動作・iOS含む全対応） */}
              <button
                onClick={handleMergePdf}
                disabled={isLoading || overLimit}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 font-semibold text-sm rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-sm shadow-blue-200/50 dark:shadow-blue-900/30"
              >
                {activeMode === 'merge' ? <Spinner /> : <FileStack size={16} />}
                {count === 1 ? 'PDF保存' : 'PDF結合'}
              </button>

              {/* ZIP（常に表示・フォールバック） */}
              <button
                onClick={handleZip}
                disabled={isLoading || overLimit}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 font-semibold text-sm rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
              >
                {activeMode === 'zip' ? <Spinner /> : <Download size={15} />}
                ZIP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
