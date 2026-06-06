"use client";

import { formatCurrency } from "@/lib/utils";

interface BarData {
  label: string;
  value: number;
  max: number;
}

// ---------- 月別売上棒グラフ ----------
export function MonthlySalesChart({ data }: { data: BarData[] }) {
  return (
    <div className="space-y-3">
      {data.map((item) => {
        const pct = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0;
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-12 shrink-0 text-right">{item.label}</span>
            <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-700 w-24 shrink-0 text-right">
              {formatCurrency(item.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- スタッフ別予約数グラフ ----------
export function StaffReservationChart({
  data,
}: {
  data: { name: string; count: number; max: number }[];
}) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = item.max > 0 ? Math.round((item.count / item.max) * 100) : 0;
        const colors = [
          "from-violet-500 to-violet-600",
          "from-blue-500 to-blue-600",
          "from-teal-500 to-teal-600",
          "from-emerald-500 to-emerald-600",
          "from-amber-500 to-amber-600",
        ];
        return (
          <div key={item.name} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-20 shrink-0 truncate">{item.name}</span>
            <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-700 w-12 shrink-0 text-right">
              {item.count}件
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- サービス別売上横棒グラフ ----------
export function ServiceSalesChart({
  data,
}: {
  data: { name: string; amount: number; count: number; max: number }[];
}) {
  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = item.max > 0 ? Math.round((item.amount / item.max) * 100) : 0;
        const colors = [
          "from-blue-500 to-indigo-600",
          "from-emerald-500 to-teal-600",
          "from-violet-500 to-purple-600",
          "from-amber-500 to-orange-600",
          "from-rose-500 to-pink-600",
        ];
        return (
          <div key={item.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">{item.name}</span>
              <span className="text-slate-500">
                {item.count}件 / {formatCurrency(item.amount)}
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- 空データ表示 ----------
export function EmptyState({
  icon,
  message,
  sub,
}: {
  icon?: React.ReactNode;
  message: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-slate-300">{icon}</div>}
      <p className="text-slate-500 font-medium">{message}</p>
      {sub && <p className="mt-1 text-sm text-slate-400">{sub}</p>}
    </div>
  );
}
