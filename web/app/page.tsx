"use client";

import { useState } from "react";
import { useGameRecords } from "@/lib/hooks";
import HistoryView from "@/components/HistoryView";
import AddGameForm from "@/components/AddGameForm";
import StatsView from "@/components/StatsView";
import DetailSheet from "@/components/DetailSheet";
import Toast from "@/components/Toast";

type Tab = "history" | "add" | "stats";

export default function Home() {
  const [tab, setTab] = useState<Tab>("history");
  const store = useGameRecords();

  const handleSaved = () => {
    setTab("history");
    store.setEditTarget(null);
  };

  const handleEdit = () => {
    store.setDetailTarget(null);
    setTab("add");
  };

  if (!store.loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen">
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

      {/* ボトムナビゲーション */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 max-w-[480px] mx-auto">
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
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs transition-colors ${
                tab === item.key
                  ? "text-blue-600 font-bold"
                  : "text-gray-500"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
