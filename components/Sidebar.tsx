"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Users,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { AuthUser, UserRole } from "@/lib/types";
import { storage } from "@/lib/storage";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard, roles: ["admin", "staff"] },
  { href: "/reservations", label: "予約管理", icon: CalendarCheck, roles: ["admin", "staff"] },
  { href: "/calendar", label: "カレンダー", icon: Calendar, roles: ["admin", "staff"] },
  { href: "/customers", label: "顧客管理", icon: Users, roles: ["admin", "staff"] },
  { href: "/staff", label: "スタッフ管理", icon: UserCog, roles: ["admin"] },
  { href: "/reports", label: "売上レポート", icon: BarChart3, roles: ["admin"] },
  { href: "/settings", label: "設定", icon: Settings, roles: ["admin"] },
];

interface SidebarProps {
  user: AuthUser;
  onClose?: () => void;
}

export default function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    storage.setAuth(null);
    router.push("/login");
  };

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <aside className="flex flex-col h-full bg-slate-900 text-white">
      {/* ロゴ */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-xl">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight">ReserveFlow</span>
          <p className="text-xs text-slate-400 leading-tight">予約管理システム</p>
        </div>
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ユーザー情報 */}
      <div className="px-3 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">
              {user.role === "admin" ? "管理者" : "スタッフ"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <LogOut size={18} />
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
}
