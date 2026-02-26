import {
  GameRecord,
  StadiumStat,
  OpponentStat,
  MonthlyStat,
  WeatherStat,
  SpendingStat,
  CompanionStat,
} from "./types";

export function weatherEmoji(w: string): string {
  switch (w) {
    case "晴れ":
      return "☀️";
    case "曇り":
      return "☁️";
    case "雨":
      return "🌧️";
    case "雪":
      return "❄️";
    case "ドーム":
      return "🏟️";
    default:
      return "";
  }
}

export function resultLabel(r: string): string {
  switch (r) {
    case "WIN":
      return "勝ち";
    case "LOSE":
      return "負け";
    case "DRAW":
      return "引き分け";
    case "CANCELLED":
      return "中止";
    default:
      return r;
  }
}

export function resultColor(r: string): string {
  switch (r) {
    case "WIN":
      return "bg-green-500";
    case "LOSE":
      return "bg-red-500";
    case "DRAW":
      return "bg-orange-400";
    case "CANCELLED":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
}

export function resultShort(r: string): string {
  switch (r) {
    case "WIN":
      return "勝";
    case "LOSE":
      return "負";
    case "DRAW":
      return "分";
    case "CANCELLED":
      return "中";
    default:
      return "?";
  }
}

export function getStadiumVisitCount(
  stadium: string,
  records: GameRecord[]
): number {
  return records.filter((r) => r.stadium === stadium).length;
}

export function getAvailableYears(records: GameRecord[]): string[] {
  const years = new Set(records.map((r) => r.date.slice(0, 4)));
  return Array.from(years).sort().reverse();
}

export function calcStadiumStats(records: GameRecord[]): StadiumStat[] {
  const map = new Map<string, { total: number; wins: number }>();
  records
    .filter((r) => r.result !== "CANCELLED")
    .forEach((r) => {
      const s = map.get(r.stadium) || { total: 0, wins: 0 };
      s.total++;
      if (r.result === "WIN") s.wins++;
      map.set(r.stadium, s);
    });
  return Array.from(map.entries())
    .map(([stadium, s]) => ({
      stadium,
      total: s.total,
      wins: s.wins,
      rate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function calcOpponentStats(records: GameRecord[]): OpponentStat[] {
  const map = new Map<string, { total: number; wins: number }>();
  records
    .filter((r) => r.result !== "CANCELLED")
    .forEach((r) => {
      const s = map.get(r.opponent) || { total: 0, wins: 0 };
      s.total++;
      if (r.result === "WIN") s.wins++;
      map.set(r.opponent, s);
    });
  return Array.from(map.entries())
    .map(([opponent, s]) => ({
      opponent,
      total: s.total,
      wins: s.wins,
      rate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function calcMonthlyStats(records: GameRecord[]): MonthlyStat[] {
  const map = new Map<string, { total: number; wins: number }>();
  records
    .filter((r) => r.result !== "CANCELLED")
    .forEach((r) => {
      const month = r.date.slice(0, 7);
      const s = map.get(month) || { total: 0, wins: 0 };
      s.total++;
      if (r.result === "WIN") s.wins++;
      map.set(month, s);
    });
  return Array.from(map.entries())
    .map(([month, s]) => ({
      month,
      total: s.total,
      wins: s.wins,
      rate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));
}

export function calcWeatherStats(records: GameRecord[]): WeatherStat[] {
  const map = new Map<string, { total: number; wins: number }>();
  records
    .filter((r) => r.result !== "CANCELLED" && r.weather)
    .forEach((r) => {
      const s = map.get(r.weather!) || { total: 0, wins: 0 };
      s.total++;
      if (r.result === "WIN") s.wins++;
      map.set(r.weather!, s);
    });
  return Array.from(map.entries())
    .map(([weather, s]) => ({
      weather,
      total: s.total,
      wins: s.wins,
      rate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function calcStadiumSpending(records: GameRecord[]): SpendingStat[] {
  const map = new Map<string, number>();
  records.forEach((r) => {
    if (r.ticketPrice) {
      map.set(r.stadium, (map.get(r.stadium) || 0) + r.ticketPrice);
    }
  });
  return Array.from(map.entries())
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function calcMonthlySpending(records: GameRecord[]): SpendingStat[] {
  const map = new Map<string, number>();
  records.forEach((r) => {
    if (r.ticketPrice) {
      const month = r.date.slice(0, 7);
      map.set(month, (map.get(month) || 0) + r.ticketPrice);
    }
  });
  return Array.from(map.entries())
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.label.localeCompare(a.label));
}

export function calcCompanionStats(records: GameRecord[]): CompanionStat[] {
  const map = new Map<string, { total: number; wins: number }>();
  records
    .filter((r) => r.result !== "CANCELLED" && r.companions)
    .forEach((r) => {
      r.companions!
        .split(/[,、]/)
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
        .forEach((name) => {
          const s = map.get(name) || { total: 0, wins: 0 };
          s.total++;
          if (r.result === "WIN") s.wins++;
          map.set(name, s);
        });
    });
  return Array.from(map.entries())
    .map(([name, s]) => ({
      name,
      total: s.total,
      wins: s.wins,
      rate: s.total > 0 ? (s.wins / s.total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function buildShareText(record: GameRecord): string {
  const lines = [
    "--- 現地観戦記録 ---",
    `${record.date} ${record.stadium}`,
    `vs ${record.opponent} (${resultLabel(record.result)})`,
  ];
  if (record.myScore != null && record.opponentScore != null) {
    lines.push(`スコア: ${record.myScore} - ${record.opponentScore}`);
  }
  if (record.weather) {
    lines.push(`天気: ${weatherEmoji(record.weather)} ${record.weather}`);
  }
  if (record.seatInfo) lines.push(`座席: ${record.seatInfo}`);
  if (record.companions) lines.push(`同行者: ${record.companions}`);
  if (record.memo) lines.push(`メモ: ${record.memo}`);
  lines.push("#現地観戦 #野球観戦");
  return lines.join("\n");
}
