// EDINET 年次検索 API
// 1年分の四半期決算提出窓口を並列検索し、指定銘柄コードの書類を返す

const EDINET_BASE = 'https://disclosure.edinet-fsa.go.jp/api/v2'

// 四半期決算の主な提出窓口 [開始月, 開始日, 終了月, 終了日]
// 3月決算 (最多): 5-7月(通期), 8-9月(Q1), 11-12月(Q2), 2-3月(Q3)
// 他の決算期も含む広めの窓口を設定
const FILING_WINDOWS = [
  { startMD: [4, 15], endMD: [7, 31] },  // 通期決算 (3月期: 5-6月提出)
  { startMD: [7, 15], endMD: [9, 30] },  // Q1 (3月期: 8月提出)
  { startMD: [10, 15], endMD: [12, 31] }, // Q2 (3月期: 11月提出)
  { startMD: [1, 15], endMD: [3, 31] },  // Q3 (3月期: 2月提出)
]

// 取得対象のdocTypeCode
const DOC_TYPE_MAP = {
  '120': '有価証券報告書',
  '130': '半期報告書',
  '140': '四半期報告書',
  '150': '四半期報告書',
}

function buildDateList(fiscalYear) {
  // fiscalYear: 例 2024 → 2024年4月〜2025年3月の書類
  const dates = []
  for (const w of FILING_WINDOWS) {
    // Q3窓口 (1-3月) は翌暦年
    const startYear = w.startMD[0] <= 3 ? fiscalYear + 1 : fiscalYear
    const endYear = w.endMD[0] <= 3 ? fiscalYear + 1 : fiscalYear

    const start = new Date(startYear, w.startMD[0] - 1, w.startMD[1])
    const end = new Date(endYear, w.endMD[0] - 1, w.endMD[1])
    const today = new Date()

    for (let d = new Date(start); d <= end && d <= today; d.setDate(d.getDate() + 1)) {
      const dow = d.getDay()
      if (dow === 0 || dow === 6) continue // 土日スキップ
      dates.push(d.toISOString().slice(0, 10))
    }
  }
  return [...new Set(dates)].sort()
}

async function fetchEdinetDay(date, apiKey) {
  const url = `${EDINET_BASE}/documents.json?date=${date}&type=2&Subscription-Key=${apiKey}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) })
    if (!res.ok) return []
    const data = await res.json()
    return data?.results ?? []
  } catch {
    return []
  }
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { secCode, year } = req.query
  const apiKey = process.env.EDINET_API_KEY

  if (!secCode || !year) {
    return res.status(400).json({ error: 'secCode and year are required' })
  }
  if (!apiKey) {
    return res.status(500).json({ error: 'EDINET_API_KEY is not configured' })
  }

  const fiscalYear = parseInt(year, 10)
  if (isNaN(fiscalYear) || fiscalYear < 2000 || fiscalYear > 2100) {
    return res.status(400).json({ error: 'Invalid year' })
  }

  // EDINETのsecCodeは末尾に0を付加 (例: 7203 → 72030)
  // 比較用に末尾0を除いた形式に統一
  const normalizedInput = secCode.replace(/0+$/, '')

  const dates = buildDateList(fiscalYear)
  const BATCH = 20
  const allItems = []
  const seen = new Set()

  for (let i = 0; i < dates.length; i += BATCH) {
    const batch = dates.slice(i, i + BATCH)
    const results = await Promise.all(batch.map(d => fetchEdinetDay(d, apiKey)))

    for (const dayDocs of results) {
      for (const doc of dayDocs) {
        const code = String(doc.secCode ?? '').replace(/0+$/, '')
        if (code !== normalizedInput) continue

        const typeCode = String(doc.docTypeCode ?? '')
        const label = DOC_TYPE_MAP[typeCode]
        if (!label) continue

        const docID = doc.docID
        if (seen.has(docID)) continue
        seen.add(docID)

        allItems.push({
          id: docID,
          source: 'edinet',
          docTypeLabel: label,
          title: doc.docDescription ?? label,
          companyName: doc.filerName ?? '',
          secCode: normalizedInput,
          filedDate: (doc.submitDateTime ?? '').slice(0, 10),
          pdfUrl: `/api/proxy-pdf?id=${encodeURIComponent(docID)}&source=edinet`,
        })
      }
    }
  }

  allItems.sort((a, b) => b.filedDate.localeCompare(a.filedDate))

  return res.status(200).json({ items: allItems, year: fiscalYear })
}
