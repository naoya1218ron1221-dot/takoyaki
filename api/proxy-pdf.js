// PDF プロキシ API
// EDINET/TDnetのPDFをプロキシしてクライアントへ配信

import { Readable } from 'stream'

const EDINET_BASE = 'https://disclosure.edinet-fsa.go.jp/api/v2'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { id, source, origUrl } = req.query

  if (!id || !source) {
    return res.status(400).json({ error: 'id and source are required' })
  }

  let upstreamUrl
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  }

  if (source === 'edinet') {
    const apiKey = process.env.EDINET_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'EDINET_API_KEY is not configured' })
    // type=2: 主要書類PDF, type=4: 添付書類PDF
    upstreamUrl = `${EDINET_BASE}/documents/${encodeURIComponent(id)}?type=2&Subscription-Key=${apiKey}`
  } else if (source === 'tdnet') {
    // origUrlがあればそれを使う、なければdocIDからURLを推測
    if (origUrl) {
      upstreamUrl = decodeURIComponent(origUrl)
    } else {
      upstreamUrl = `https://www.release.tdnet.info/inbs/${encodeURIComponent(id)}.pdf`
    }
    headers['Referer'] = 'https://www.release.tdnet.info/'
  } else {
    return res.status(400).json({ error: 'Invalid source. Use "edinet" or "tdnet"' })
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      headers,
      signal: AbortSignal.timeout(25000),
    })

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `PDF取得失敗: HTTP ${upstream.status}`,
        url: upstreamUrl,
      })
    }

    const contentType = upstream.headers.get('content-type') ?? 'application/pdf'
    const contentLength = upstream.headers.get('content-length')

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `inline; filename="${id}.pdf"`)
    if (contentLength) res.setHeader('Content-Length', contentLength)
    res.setHeader('Cache-Control', 'public, max-age=3600')

    // Web ReadableStream → Node.js Readable に変換してパイプ
    const nodeReadable = Readable.fromWeb(upstream.body)
    nodeReadable.pipe(res)
  } catch (err) {
    console.error('proxy-pdf error:', err)
    if (!res.headersSent) {
      res.status(500).json({ error: 'PDF取得中にエラーが発生しました: ' + err.message })
    }
  }
}
