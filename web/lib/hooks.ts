"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GameRecord, ResultFilter } from "./types";
import { loadRecords, saveRecords, generateId } from "./storage";

export function useGameRecords() {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  // フィルター状態
  const [resultFilter, setResultFilter] = useState<ResultFilter>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string | null>(null);

  // UI状態
  const [toast, setToast] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<GameRecord | null>(null);
  const [detailTarget, setDetailTarget] = useState<GameRecord | null>(null);

  useEffect(() => {
    setRecords(loadRecords());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveRecords(records);
  }, [records, loaded]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addRecord = useCallback(
    (data: Omit<GameRecord, "id" | "createdAt">) => {
      const newRecord: GameRecord = {
        ...data,
        id: generateId(),
        createdAt: Date.now(),
      };
      setRecords((prev) =>
        [newRecord, ...prev].sort(
          (a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt
        )
      );
      showToast("記録を保存しました");
    },
    [showToast]
  );

  const updateRecord = useCallback(
    (updated: GameRecord) => {
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast("記録を更新しました");
    },
    [showToast]
  );

  const deleteRecord = useCallback(
    (id: string) => {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      showToast("記録を削除しました");
    },
    [showToast]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (resultFilter && r.result !== resultFilter) return false;
      if (yearFilter && !r.date.startsWith(yearFilter)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          r.stadium.toLowerCase().includes(q) ||
          r.opponent.toLowerCase().includes(q) ||
          r.memo.toLowerCase().includes(q) ||
          (r.companions?.toLowerCase().includes(q) ?? false) ||
          (r.seatInfo?.toLowerCase().includes(q) ?? false);
        if (!match) return false;
      }
      return true;
    });
  }, [records, resultFilter, searchQuery, yearFilter]);

  const availableYears = useMemo(() => {
    const years = new Set(records.map((r) => r.date.slice(0, 4)));
    return Array.from(years).sort().reverse();
  }, [records]);

  return {
    records,
    filteredRecords,
    resultFilter,
    setResultFilter,
    searchQuery,
    setSearchQuery,
    yearFilter,
    setYearFilter,
    availableYears,
    toast,
    editTarget,
    setEditTarget,
    detailTarget,
    setDetailTarget,
    addRecord,
    updateRecord,
    deleteRecord,
    loaded,
  };
}
