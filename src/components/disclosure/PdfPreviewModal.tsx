import { X, ExternalLink, Share2, Download } from 'lucide-react'
import type { DisclosureItem } from '../../types/disclosure'

interface Props {
  item: DisclosureItem
  onClose: () => void
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

export default function PdfPreviewModal({ item, onClose }: Props) {
  const canShare = typeof navigator.share === 'function'

  const handleShare = async () => {
    if (canShare) {
      try {
        await navigator.share({
          title: item.title,
          text: `${item.companyName} - ${item.title}`,
          url: item.pdfUrl,
        })
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(item.pdfUrl).catch(() => {})
      alert('URLをクリップボードにコピーしました')
    }
  }

  const handleOpenExternal = () => {
    window.open(item.pdfUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center gap-3 bg-white dark:bg-gray-900 px-4 py-3 shadow-md flex-shrink-0"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          aria-label="閉じる"
        >
          <X size={20} className="text-gray-600 dark:text-gray-300" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{item.title}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{item.companyName} · {item.filedDate}</p>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {canShare && (
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="共有"
            >
              <Share2 size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <a
            href={item.pdfUrl}
            download
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="ダウンロード"
            onClick={e => e.stopPropagation()}
          >
            <Download size={18} className="text-gray-600 dark:text-gray-300" />
          </a>
          <button
            onClick={handleOpenExternal}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="外部で開く"
          >
            <ExternalLink size={18} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* PDFビューア本体 */}
      <div className="flex-1 overflow-hidden" onClick={e => e.stopPropagation()}>
        {isIOS() ? (
          /* iOS Safari は iframe でPDFをインライン表示できない場合がある → 案内UI */
          <div className="h-full flex flex-col items-center justify-center gap-5 bg-gray-50 dark:bg-gray-900 px-8 text-center">
            <div className="text-6xl">📄</div>
            <div>
              <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">
                PDFをプレビュー
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">
                iOSではSafariで開いてFilesアプリへ保存できます。
                下のボタンからPDFを開いてください。
              </p>
            </div>
            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-200/50 dark:shadow-blue-900/30 hover:bg-blue-600 active:scale-[0.98] transition-all"
            >
              <ExternalLink size={18} />
              Safariで開く
            </button>
            {canShare && (
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 size={18} />
                共有 / コピー
              </button>
            )}
          </div>
        ) : (
          <iframe
            src={item.pdfUrl}
            title={item.title}
            className="w-full h-full border-0 bg-gray-100"
          />
        )}
      </div>
    </div>
  )
}
