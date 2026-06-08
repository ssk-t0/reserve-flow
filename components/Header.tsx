"use client";

import { Menu, Bell, ChevronRight } from "lucide-react";
import { AuthUser } from "@/lib/types";

interface HeaderProps {
  user: AuthUser;
  title: string;
  onMenuClick: () => void;
}

export default function Header({ user, title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-stone-50/95 backdrop-blur border-b border-stone-200 px-4 sm:px-6 h-16 flex items-center justify-between">
      {/* 左側: メニューボタン + ページタイトル */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-stone-500 hover:text-slate-800 hover:bg-white transition"
          aria-label="メニューを開く"
        >
          <Menu size={20} />
        </button>

        {/* パンくず風タイトル */}
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden sm:inline text-stone-400">ReserveFlow</span>
          <ChevronRight size={14} className="hidden sm:inline text-stone-300" />
          <span className="font-semibold text-slate-800">{title}</span>
        </div>
      </div>

      {/* 右側: 通知 + ユーザー情報 */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-stone-400 hover:text-slate-700 hover:bg-white transition">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-stone-200">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm font-bold text-rose-700">
            {user.name.charAt(0)}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-700 leading-tight">{user.name}</p>
            <p className="text-xs text-slate-400 leading-tight">
              {user.role === "admin" ? "管理者" : "スタッフ"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
