"use client";

import { useState, useEffect } from "react";
import { CalendarCheck, Users, UserCheck, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import StatCard from "@/components/StatCard";
import { ReservationStatusBadge } from "@/components/StatusBadge";
import { MonthlySalesChart, StaffReservationChart } from "@/components/DashboardCharts";
import { storage } from "@/lib/storage";
import { Reservation } from "@/lib/types";
import { formatCurrency, formatDateTime, isToday, isSameMonth, formatMonthYear } from "@/lib/utils";

interface MonthlySalesData {
  label: string;
  value: number;
  max: number;
}

interface StaffData {
  name: string;
  count: number;
  max: number;
}

export default function DashboardPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [activeStaffCount, setActiveStaffCount] = useState(0);
  const [monthlySalesData, setMonthlySalesData] = useState<MonthlySalesData[]>([]);
  const [staffData, setStaffData] = useState<StaffData[]>([]);

  useEffect(() => {
    const res = storage.getReservations();
    const customers = storage.getCustomers();
    const staff = storage.getStaff();

    setReservations(res);
    setCustomerCount(customers.length);
    setActiveStaffCount(staff.filter((s) => s.status === "active").length);

    // 月別売上（直近6ヶ月）
    const now = new Date();
    const monthlyData: MonthlySalesData[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthRes = res.filter(
        (r) =>
          isSameMonth(r.dateTime, d.getFullYear(), d.getMonth()) && r.status === "visited"
      );
      const total = monthRes.reduce((s, r) => s + r.amount, 0);
      monthlyData.push({
        label: `${d.getMonth() + 1}月`,
        value: total,
        max: 0,
      });
    }
    const maxSales = Math.max(...monthlyData.map((d) => d.value), 1);
    setMonthlySalesData(monthlyData.map((d) => ({ ...d, max: maxSales })));

    // スタッフ別予約数（今月）
    const staffCounts: Record<string, { name: string; count: number }> = {};
    res
      .filter(
        (r) =>
          isSameMonth(r.dateTime, now.getFullYear(), now.getMonth()) &&
          r.status !== "cancelled" &&
          r.status !== "no_show"
      )
      .forEach((r) => {
        if (!staffCounts[r.staffId]) staffCounts[r.staffId] = { name: r.staffName, count: 0 };
        staffCounts[r.staffId].count++;
      });
    const staffArr = Object.values(staffCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const maxCount = Math.max(...staffArr.map((s) => s.count), 1);
    setStaffData(staffArr.map((s) => ({ ...s, max: maxCount })));
  }, []);

  const now = new Date();
  const todayRes = reservations.filter((r) => isToday(r.dateTime));
  const upcomingRes = reservations
    .filter((r) => new Date(r.dateTime) > now && r.status === "reserved")
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 5);

  const thisMonthSales = reservations
    .filter((r) => isSameMonth(r.dateTime, now.getFullYear(), now.getMonth()) && r.status === "visited")
    .reduce((s, r) => s + r.amount, 0);

  const lastMonthSales = reservations
    .filter((r) => {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return isSameMonth(r.dateTime, lm.getFullYear(), lm.getMonth()) && r.status === "visited";
    })
    .reduce((s, r) => s + r.amount, 0);

  const salesGrowth =
    lastMonthSales > 0
      ? `前月比 ${((thisMonthSales / lastMonthSales - 1) * 100).toFixed(1)}%`
      : "前月比 —";
  const salesUp = thisMonthSales >= lastMonthSales;

  return (
    <div className="space-y-6 max-w-screen-xl mx-auto">
      {/* ページヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">ダッシュボード</h1>
            <p className="text-blue-100 text-sm mt-1">
              {now.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/reservations"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition"
            >
              <CalendarCheck size={16} />
              予約を確認
            </Link>
          </div>
        </div>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="本日の予約数"
          value={`${todayRes.length}件`}
          sub={`来店済み ${todayRes.filter((r) => r.status === "visited").length}件`}
          icon={CalendarCheck}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title={`今月の売上（${formatMonthYear(now.getFullYear(), now.getMonth())}）`}
          value={formatCurrency(thisMonthSales)}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          trend={{ value: salesGrowth, up: salesUp }}
        />
        <StatCard
          title="登録顧客数"
          value={`${customerCount}名`}
          icon={Users}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
        />
        <StatCard
          title="稼働スタッフ数"
          value={`${activeStaffCount}名`}
          icon={UserCheck}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* 本日の予約 + 直近予約 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 本日の予約一覧 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-800">本日の予約</h2>
            <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full">
              {todayRes.length}件
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {todayRes.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarCheck size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">本日の予約はありません</p>
              </div>
            ) : (
              todayRes
                .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                .map((r) => (
                  <div key={r.id} className="px-6 py-3.5 hover:bg-slate-50/50 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800">{r.customerName}</span>
                          <ReservationStatusBadge status={r.status} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {new Date(r.dateTime).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                          　{r.serviceName}　{r.staffName}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-slate-700 shrink-0">
                        {formatCurrency(r.amount)}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* 直近の予約 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-800">直近の予約</h2>
            <Link
              href="/reservations"
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              すべて見る <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingRes.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarCheck size={32} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">直近の予約はありません</p>
              </div>
            ) : (
              upcomingRes.map((r) => (
                <div key={r.id} className="px-6 py-3.5 hover:bg-slate-50/50 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{r.customerName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDateTime(r.dateTime)}　{r.serviceName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500">{r.staffName}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* グラフ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 月別売上 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-5">月別売上（直近6ヶ月）</h2>
          {monthlySalesData.length > 0 ? (
            <MonthlySalesChart data={monthlySalesData} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">データがありません</p>
          )}
        </div>

        {/* スタッフ別予約数 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="font-semibold text-slate-800 mb-5">スタッフ別予約数（今月）</h2>
          {staffData.length > 0 ? (
            <StaffReservationChart data={staffData} />
          ) : (
            <p className="text-sm text-slate-400 text-center py-8">データがありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
