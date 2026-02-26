"use client";

import { useState } from "react";
import { GameRecord } from "@/lib/types";
import {
  weatherEmoji,
  calcStadiumStats,
  calcOpponentStats,
  calcMonthlyStats,
  calcWeatherStats,
  calcStadiumSpending,
  calcMonthlySpending,
  calcCompanionStats,
} from "@/lib/utils";

const TABS = [
  "総合",
  "球場別",
  "対戦相手別",
  "月別",
  "天気別",
  "支出",
  "同行者別",
];

interface Props {
  records: GameRecord[];
}

export default function StatsView({ records }: Props) {
  const [tab, setTab] = useState(0);

  const played = records.filter((r) => r.result !== "CANCELLED");
  const wins = played.filter((r) => r.result === "WIN").length;
  const loses = played.filter((r) => r.result === "LOSE").length;
  const draws = played.filter((r) => r.result === "DRAW").length;
  const cancelled = records.filter((r) => r.result === "CANCELLED").length;
  const rate = played.length > 0 ? ((wins / played.length) * 100).toFixed(1) : "0.0";

  // 連勝・連敗
  let maxWinStreak = 0;
  let maxLoseStreak = 0;
  let curWin = 0;
  let curLose = 0;
  const sorted = [...played].sort((a, b) => a.date.localeCompare(b.date));
  for (const r of sorted) {
    if (r.result === "WIN") {
      curWin++;
      curLose = 0;
    } else if (r.result === "LOSE") {
      curLose++;
      curWin = 0;
    } else {
      curWin = 0;
      curLose = 0;
    }
    maxWinStreak = Math.max(maxWinStreak, curWin);
    maxLoseStreak = Math.max(maxLoseStreak, curLose);
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <h1 className="text-lg font-bold">データ分析</h1>
      </div>

      {/* タブ */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-gray-200 bg-white">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === i
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4">
        {records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            データがありません
          </div>
        ) : (
          <>
            {tab === 0 && (
              <OverallTab
                total={records.length}
                wins={wins}
                loses={loses}
                draws={draws}
                cancelled={cancelled}
                rate={rate}
                maxWinStreak={maxWinStreak}
                maxLoseStreak={maxLoseStreak}
              />
            )}
            {tab === 1 && <StadiumTab records={records} />}
            {tab === 2 && <OpponentTab records={records} />}
            {tab === 3 && <MonthlyTab records={records} />}
            {tab === 4 && <WeatherTab records={records} />}
            {tab === 5 && <SpendingTab records={records} />}
            {tab === 6 && <CompanionTab records={records} />}
          </>
        )}
      </div>
    </div>
  );
}

function OverallTab({
  total,
  wins,
  loses,
  draws,
  cancelled,
  rate,
  maxWinStreak,
  maxLoseStreak,
}: {
  total: number;
  wins: number;
  loses: number;
  draws: number;
  cancelled: number;
  rate: string;
  maxWinStreak: number;
  maxLoseStreak: number;
}) {
  return (
    <div className="space-y-4">
      {/* メイン勝率 */}
      <div className="bg-blue-50 rounded-2xl p-6 text-center">
        <p className="text-sm text-blue-600 mb-1">現地観戦勝率</p>
        <p className="text-5xl font-bold text-blue-700">{rate}%</p>
        <p className="text-sm text-blue-600 mt-2">
          {wins}勝 {loses}敗 {draws}分
          {cancelled > 0 && ` (中止${cancelled})`}
        </p>
        <p className="text-xs text-blue-500 mt-1">全{total}試合</p>
      </div>

      {/* 連勝連敗 */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="最大連勝" value={`${maxWinStreak}`} color="text-green-600" bg="bg-green-50" />
        <StatBox label="最大連敗" value={`${maxLoseStreak}`} color="text-red-600" bg="bg-red-50" />
      </div>
    </div>
  );
}

function StadiumTab({ records }: { records: GameRecord[] }) {
  const stats = calcStadiumStats(records);
  return (
    <div className="space-y-2">
      {stats.map((s) => (
        <StatRow
          key={s.stadium}
          label={s.stadium}
          sub={`${s.wins}勝 / ${s.total}試合`}
          rate={s.rate}
        />
      ))}
    </div>
  );
}

function OpponentTab({ records }: { records: GameRecord[] }) {
  const stats = calcOpponentStats(records);
  return (
    <div className="space-y-2">
      {stats.map((s) => (
        <StatRow
          key={s.opponent}
          label={s.opponent}
          sub={`${s.wins}勝 / ${s.total}試合`}
          rate={s.rate}
        />
      ))}
    </div>
  );
}

function MonthlyTab({ records }: { records: GameRecord[] }) {
  const stats = calcMonthlyStats(records);
  return (
    <div className="space-y-2">
      {stats.map((s) => (
        <StatRow
          key={s.month}
          label={s.month}
          sub={`${s.wins}勝 / ${s.total}試合`}
          rate={s.rate}
        />
      ))}
    </div>
  );
}

function WeatherTab({ records }: { records: GameRecord[] }) {
  const stats = calcWeatherStats(records);
  return (
    <div className="space-y-2">
      {stats.map((s) => (
        <StatRow
          key={s.weather}
          label={`${weatherEmoji(s.weather)} ${s.weather}`}
          sub={`${s.wins}勝 / ${s.total}試合`}
          rate={s.rate}
        />
      ))}
      {stats.length === 0 && (
        <p className="text-center py-8 text-gray-400 text-sm">
          天気データがありません
        </p>
      )}
    </div>
  );
}

function SpendingTab({ records }: { records: GameRecord[] }) {
  const stadiumSpending = calcStadiumSpending(records);
  const monthlySpending = calcMonthlySpending(records);
  const totalSpending = records.reduce(
    (sum, r) => sum + (r.ticketPrice ?? 0),
    0
  );
  const maxStadium =
    stadiumSpending.length > 0 ? stadiumSpending[0].amount : 0;
  const maxMonthly =
    monthlySpending.length > 0 ? monthlySpending[0].amount : 0;

  if (totalSpending === 0) {
    return (
      <p className="text-center py-8 text-gray-400 text-sm">
        チケット代のデータがありません
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* 合計 */}
      <div className="bg-amber-50 rounded-2xl p-5 text-center">
        <p className="text-sm text-amber-700">累計チケット支出</p>
        <p className="text-3xl font-bold text-amber-800">
          {totalSpending.toLocaleString()}円
        </p>
      </div>

      {/* 球場別 */}
      {stadiumSpending.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-2">球場別支出</h3>
          <div className="space-y-2">
            {stadiumSpending.map((s) => (
              <SpendingBar
                key={s.label}
                label={s.label}
                amount={s.amount}
                max={maxStadium}
              />
            ))}
          </div>
        </div>
      )}

      {/* 月別 */}
      {monthlySpending.length > 0 && (
        <div>
          <h3 className="font-bold text-sm mb-2">月別支出</h3>
          <div className="space-y-2">
            {monthlySpending.map((s) => (
              <SpendingBar
                key={s.label}
                label={s.label}
                amount={s.amount}
                max={maxMonthly}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompanionTab({ records }: { records: GameRecord[] }) {
  const stats = calcCompanionStats(records);
  return (
    <div className="space-y-2">
      {stats.map((s) => (
        <StatRow
          key={s.name}
          label={s.name}
          sub={`${s.wins}勝 / ${s.total}試合`}
          rate={s.rate}
        />
      ))}
      {stats.length === 0 && (
        <p className="text-center py-8 text-gray-400 text-sm">
          同行者データがありません
        </p>
      )}
    </div>
  );
}

/* -- 共通サブコンポーネント -- */

function StatBox({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4 text-center`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function StatRow({
  label,
  sub,
  rate,
}: {
  label: string;
  sub: string;
  rate: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-medium text-sm">{label}</span>
        <span className="text-sm font-bold text-blue-600">
          {rate.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(rate, 100)}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 shrink-0">{sub}</span>
      </div>
    </div>
  );
}

function SpendingBar({
  label,
  amount,
  max,
}: {
  label: string;
  amount: number;
  max: number;
}) {
  const pct = max > 0 ? (amount / max) * 100 : 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold text-amber-700">
          {amount.toLocaleString()}円
        </span>
      </div>
      <div className="bg-gray-100 rounded-full h-2">
        <div
          className="bg-amber-400 h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
