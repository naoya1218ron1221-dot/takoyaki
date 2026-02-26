"use client";

import { GameRecord, ResultFilter } from "@/lib/types";
import {
  weatherEmoji,
  resultColor,
  resultShort,
  getStadiumVisitCount,
} from "@/lib/utils";
import { useState, useRef, useCallback } from "react";

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
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-lg font-bold">現地観戦記録</h1>
        <button
          onClick={() => {
            setShowSearch(!showSearch);
            if (showSearch) store.setSearchQuery("");
          }}
          className="text-gray-600 text-xl p-1 tap-active"
        >
          {showSearch ? "✕" : "🔍"}
        </button>
      </div>

      {/* 検索バー */}
      {showSearch && (
        <div className="px-4 pt-2 tab-content">
          <div className="relative">
            <input
              type="text"
              placeholder="球場・対戦相手・メモで検索..."
              value={store.searchQuery}
              onChange={(e) => store.setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-xl pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
        <div className="mx-4 mt-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl p-4">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-700">{rate}<span className="text-lg">%</span></p>
              <p className="text-[10px] text-blue-500 mt-0.5">現地勝率</p>
            </div>
            <div className="w-px h-8 bg-blue-200" />
            <div className="text-center">
              <p className="text-sm font-bold text-blue-800">
                <span className="text-green-600">{wins}</span>勝{" "}
                <span className="text-red-500">{loses}</span>敗{" "}
                <span className="text-orange-500">{draws}</span>分
              </p>
              <p className="text-[10px] text-blue-500 mt-0.5">全{store.records.length}試合</p>
            </div>
          </div>
          {totalSpending > 0 && (
            <p className="text-xs text-blue-500 mt-2 text-center">
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
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all tap-active ${
              store.yearFilter === null
                ? "bg-blue-600 text-white shadow-sm"
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
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all tap-active ${
                store.yearFilter === y
                  ? "bg-blue-600 text-white shadow-sm"
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
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all tap-active ${
              store.resultFilter === f.value
                ? "bg-blue-600 text-white shadow-sm"
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
          <div className="text-center py-16">
            <div className="text-5xl mb-4">
              {store.resultFilter || store.searchQuery || store.yearFilter
                ? "🔍"
                : "⚾"}
            </div>
            <p className="text-gray-400 whitespace-pre-line">
              {store.resultFilter || store.searchQuery || store.yearFilter
                ? "該当する記録がありません"
                : "まだ記録がありません\n「試合登録」から追加してください"}
            </p>
          </div>
        ) : (
          store.filteredRecords.map((record) => {
            const visitCount = getStadiumVisitCount(
              record.stadium,
              store.records
            );
            return (
              <SwipeableCard
                key={record.id}
                record={record}
                visitCount={visitCount}
                onClick={() => store.setDetailTarget(record)}
                onDelete={() => store.deleteRecord(record.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function SwipeableCard({
  record,
  visitCount,
  onClick,
  onDelete,
}: {
  record: GameRecord;
  visitCount: number;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const swiping = useRef(false);
  const locked = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    swiping.current = false;
    locked.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - startX.current;
    const dy = e.touches[0].clientY - startY.current;

    if (!locked.current) {
      if (Math.abs(dy) > Math.abs(dx)) {
        locked.current = true;
        return;
      }
      if (Math.abs(dx) > 10) {
        swiping.current = true;
        locked.current = true;
      }
    }

    if (swiping.current && dx < 0) {
      setOffsetX(Math.max(dx, -100));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (offsetX < -60) {
      setOffsetX(-80);
    } else {
      setOffsetX(0);
    }
  }, [offsetX]);

  const handleClick = useCallback(() => {
    if (swiping.current) return;
    if (offsetX < -20) {
      setOffsetX(0);
      return;
    }
    onClick();
  }, [offsetX, onClick]);

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* 削除ボタン（背景） */}
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`${record.date} ${record.stadium} の記録を削除しますか？`)) {
              onDelete();
            }
          }}
          className="bg-red-500 text-white h-full px-5 flex items-center font-bold text-sm"
        >
          削除
        </button>
      </div>

      {/* カード本体 */}
      <div
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3 active:bg-gray-50 cursor-pointer transition-transform relative z-10"
        style={{ transform: `translateX(${offsetX}px)`, transition: swiping.current ? "none" : "transform 0.2s ease" }}
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
    </div>
  );
}
