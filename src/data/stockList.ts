export interface StockInfo {
  code: string
  name: string
}

/** 主要上場企業リスト（Nikkei225 + 人気銘柄 中心） */
export const STOCK_LIST: StockInfo[] = [
  // 建設・不動産
  { code: '1721', name: 'コムシスHD' },
  { code: '1801', name: '大成建設' },
  { code: '1802', name: '大林組' },
  { code: '1803', name: '清水建設' },
  { code: '1808', name: '長谷工コーポレーション' },
  { code: '1812', name: '鹿島建設' },
  { code: '1925', name: '大和ハウス工業' },
  { code: '1928', name: '積水ハウス' },
  { code: '3003', name: 'ヒューリック' },
  { code: '8801', name: '三井不動産' },
  { code: '8802', name: '三菱地所' },
  { code: '8803', name: '平和不動産' },
  { code: '8804', name: '東急不動産HD' },
  { code: '8830', name: '住友不動産' },

  // 資源・エネルギー
  { code: '1605', name: 'INPEX' },
  { code: '5019', name: '出光興産' },
  { code: '5020', name: 'ENEOSホールディングス' },
  { code: '9501', name: '東京電力HD' },
  { code: '9502', name: '中部電力' },
  { code: '9503', name: '関西電力' },
  { code: '9531', name: '東京ガス' },
  { code: '9532', name: '大阪ガス' },

  // 食品・飲料
  { code: '2002', name: '日清製粉グループ本社' },
  { code: '2269', name: '明治HD' },
  { code: '2282', name: '日本ハム' },
  { code: '2501', name: 'サッポロHD' },
  { code: '2502', name: 'アサヒグループHD' },
  { code: '2503', name: 'キリンHD' },
  { code: '2531', name: '宝HD' },
  { code: '2578', name: 'コカ・コーラボトラーズジャパンHD' },
  { code: '2593', name: '伊藤園' },
  { code: '2651', name: 'ローソン' },
  { code: '2702', name: '日本マクドナルドHD' },
  { code: '2768', name: '双日' },
  { code: '2801', name: 'キッコーマン' },
  { code: '2802', name: '味の素' },
  { code: '2871', name: 'ニチレイ' },
  { code: '2875', name: '東洋水産' },
  { code: '2914', name: '日本たばこ産業' },

  // 小売・流通
  { code: '2670', name: 'エービーシー・マート' },
  { code: '3086', name: 'Jフロントリテイリング' },
  { code: '3099', name: '三越伊勢丹HD' },
  { code: '3382', name: 'セブン&アイ・HD' },
  { code: '3563', name: 'FOOD&LIFE COMPANIES（スシロー）' },
  { code: '3197', name: 'すかいらーくHD' },
  { code: '8233', name: '高島屋' },
  { code: '8252', name: '丸井グループ' },
  { code: '8267', name: 'イオン' },
  { code: '9843', name: 'ニトリHD' },
  { code: '9983', name: 'ファーストリテイリング' },

  // 化学・素材
  { code: '3401', name: '帝人' },
  { code: '3402', name: '東レ' },
  { code: '3405', name: 'クラレ' },
  { code: '3407', name: '旭化成' },
  { code: '3436', name: 'SUMCO' },
  { code: '3861', name: '王子HD' },
  { code: '4004', name: '昭和電工' },
  { code: '4005', name: '住友化学' },
  { code: '4021', name: '日産化学' },
  { code: '4042', name: '東ソー' },
  { code: '4061', name: 'デンカ' },
  { code: '4063', name: '信越化学工業' },
  { code: '4151', name: '協和キリン' },
  { code: '4183', name: '三井化学' },
  { code: '4188', name: '三菱ケミカルグループ' },
  { code: '4208', name: '宇部興産' },

  // 医薬品・ヘルスケア
  { code: '4502', name: '武田薬品工業' },
  { code: '4503', name: 'アステラス製薬' },
  { code: '4507', name: '塩野義製薬' },
  { code: '4519', name: '中外製薬' },
  { code: '4523', name: 'エーザイ' },
  { code: '4543', name: 'テルモ' },
  { code: '4568', name: '第一三共' },
  { code: '4578', name: '大塚HD' },

  // IT・通信・サービス
  { code: '2413', name: 'エムスリー' },
  { code: '2432', name: 'ディー・エヌ・エー' },
  { code: '3659', name: 'ネクソン' },
  { code: '3632', name: 'グリー' },
  { code: '4324', name: '電通グループ' },
  { code: '4452', name: '花王' },
  { code: '4661', name: 'オリエンタルランド' },
  { code: '4689', name: 'LINEヤフー' },
  { code: '4704', name: 'トレンドマイクロ' },
  { code: '4751', name: 'サイバーエージェント' },
  { code: '4755', name: '楽天グループ' },
  { code: '4901', name: '富士フイルムHD' },
  { code: '6098', name: 'リクルートHD' },
  { code: '9613', name: 'NTTデータグループ' },
  { code: '9735', name: 'セコム' },
  { code: '9766', name: 'コナミグループ' },
  { code: '9984', name: 'ソフトバンクグループ' },
  { code: '9434', name: 'ソフトバンク' },
  { code: '9433', name: 'KDDI' },
  { code: '9432', name: '日本電信電話（NTT）' },

  // 電子・精密機器
  { code: '6526', name: 'ソシオネクスト' },
  { code: '6645', name: 'オムロン' },
  { code: '6702', name: '富士通' },
  { code: '6724', name: 'セイコーエプソン' },
  { code: '6752', name: 'パナソニックHD' },
  { code: '6753', name: 'シャープ' },
  { code: '6758', name: 'ソニーグループ' },
  { code: '6762', name: 'TDK' },
  { code: '6770', name: 'アルプスアルパイン' },
  { code: '6841', name: '横河電機' },
  { code: '6857', name: 'アドバンテスト' },
  { code: '6861', name: 'キーエンス' },
  { code: '6869', name: 'シスメックス' },
  { code: '6902', name: 'デンソー' },
  { code: '6920', name: 'レーザーテック' },
  { code: '6923', name: 'スタンレー電気' },
  { code: '6954', name: 'ファナック' },
  { code: '6963', name: 'ローム' },
  { code: '6965', name: '浜松ホトニクス' },
  { code: '6971', name: '京セラ' },
  { code: '6976', name: '太陽誘電' },
  { code: '6981', name: '村田製作所' },
  { code: '6988', name: '日東電工' },
  { code: '8035', name: '東京エレクトロン' },

  // 機械・製造
  { code: '6103', name: 'オークマ' },
  { code: '6113', name: 'アマダ' },
  { code: '6146', name: 'ディスコ' },
  { code: '6301', name: '小松製作所' },
  { code: '6326', name: 'クボタ' },
  { code: '6367', name: 'ダイキン工業' },
  { code: '6383', name: 'ダイフク' },
  { code: '6448', name: 'ブラザー工業' },
  { code: '6460', name: 'セガサミーHD' },
  { code: '6473', name: 'ジェイテクト' },
  { code: '6479', name: 'ミネベアミツミ' },
  { code: '6481', name: 'THK' },
  { code: '6501', name: '日立製作所' },
  { code: '6503', name: '三菱電機' },
  { code: '6504', name: '富士電機' },
  { code: '6506', name: '安川電機' },

  // 自動車・輸送機器
  { code: '5108', name: 'ブリヂストン' },
  { code: '5101', name: '横浜ゴム' },
  { code: '7201', name: '日産自動車' },
  { code: '7202', name: 'いすゞ自動車' },
  { code: '7203', name: 'トヨタ自動車' },
  { code: '7211', name: '三菱自動車工業' },
  { code: '7261', name: 'マツダ' },
  { code: '7267', name: '本田技研工業' },
  { code: '7270', name: 'SUBARU' },
  { code: '7272', name: 'ヤマハ発動機' },
  { code: '7011', name: '三菱重工業' },
  { code: '7012', name: '川崎重工業' },
  { code: '7013', name: 'IHI' },

  // 光学・カメラ
  { code: '7731', name: 'ニコン' },
  { code: '7733', name: 'オリンパス' },
  { code: '7741', name: 'HOYA' },
  { code: '7751', name: 'キヤノン' },
  { code: '7752', name: 'リコー' },

  // エンタメ・ゲーム
  { code: '7832', name: 'バンダイナムコHD' },
  { code: '7951', name: 'ヤマハ' },
  { code: '7974', name: '任天堂' },
  { code: '9602', name: '東宝' },

  // 印刷・紙
  { code: '7911', name: '凸版印刷' },
  { code: '7912', name: '大日本印刷' },

  // 鉄鋼・金属
  { code: '5401', name: '日本製鉄' },
  { code: '5411', name: 'JFEホールディングス' },
  { code: '5631', name: '日本製鋼所' },
  { code: '5713', name: '住友金属鉱山' },
  { code: '5802', name: '住友電気工業' },
  { code: '5801', name: '古河電気工業' },

  // 商社
  { code: '8001', name: '伊藤忠商事' },
  { code: '8002', name: '丸紅' },
  { code: '8015', name: '豊田通商' },
  { code: '8031', name: '三井物産' },
  { code: '8053', name: '住友商事' },
  { code: '8058', name: '三菱商事' },

  // 金融・銀行
  { code: '8306', name: '三菱UFJフィナンシャル・グループ' },
  { code: '8308', name: 'りそなHD' },
  { code: '8309', name: '三井住友トラストHD' },
  { code: '8316', name: '三井住友フィナンシャルグループ' },
  { code: '8331', name: '千葉銀行' },
  { code: '8354', name: 'ふくおかFG' },
  { code: '8355', name: '静岡銀行' },
  { code: '8411', name: 'みずほフィナンシャルグループ' },

  // 証券・保険
  { code: '8591', name: 'オリックス' },
  { code: '8601', name: '大和証券グループ本社' },
  { code: '8604', name: '野村HD' },
  { code: '8630', name: 'SOMPOホールディングス' },
  { code: '8725', name: 'MS&ADインシュアランスグループHD' },
  { code: '8750', name: '第一生命HD' },
  { code: '8766', name: '東京海上HD' },
  { code: '8795', name: 'T&Dホールディングス' },

  // 交通・物流
  { code: '5201', name: 'AGC' },
  { code: '6178', name: '日本郵政' },
  { code: '9064', name: 'ヤマトHD' },
  { code: '9101', name: '日本郵船' },
  { code: '9104', name: '商船三井' },
  { code: '9107', name: '川崎汽船' },
  { code: '9201', name: '日本航空' },
  { code: '9202', name: 'ANAホールディングス' },
  { code: '9005', name: '東急' },
  { code: '9007', name: '小田急電鉄' },
  { code: '9008', name: '京王電鉄' },
  { code: '9009', name: '京成電鉄' },
  { code: '9020', name: 'JR東日本（東日本旅客鉄道）' },
  { code: '9021', name: 'JR西日本（西日本旅客鉄道）' },
  { code: '9022', name: 'JR東海（東海旅客鉄道）' },
]

/** コードまたは会社名でファジー検索 */
export function searchStocks(query: string, limit = 8): StockInfo[] {
  if (!query || query.length < 1) return []
  const q = query.trim().toLowerCase()

  // コード完全一致 or 前方一致を優先
  const exact: StockInfo[] = []
  const partial: StockInfo[] = []

  for (const s of STOCK_LIST) {
    if (s.code === q || s.code.startsWith(q)) {
      exact.push(s)
    } else if (
      s.name.toLowerCase().includes(q) ||
      s.code.includes(q)
    ) {
      partial.push(s)
    }
  }

  return [...exact, ...partial].slice(0, limit)
}

/** コードから会社名を引く */
export function getStockName(code: string): string {
  return STOCK_LIST.find(s => s.code === code)?.name ?? ''
}
