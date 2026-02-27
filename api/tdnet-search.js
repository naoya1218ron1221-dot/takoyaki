// TDnet 決算短信検索 API
// TDnetのWebページをスクレイピングして決算短信を検索する（個人利用目的）

import { load } from 'cheerio'

const TDNET_BASE = 'https://www.release.tdnet.info'

// 決算短信を示すキーワード
const KESSAN_KEYWORDS = ['決算短信', '四半期決算短信', '決算発表']

function normalizeDate(str) {
  if (!str) return ''
  // "YYYY/MM/DD" or "YYYY年MM月DD日" → "YYYY-MM-DD"
  const m = str.match(/(\d{4})[\/年](\d{1,2})[\/月](\d{1,2})/)
  if (!m) return str.trim()
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`
}

function yearsAgo(n) {
  const d = new Date()
  d.setFullYear(d.getFullYear() - n)
  return d
}

function toTdnetDateStr(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

async function fetchHtml(url, options = {}) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ja,en;q=0.9',
      'Referer': TDNET_BASE + '/',
      ...options.headers,
    },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  // TDnetはShift-JISの可能性があるがUTF-8も使用するため両方試みる
  const buf = await res.arrayBuffer()
  try {
    return new TextDecoder('utf-8').decode(buf)
  } catch {
    return new TextDecoder('shift-jis').decode(buf)
  }
}

async function searchByCompanyCode(secCode) {
  const items = []
  const startDate = toTdnetDateStr(yearsAgo(5))
  const endDate = toTdnetDateStr(new Date())

  // TDnet の検索フォームに POST
  // フォームフィールドは実際のHTML構造により異なる可能性あり
  const searchUrl = `${TDNET_BASE}/inbs/I_main_00.html`

  let html
  try {
    // まずGETでフォーム取得（CSRFトークン等のため）
    const formHtml = await fetchHtml(searchUrl)
    const $form = load(formHtml)

    // フォームのaction URLを取得
    const formAction = $form('form').first().attr('action') || '/inbs/I_search_main_00.html'
    const actionUrl = formAction.startsWith('http')
      ? formAction
      : `${TDNET_BASE}${formAction.startsWith('/') ? '' : '/inbs/'}${formAction}`

    // 検索パラメータ
    const params = new URLSearchParams()
    // 既存の隠しフィールドを含める
    $form('input[type="hidden"]').each((_, el) => {
      const name = $form(el).attr('name')
      const value = $form(el).attr('value') ?? ''
      if (name) params.set(name, value)
    })
    params.set('scode', secCode)
    params.set('startdate', startDate)
    params.set('enddate', endDate)
    params.set('type', '01') // 01 = 決算短信

    // POST リクエスト
    const searchRes = await fetch(actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': searchUrl,
      },
      body: params.toString(),
      signal: AbortSignal.timeout(20000),
    })

    if (!searchRes.ok) throw new Error(`Search POST failed: ${searchRes.status}`)
    const buf = await searchRes.arrayBuffer()
    html = new TextDecoder('utf-8').decode(buf)
  } catch (e) {
    // POST が失敗した場合、GETベースのURLを試みる
    try {
      const directUrl = `${TDNET_BASE}/inbs/I_search_main_00.html?scode=${encodeURIComponent(secCode)}&startdate=${startDate}&enddate=${endDate}`
      html = await fetchHtml(directUrl)
    } catch {
      throw new Error(`TDnet fetch failed: ${e.message}`)
    }
  }

  const $ = load(html)
  const seen = new Set()

  // 結果テーブルをパース（テーブル構造はTDnetの実際のHTML次第）
  // 一般的な日本の開示サイトのテーブル構造
  $('table tr, .list-item, .disclosure-row').each((_, row) => {
    const cells = $(row).find('td')
    if (cells.length < 3) return

    // 日付・コード・タイトルの列を探す
    let date = ''
    let title = ''
    let link = ''

    cells.each((i, cell) => {
      const text = $(cell).text().trim()
      // 日付らしい列
      if (!date && /\d{4}[\/\-年]\d{1,2}[\/\-月]\d{1,2}/.test(text)) {
        date = text
      }
      // リンクがある列（タイトル）
      const a = $(cell).find('a[href]')
      if (!link && a.length > 0) {
        const href = a.attr('href') ?? ''
        if (href.includes('.pdf') || href.includes('inbs')) {
          title = a.text().trim()
          link = href
        }
      }
    })

    if (!title || !link) return

    // 決算短信かどうかチェック
    const isKessan = KESSAN_KEYWORDS.some(kw => title.includes(kw))
    if (!isKessan) return

    // PDF URLを構築
    let pdfUrl = link
    if (!pdfUrl.startsWith('http')) {
      pdfUrl = pdfUrl.startsWith('/') ? `${TDNET_BASE}${pdfUrl}` : `${TDNET_BASE}/inbs/${pdfUrl}`
    }

    // ドキュメントIDを抽出
    const idMatch = pdfUrl.match(/([A-Z0-9]+)\.(?:pdf|html)/i)
    const docId = idMatch ? idMatch[1] : `tdnet-${Date.now()}-${Math.random().toString(36).slice(2)}`

    if (seen.has(docId)) return
    seen.add(docId)

    items.push({
      id: docId,
      source: 'tdnet',
      docTypeLabel: '決算短信',
      title,
      companyName: '',
      secCode,
      filedDate: normalizeDate(date),
      pdfUrl: `/api/proxy-pdf?id=${encodeURIComponent(docId)}&source=tdnet&origUrl=${encodeURIComponent(pdfUrl)}`,
    })
  })

  return items
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { secCode } = req.query
  if (!secCode || !/^\d{4}$/.test(secCode)) {
    return res.status(400).json({ error: 'secCode (4 digits) is required' })
  }

  try {
    const items = await searchByCompanyCode(secCode)
    items.sort((a, b) => b.filedDate.localeCompare(a.filedDate))
    return res.status(200).json({ items })
  } catch (err) {
    console.error('TDnet scrape error:', err)
    // エラーでも200を返してEDINET結果は表示できるようにする
    return res.status(200).json({ items: [], warning: 'TDnet検索に失敗しました: ' + err.message })
  }
}
