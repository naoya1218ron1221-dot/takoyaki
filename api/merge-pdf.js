// PDF結合 API
// 選択された複数PDFをpdf-libでマージして1つのPDFとして返す

import { PDFDocument } from 'pdf-lib'

const EDINET_BASE = 'https://disclosure.edinet-fsa.go.jp/api/v2'
const MAX_ITEMS = 20

async function fetchPdfBuffer(item, apiKey) {
  let url
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  }

  if (item.source === 'edinet') {
    url = `${EDINET_BASE}/documents/${encodeURIComponent(item.id)}?type=2&Subscription-Key=${apiKey}`
  } else if (item.source === 'tdnet') {
    url = item.origUrl ?? `https://www.release.tdnet.info/inbs/${encodeURIComponent(item.id)}.pdf`
    headers['Referer'] = 'https://www.release.tdnet.info/'
  } else {
    throw new Error(`Unknown source: ${item.source}`)
  }

  const res = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(25000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${item.id}`)
  return new Uint8Array(await res.arrayBuffer())
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.EDINET_API_KEY

  let body
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  if (!body?.items || !Array.isArray(body.items)) {
    return res.status(400).json({ error: 'body.items (array) is required' })
  }

  const { items } = body

  if (items.length === 0) return res.status(400).json({ error: 'No items provided' })
  if (items.length > MAX_ITEMS) {
    return res.status(400).json({ error: `Maximum ${MAX_ITEMS} items per request` })
  }

  const hasEdinet = items.some(i => i.source === 'edinet')
  if (hasEdinet && !apiKey) {
    return res.status(500).json({ error: 'EDINET_API_KEY is not configured' })
  }

  // 全PDFを並列フェッチ
  const fetchResults = await Promise.allSettled(
    items.map(item => fetchPdfBuffer(item, apiKey))
  )

  // マージ先PDFを作成
  const mergedPdf = await PDFDocument.create()

  // メタデータ
  const secCode = items[0]?.secCode ?? ''
  const companyName = items[0]?.companyName ?? secCode
  mergedPdf.setTitle(`${companyName} 開示書類 (${items.length}件)`)
  mergedPdf.setAuthor('開示検索アプリ')
  mergedPdf.setCreationDate(new Date())

  let successCount = 0

  for (let i = 0; i < items.length; i++) {
    const result = fetchResults[i]
    const item = items[i]

    if (result.status === 'rejected') {
      console.warn(`PDF取得失敗 ${item.id}:`, result.reason?.message)
      continue
    }

    try {
      const srcPdf = await PDFDocument.load(result.value, {
        // 暗号化PDFは無視してスキップ
        ignoreEncryption: true,
      })

      const pageCount = srcPdf.getPageCount()
      const pageIndices = Array.from({ length: pageCount }, (_, k) => k)
      const copiedPages = await mergedPdf.copyPagesFrom(srcPdf, pageIndices)
      copiedPages.forEach(page => mergedPdf.addPage(page))
      successCount++
    } catch (err) {
      console.warn(`PDF結合スキップ ${item.id}:`, err?.message)
    }
  }

  if (successCount === 0) {
    return res.status(502).json({ error: 'すべてのPDF結合に失敗しました。暗号化PDFは結合できない場合があります。' })
  }

  const pdfBytes = await mergedPdf.save()

  const timestamp = new Date().toISOString().slice(0, 10)
  const filename = `${secCode ? secCode + '_' : ''}merged_${timestamp}.pdf`

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Length', pdfBytes.byteLength)

  res.status(200).end(Buffer.from(pdfBytes))
}
