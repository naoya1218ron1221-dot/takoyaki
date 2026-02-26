export interface GameRecord {
  id: string;
  date: string;
  stadium: string;
  opponent: string;
  result: "WIN" | "LOSE" | "DRAW" | "CANCELLED";
  myScore?: number;
  opponentScore?: number;
  seatInfo?: string;
  ticketPrice?: number;
  weather?: string;
  companions?: string;
  memo: string;
  createdAt: number;
}

export type ResultFilter = GameRecord["result"] | null;

export interface StadiumStat {
  stadium: string;
  total: number;
  wins: number;
  rate: number;
}

export interface OpponentStat {
  opponent: string;
  total: number;
  wins: number;
  rate: number;
}

export interface MonthlyStat {
  month: string;
  total: number;
  wins: number;
  rate: number;
}

export interface WeatherStat {
  weather: string;
  total: number;
  wins: number;
  rate: number;
}

export interface SpendingStat {
  label: string;
  amount: number;
}

export interface CompanionStat {
  name: string;
  total: number;
  wins: number;
  rate: number;
}
