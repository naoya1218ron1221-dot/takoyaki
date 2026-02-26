"use client";

import { GameRecord, ResultFilter } from "@/lib/types";
import {
  weatherEmoji,
  resultColor,
  resultShort,
  getStadiumVisitCount,
} from "@/lib/utils";
import { useState } from "react";

const FILTERS: { value: ResultFilter; label: string }[] = [
  { value: null, label: "すべて" },
  { value: "WIN", label: "勝ち" },
  { value: "LOSE", label: "負け" },
  { value: "DRAW", label: "引分" },
  { value: "CANCELLED", label: "中止" },
];

interface Props {
  store: {
    records: GameRecord[];
    filteredRecords: GameRecord[];
    resultFilter: ResultFilter;
    setResultFilter: (f: ResultFilter) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    yearFilter: string | null;
    setYearFilter: (y: string | null) => void;
    availableYears: string[];
    setDetailTarget: (r: GameRecord | null) => void;
    deleteRecord: (id: string) => void;
  };
  onEdit: (record: GameRecord) => void;
}

export default function HistoryView({ store, onEdit }: Props) {
  const [showSearch, setShowSearch] = useState(false);

  const wins = store.records.filter((r) => r.result === "WIN").length;
  const loses = store.records.filter((r) => r.result === "LOSE").length;
  const draws = store.records.filter((r) => r.result === "DRAW").length;
  const played = store.records.filter((r) => r.result !== "CANCELLED").length;
  const rate = played > 0 ? ((wins / played) * 100).toFixed(1) : "0.0";
  const totalSpending = store.records.reduce(
    (sum, r) => sum + (r.ticketPrice ?? 0),
    0
  );

  return (
    <div>
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">現地観戦記録</h1>
        <button
          onClick={() => {
            setShowSearch(!showSearch);
            if (showSearch) store.setSearchQuery("");
          }}
          className="text-gray-600 text-xl p-1"
        >
          {showSearch ? "✕" : "🔍"}
        </button>
      </div>

      {/* 検索バー */}
      {showSearch && (
        <div className="px-4 pt-2">
          <div className="relative">
            <input
              type="text"
              placeholder="球場・対戦相手・メモで検索..."
              value={store.searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            {store.searchQuery && (
              <button
                onClick={() => store.setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-lg"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* ミニ戦績サマリー */}
      {store.records.length > 0 && (
        <div className="mx-4 mt-3 bg-blue-50 rounded-xl p-3">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-700">{rate}%</span>
            </div>
            <div className="text-center text-sm text-blue-800">
              {wins}勝 {loses}敗 {draws}分
            </div>
            <div className="text-center text-xs text-blue-600/70">
              全{store.records.length}試合
            </div>
          </div>
          {totalSpending > 0 && (
            <p className="text-xs text-blue-600/70 mt-1 text-center">
              累計チケット代: {totalSpending.toLocaleString()}円
            </p>
          )}
        </div>
      )}

      {/* 年度フィルター */}
      {store.availableYears.length > 0 && (
        <div className="flex gap-2 px-4 pt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => store.setYearFilter(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              store.yearFilter === null
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            全年度
          </button>
          {store.availableYears.map((y) => (
            <button
              key={y}
              onClick={() =>
                store.setYearFilter(store.yearFilter === y ? null : y)
              }
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                store.yearFilter === y
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {y}年
            </button>
          ))}
        </div>
      )}

      {/* 勝敗フィルター */}
      <div className="flex gap-2 px-4 pt-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => store.setResultFilter(f.value)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              store.resultFilter === f.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* レコード一覧 */}
      <div className="p-4 space-y-2">
        {store.filteredRecords.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {store.resultFilter || store.searchQuery || store.yearFilter
              ? "該当する記録がありません"
              : "まだ記録がありません\n「試合登録」から追加してください"}
          </div>
        ) : (
          store.filteredRecords.map((record) => {
            const visitCount = getStadiumVisitCount(
              record.stadium,
              store.records
            );
            return (
              <RecordCard
                key={record.id}
                record={record}
                visitCount={visitCount}
                onClick={() => store.setDetailTarget(record)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function RecordCard({
  record,
  visitCount,
  onClick,
}: {
  record: GameRecord;
  visitCount: number;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 active:bg-gray-50 cursor-pointer transition-colors"
    >
      {/* 勝敗バッジ */}
      <div
        className={`w-11 h-11 rounded-xl ${resultColor(record.result)} flex items-center justify-center text-white font-bold text-base shrink-0`}
      >
        {resultShort(record.result)}
      </div>

      {/* 情報 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>{record.date}</span>
          {record.weather && <span>{weatherEmoji(record.weather)}</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm truncate">
            {record.stadium} vs {record.opponent}
          </span>
          {visitCount > 1 && (
            <span className="shrink-0 bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded font-medium">
              {visitCount}回目
            </span>
          )}
        </div>
        {/* サブ情報 */}
        {(record.seatInfo || record.ticketPrice || record.companions) && (
          <p className="text-xs text-blue-600 truncate">
            {[
              record.seatInfo,
              record.ticketPrice
                ? `${record.ticketPrice.toLocaleString()}円`
                : null,
              record.companions,
            ]
              .filter(Boolean)
              .join(" / ")}
          </p>
        )}
        {record.memo && (
          <p className="text-xs text-gray-400 truncate">{record.memo}</p>
        )}
      </div>

      {/* スコア */}
      {record.myScore != null && record.opponentScore != null && (
        <div className="text-right shrink-0">
          <span className="font-bold text-base">
            {record.myScore} - {record.opponentScore}
          </span>
        </div>
      )}
    </div>
  );
}
