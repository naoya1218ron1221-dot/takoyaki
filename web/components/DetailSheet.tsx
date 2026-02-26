"use client";

import { GameRecord } from "@/lib/types";
import {
  weatherEmoji,
  resultLabel,
  resultColor,
  resultShort,
  getStadiumVisitCount,
  buildShareText,
} from "@/lib/utils";

interface Props {
  record: GameRecord;
  allRecords: GameRecord[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export default function DetailSheet({
  record,
  allRecords,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const visitCount = getStadiumVisitCount(record.stadium, allRecords);

  const handleShare = async () => {
    const text = buildShareText(record);
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("クリップボードにコピーしました");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end overlay"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-[480px] mx-auto bg-white rounded-t-2xl p-5 pb-8 sheet-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ドラッグハンドル */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-xl ${resultColor(record.result)} flex items-center justify-center text-white font-bold text-lg`}
          >
            {resultShort(record.result)}
          </div>
          <div>
            <p className="text-sm text-gray-500">{record.date}</p>
            <p className="font-bold text-lg">
              {record.stadium} vs {record.opponent}
              {record.weather && (
                <span className="ml-1">{weatherEmoji(record.weather)}</span>
              )}
            </p>
          </div>
        </div>

        {/* スコア */}
        {record.myScore != null && record.opponentScore != null && (
          <div className="bg-gray-100 rounded-xl py-3 text-center mb-4">
            <span className="text-3xl font-bold">
              {record.myScore} - {record.opponentScore}
            </span>
          </div>
        )}

        {/* 詳細 */}
        <div className="border-t border-gray-200 pt-3 space-y-2 mb-4">
          {visitCount > 0 && (
            <DetailRow label="この球場" value={`${visitCount}回目の観戦`} />
          )}
          {record.seatInfo && (
            <DetailRow label="座席" value={record.seatInfo} />
          )}
          {record.ticketPrice != null && (
            <DetailRow
              label="チケット代"
              value={`${record.ticketPrice.toLocaleString()}円`}
            />
          )}
          {record.weather && (
            <DetailRow
              label="天気"
              value={`${weatherEmoji(record.weather)} ${record.weather}`}
            />
          )}
          {record.companions && (
            <DetailRow label="同行者" value={record.companions} />
          )}
          {record.memo && <DetailRow label="メモ" value={record.memo} />}
        </div>

        {/* アクション */}
        <div className="border-t border-gray-200 pt-3 flex justify-around">
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <span>📤</span> シェア
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <span>✏️</span> 編集
          </button>
          <button
            onClick={() => {
              if (confirm(`${record.date} ${record.stadium} の記録を削除しますか？`)) {
                onDelete(record.id);
              }
            }}
            className="flex items-center gap-1 text-red-500 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <span>🗑️</span> 削除
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex">
      <span className="text-sm text-gray-500 w-24 shrink-0">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
