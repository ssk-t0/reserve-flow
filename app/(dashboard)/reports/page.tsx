"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import CsvExportButton from "@/components/CsvExportButton";
import { MonthlySalesChart, StaffReservationChart, ServiceSalesChart } from "@/components/DashboardCharts";
import { storage } from "@/lib/storage";
import { Reservation, SERVICES } from "@/lib/types";
import { formatCurrency, isSameMonth, formatMonthYear } from "@/lib/utils";

interface MonthOption {
  year: number;
  month: number;
  label: string;
}

export default function ReportsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    setReservations(storage.getReservations());
  }, []);

  // 選択月のデータ
  const monthRes = useMemo(
    () =>
      reservations.filter(
        (r) => isSameMonth(r.dateTime, selectedYear, selectedMonth) && r.status === "visited"
      ),
    [reservations, selectedYear, selectedMonth]
  );

  // 前月データ
  const prevMonth = selectedMonth === 0
    ? { year: selectedYear - 1, month: 11 }
    : { year: selectedYear, month: selectedMonth - 1 };
  const prevMonthRes = useMemo(
    () =>
      reservations.filter(
        (r) =>
          isSameMonth(r.dateTime, prevMonth.year, prevMonth.month) && r.status === "visited"
      ),
    [reservations, prevMonth.year, prevMonth.month]
  );

  const thisTotal = monthRes.reduce((s, r) => s + r.amount, 0);
  const prevTotal = prevMonthRes.reduce((s, r) => s + r.amount, 0);
  const growthRate = prevTotal > 0 ? ((thisTotal / prevTotal - 1) * 100).toFixed(1) : null;
  const avgAmount = monthRes.length > 0 ? Math.round(thisTotal / monthRes.length) : 0;

  // キャンセル率（選択月の全予約）
  const allMonthRes = reservations.filter(
    (r) => isSameMonth(r.dateTime, selectedYear, selectedMonth)
  );
  const cancelCount = allMonthRes.filter(
    (r) => r.status === "cancelled" || r.status === "no_show"
  ).length;
  const cancelRate =
    allMonthRes.length > 0 ? ((cancelCount / allMonthRes.length) * 100).toFixed(1) : "0.0";

  // 月別売上（直近6ヶ月）
  const monthlySalesData = useMemo(() => {
    const now = new Date();
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = reservations
        .filter((r) => isSameMonth(r.dateTime, d.getFullYear(), d.getMonth()) && r.status === "visited")
        .reduce((s, r) => s + r.amount, 0);
      data.push({ label: `${d.getMonth() + 1}月`, value: val, max: 0 });
    }
    const max = Math.max(...data.map((d) => d.value), 1);
    return data.map((d) => ({ ...d, max }));
  }, [reservations]);

  // スタッフ別売上
  const staffSalesData = useMemo(() => {
    const map: Record<string, { name: string; count: number }> = {};
    monthRes.forEach((r) => {
      if (!map[r.staffId]) map[r.staffId] = { name: r.staffName, count: 0 };
      map[r.staffId].count++;
    });
    const arr = Object.values(map).sort((a, b) => b.count - a.count);
    const max = Math.max(...arr.map((s) => s.count), 1);
    return arr.map((s) => ({ ...s, max }));
  }, [monthRes]);

  // サービス別売上
  const serviceSalesData = useMemo(() => {
    const map: Record<string, { name: string; amount: number; count: number }> = {};
    monthRes.forEach((r) => {
      if (!map[r.serviceName]) map[r.serviceName] = { name: r.serviceName, amount: 0, count: 0 };
      map[r.serviceName].amount += r.amount;
      map[r.serviceName].count++;
    });
    const arr = Object.values(map).sort((a, b) => b.amount - a.amount);
    const max = Math.max(...arr.map((s) => s.amount), 1);
    return arr.map((s) => ({ ...s, max }));
  }, [monthRes]);

  // CSV行
  const csvRows = monthRes.map((r) => [
    r.id,
    new Date(r.dateTime).toLocaleDateString("ja-JP"),
    r.customerName,
    r.staffName,
    r.serviceName,
    String(r.amount),
  ]);

  // 月選択オプション（直近12ヶ月）
  const monthOptions: MonthOption[] = useMemo(() => {
    const now = new Date();
    const opts: MonthOption[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      opts.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: formatMonthYear(d.getFullYear(), d.getMonth()),
      });
    }
    return opts;
  }, []);

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">売上レポート</h1>
          <p className="text-sm text-slate-500 mt-0.5">売上・予約の集計と分析</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={`${selectedYear}-${selectedMonth}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-").map(Number);
              setSelectedYear(y);
              setSelectedMonth(m);
            }}
            className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {monthOptions.map((o) => (
              <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>
                {o.label}
              </option>
            ))}
          </select>
          <CsvExportButton
            filename={`sales-${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}.csv`}
            headers={["予約ID", "日付", "顧客名", "スタッフ", "サービス", "金額"]}
            rows={csvRows}
            disabled={csvRows.length === 0}
          />
        </div>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">今月の売上</p>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(thisTotal)}</p>
          {growthRate !== null && (
            <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${Number(growthRate) >= 0 ? "text-emerald-600" : "text-red-500"}`}>
              {Number(growthRate) >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              前月比 {growthRate}%
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">来店数</p>
          <p className="text-2xl font-bold text-slate-800">{monthRes.length}件</p>
          <p className="text-xs text-slate-400 mt-1">前月：{prevMonthRes.length}件</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">予約単価</p>
          <p className="text-2xl font-bold text-slate-800">{formatCurrency(avgAmount)}</p>
          <p className="text-xs text-slate-400 mt-1">1件あたり</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500 mb-1">キャンセル率</p>
          <p className="text-2xl font-bold text-slate-800">{cancelRate}%</p>
          <p className="text-xs text-slate-400 mt-1">{cancelCount}件 / {allMonthRes.length}件</p>
        </div>
      </div>

      {/* グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 月別売上 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-blue-600" />
            <h2 className="font-semibold text-slate-800">月別売上推移（直近6ヶ月）</h2>
          </div>
          {monthlySalesData.every((d) => d.value === 0) ? (
            <p className="text-sm text-slate-400 text-center py-8">売上データがありません</p>
          ) : (
            <MonthlySalesChart data={monthlySalesData} />
          )}
        </div>

        {/* スタッフ別売上ランキング */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-violet-600" />
            <h2 className="font-semibold text-slate-800">スタッフ別売上ランキング</h2>
          </div>
          {staffSalesData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">データがありません</p>
          ) : (
            <div className="space-y-3">
              {staffSalesData.map((s, i) => {
                const sales = monthRes
                  .filter((r) => r.staffName === s.name)
                  .reduce((sum, r) => sum + r.amount, 0);
                const pct = Math.max(...staffSalesData.map((x) => {
                  return monthRes.filter((r) => r.staffName === x.name).reduce((sum, r) => sum + r.amount, 0);
                }));
                return (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                      i === 0 ? "bg-amber-400 text-white" : i === 1 ? "bg-slate-300 text-white" : "bg-orange-300 text-white"
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-600 w-20 truncate shrink-0">{s.name}</span>
                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                        style={{ width: `${pct > 0 ? (sales / pct) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-700 w-24 text-right shrink-0">
                      {formatCurrency(sales)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* サービス別売上 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={18} className="text-emerald-600" />
          <h2 className="font-semibold text-slate-800">サービス別売上</h2>
        </div>
        {serviceSalesData.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400">売上データがありません</p>
            <p className="text-xs text-slate-300 mt-1">月を変えて確認してみてください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ServiceSalesChart data={serviceSalesData} />
            {/* サービス別売上テーブル */}
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500">サービス</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-slate-500">件数</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500">売上</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {SERVICES.map((svc) => {
                    const found = serviceSalesData.find((s) => s.name === svc.name);
                    return (
                      <tr key={svc.name} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-slate-700">{svc.name}</td>
                        <td className="px-3 py-3 text-center text-slate-600">{found?.count ?? 0}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700">
                          {formatCurrency(found?.amount ?? 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t border-slate-100 bg-slate-50">
                  <tr>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-600">合計</td>
                    <td className="px-3 py-3 text-center text-xs font-semibold text-slate-600">{monthRes.length}</td>
                    <td className="px-4 py-3 text-right text-xs font-bold text-slate-800">{formatCurrency(thisTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
