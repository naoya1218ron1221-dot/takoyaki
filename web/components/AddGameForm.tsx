"use client";

import { useState, useEffect } from "react";
import { GameRecord } from "@/lib/types";

const STADIUMS = [
  "東京ドーム", "神宮球場", "横浜スタジアム", "バンテリンドーム",
  "甲子園球場", "京セラドーム", "マツダスタジアム", "PayPayドーム",
  "札幌ドーム", "エスコンフィールド", "楽天モバイルパーク", "ベルーナドーム",
  "ZOZOマリンスタジアム", "ほっと神戸", "その他"
];

const TEAMS = [
  "巨人", "阪神", "DeNA", "広島", "中日", "ヤクルト",
  "ソフトバンク", "オリックス", "西武", "楽天", "ロッテ", "日本ハム",
  "その他"
];

const RESULTS = [
  { value: "WIN" as const, label: "勝ち", color: "bg-green-500" },
  { value: "LOSE" as const, label: "負け", color: "bg-red-500" },
  { value: "DRAW" as const, label: "引分", color: "bg-orange-400" },
  { value: "CANCELLED" as const, label: "中止", color: "bg-gray-400" },
];

const WEATHERS = [
  { value: "晴れ", emoji: "☀️" },
  { value: "曇り", emoji: "☁️" },
  { value: "雨", emoji: "🌧️" },
  { value: "雪", emoji: "❄️" },
  { value: "ドーム", emoji: "🏟️" },
];

interface Props {
  store: {
    editTarget: GameRecord | null;
    addRecord: (data: Omit<GameRecord, "id" | "createdAt">) => void;
    updateRecord: (record: GameRecord) => void;
  };
  onSaved: () => void;
  onBack?: () => void;
}

export default function AddGameForm({ store, onSaved, onBack }: Props) {
  const isEdit = !!store.editTarget;
  const [date, setDate] = useState("");
  const [stadium, setStadium] = useState("");
  const [opponent, setOpponent] = useState("");
  const [result, setResult] = useState<GameRecord["result"]>("WIN");
  const [myScore, setMyScore] = useState("");
  const [opponentScore, setOpponentScore] = useState("");
  const [weather, setWeather] = useState<string | undefined>();
  const [seatInfo, setSeatInfo] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [companions, setCompanions] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (store.editTarget) {
      const r = store.editTarget;
      setDate(r.date);
      setStadium(r.stadium);
      setOpponent(r.opponent);
      setResult(r.result);
      setMyScore(r.myScore?.toString() ?? "");
      setOpponentScore(r.opponentScore?.toString() ?? "");
      setWeather(r.weather);
      setSeatInfo(r.seatInfo ?? "");
      setTicketPrice(r.ticketPrice?.toString() ?? "");
      setCompanions(r.companions ?? "");
      setMemo(r.memo);
    } else {
      setDate(new Date().toISOString().slice(0, 10));
      setStadium("");
      setOpponent("");
      setResult("WIN");
      setMyScore("");
      setOpponentScore("");
      setWeather(undefined);
      setSeatInfo("");
      setTicketPrice("");
      setCompanions("");
      setMemo("");
    }
  }, [store.editTarget]);

  const handleSubmit = () => {
    if (!date || !stadium || !opponent) return;

    const data = {
      date,
      stadium,
      opponent,
      result,
      myScore: myScore ? parseInt(myScore) : undefined,
      opponentScore: opponentScore ? parseInt(opponentScore) : undefined,
      weather: weather || undefined,
      seatInfo: seatInfo || undefined,
      ticketPrice: ticketPrice ? parseInt(ticketPrice) : undefined,
      companions: companions || undefined,
      memo: memo || "",
    };

    if (store.editTarget) {
      store.updateRecord({
        ...store.editTarget,
        ...data,
      });
    } else {
      store.addRecord(data);
    }
    onSaved();
  };

  return (
    <div>
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        {onBack && (
          <button onClick={onBack} className="text-blue-600 text-xl">
            ←
          </button>
        )}
        <h1 className="text-lg font-bold">
          {isEdit ? "試合を編集" : "試合登録"}
        </h1>
      </div>

      <div className="p-4 space-y-5">
        {/* 日付 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付 *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 球場 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            球場 *
          </label>
          <select
            value={stadium}
            onChange={(e) => setStadium(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">選択してください</option>
            {STADIUMS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* 対戦相手 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            対戦相手 *
          </label>
          <select
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">選択してください</option>
            {TEAMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* 結果 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            結果
          </label>
          <div className="flex gap-2">
            {RESULTS.map((r) => (
              <button
                key={r.value}
                onClick={() => setResult(r.value)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  result === r.value
                    ? `${r.color} text-white shadow-md`
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* スコア */}
        {result !== "CANCELLED" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              スコア
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="自チーム"
                value={myScore}
                onChange={(e) => setMyScore(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
              <span className="text-xl font-bold text-gray-400">-</span>
              <input
                type="number"
                placeholder="相手"
                value={opponentScore}
                onChange={(e) => setOpponentScore(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-center text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
          </div>
        )}

        {/* 天気 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            天気
          </label>
          <div className="flex gap-2">
            {WEATHERS.map((w) => (
              <button
                key={w.value}
                onClick={() =>
                  setWeather(weather === w.value ? undefined : w.value)
                }
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                  weather === w.value
                    ? "bg-blue-100 text-blue-700 ring-2 ring-blue-400"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <div className="text-lg">{w.emoji}</div>
                <div className="text-xs">{w.value}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 座席 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            座席
          </label>
          <input
            type="text"
            placeholder="例: 内野A指定席 1塁側"
            value={seatInfo}
            onChange={(e) => setSeatInfo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* チケット代 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            チケット代
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0"
              value={ticketPrice}
              onChange={(e) => setTicketPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              円
            </span>
          </div>
        </div>

        {/* 同行者 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            同行者
          </label>
          <input
            type="text"
            placeholder="例: 田中、佐藤"
            value={companions}
            onChange={(e) => setCompanions(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* メモ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メモ
          </label>
          <textarea
            placeholder="自由にメモを記入..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSubmit}
          disabled={!date || !stadium || !opponent}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-base disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-md"
        >
          {isEdit ? "更新する" : "記録を保存"}
        </button>
      </div>
    </div>
  );
}
