"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 既にスタンドアロンなら表示しない
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // 既に dismissed なら表示しない
    if (sessionStorage.getItem("pwa_banner_dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setDismissed(true);
  };

  const handleDismiss = () => {
    sessionStorage.setItem("pwa_banner_dismissed", "1");
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-20 left-3 right-3 max-w-[456px] mx-auto z-50 install-banner">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-3">
        <div className="text-3xl">⚾</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">ホーム画面に追加</p>
          <p className="text-xs text-gray-500">
            アプリとして快適に使えます
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shrink-0 hover:bg-blue-700 transition-colors"
        >
          追加
        </button>
        <button
          onClick={handleDismiss}
          className="text-gray-400 text-lg shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
