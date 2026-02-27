// ZIP一括ダウンロード API
// 選択された複数PDFをZIPにまとめてダウンロード

import archiver from 'archiver'

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
    signal: AbortSignal.timeout(20000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status} for ${item.id}`)
  const buf = await res.arrayBuffer()
  return Buffer.from(buf)
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.EDINET_API_KEY

  let body
  try {
    // Vercelはapplication/jsonのbodyを自動パース
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

  // EDINET APIキーチェック（EDINETのアイテムが含まれる場合）
  const hasEdinet = items.some(i => i.source === 'edinet')
  if (hasEdinet && !apiKey) {
    return res.status(500).json({ error: 'EDINET_API_KEY is not configured' })
  }

  const secCode = items[0]?.secCode ?? 'docs'
  const timestamp = new Date().toISOString().slice(0, 10)
  const filename = `disclosures_${secCode}_${timestamp}.zip`

  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('Cache-Control', 'no-store')

  const archive = archiver('zip', {
    zlib: { level: 3 }, // PDFは圧縮が効かないので低圧縮で高速化
  })

  archive.on('error', (err) => {
    console.error('archiver error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'ZIP作成中にエラーが発生しました' })
    }
  })

  archive.pipe(res)

  // 全PDFを並列フェッチ
  const fetchResults = await Promise.allSettled(
    items.map(item => fetchPdfBuffer(item, apiKey))
  )

  let successCount = 0
  for (let i = 0; i < items.length; i++) {
    const result = fetchResults[i]
    const item = items[i]

    if (result.status === 'fulfilled') {
      // ファイル名: YYYY-MM-DD_書類種別_docID.pdf
      const safeName = (item.filename ?? `${item.filedDate ?? 'unknown'}_${item.source}_${item.id}.pdf`)
        .replace(/[\\/:*?"<>|]/g, '_') // Windowsでも安全なファイル名
      archive.append(result.value, { name: safeName })
      successCount++
    } else {
      console.warn(`PDF取得失敗 ${item.id}:`, result.reason?.message)
    }
  }

  if (successCount === 0) {
    archive.abort()
    return res.status(502).json({ error: 'すべてのPDF取得に失敗しました' })
  }

  await archive.finalize()
}
