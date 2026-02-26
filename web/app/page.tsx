"use client";

import { useState, useEffect } from "react";
import { useGameRecords } from "@/lib/hooks";
import HistoryView from "@/components/HistoryView";
import AddGameForm from "@/components/AddGameForm";
import StatsView from "@/components/StatsView";
import DetailSheet from "@/components/DetailSheet";
import Toast from "@/components/Toast";
import InstallBanner from "@/components/InstallBanner";

type Tab = "history" | "add" | "stats";

export default function Home() {
  const [tab, setTab] = useState<Tab>("history");
  const [showSplash, setShowSplash] = useState(true);
  const store = useGameRecords();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleSaved = () => {
    setTab("history");
    store.setEditTarget(null);
  };

  const handleEdit = () => {
    store.setDetailTarget(null);
    setTab("add");
  };

  // スプラッシュスクリーン
  if (showSplash || !store.loaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-600">
        <div className="text-6xl mb-4">⚾</div>
        <h1 className="text-2xl font-bold text-white">Ballpark Diary</h1>
        <p className="text-blue-200 text-sm mt-1">現地観戦記録</p>
        <div className="mt-8 flex gap-1">
          <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen">
        <div key={tab} className="tab-content">
          {tab === "history" && (
            <HistoryView
              store={store}
              onEdit={(record) => {
                store.setEditTarget(record);
                setTab("add");
              }}
            />
          )}
          {tab === "add" && (
            <AddGameForm
              store={store}
              onSaved={handleSaved}
              onBack={
                store.editTarget
                  ? () => {
                      store.setEditTarget(null);
                      setTab("history");
                    }
                  : undefined
              }
            />
          )}
          {tab === "stats" && <StatsView records={store.records} />}
        </div>
      </main>

      {/* 詳細ボトムシート */}
      {store.detailTarget && (
        <DetailSheet
          record={store.detailTarget}
          allRecords={store.records}
          onClose={() => store.setDetailTarget(null)}
          onEdit={handleEdit}
          onDelete={(id) => {
            store.deleteRecord(id);
            store.setDetailTarget(null);
          }}
        />
      )}

      {/* トースト */}
      <Toast message={store.toast} />

      {/* PWAインストールバナー */}
      <InstallBanner />

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 max-w-[480px] mx-auto" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="flex">
          {([
            { key: "history" as Tab, label: "戦績一覧", icon: "📋" },
            { key: "add" as Tab, label: "試合登録", icon: "➕" },
            { key: "stats" as Tab, label: "データ分析", icon: "📊" },
          ]).map((item) => (
            <button
              key={item.key}
              onClick={() => {
                if (item.key === "add") store.setEditTarget(null);
                setTab(item.key);
              }}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs transition-all tap-active ${
                tab === item.key
                  ? "text-blue-600 font-bold"
                  : "text-gray-400"
              }`}
            >
              <span className={`text-lg transition-transform ${tab === item.key ? "scale-110" : ""}`}>{item.icon}</span>
              <span>{item.label}</span>
              {tab === item.key && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
