"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { storage } from "@/lib/storage";
import { AuthUser } from "@/lib/types";

const PAGE_TITLES: Record<string, string> = {
  "/": "ダッシュボード",
  "/reservations": "予約管理",
  "/calendar": "カレンダー",
  "/customers": "顧客管理",
  "/staff": "スタッフ管理",
  "/reports": "売上レポート",
  "/settings": "設定",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const auth = storage.getAuth();
    if (!auth) {
      router.replace("/login");
      return;
    }
    setUser(auth);
  }, [router]);

  const handleMenuClick = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const handleSidebarClose = useCallback(() => setSidebarOpen(false), []);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  const title = PAGE_TITLES[pathname] ?? "ReserveFlow";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* モバイルオーバーレイ */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={handleSidebarClose}
          aria-hidden="true"
        />
      )}

      {/* サイドバー */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar user={user} onClose={handleSidebarClose} />
      </div>

      {/* メインコンテンツ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header user={user} title={title} onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
