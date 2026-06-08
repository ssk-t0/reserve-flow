"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar, X } from "lucide-react";
import { ReservationStatusBadge } from "@/components/StatusBadge";
import { storage } from "@/lib/storage";
import { Reservation } from "@/lib/types";
import { formatMonthYear, isSameDay, formatDateTime, formatCurrency } from "@/lib/utils";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setReservations(storage.getReservations());
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const cells: (Date | null)[] = [];

    // 月の最初の曜日まで空白を入れる（日曜始まり）
    for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d));

    return cells;
  }, [year, month]);

  const getReservationsForDate = (date: Date) =>
    reservations.filter((r) => isSameDay(new Date(r.dateTime), date));

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    const t = new Date();
    setCurrentDate(new Date(t.getFullYear(), t.getMonth(), 1));
    setSelectedDate(t);
  };

  const today = new Date();
  const selectedDateRes = selectedDate ? getReservationsForDate(selectedDate).sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  ) : [];

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">カレンダー</h1>
          <p className="text-sm text-slate-500 mt-0.5">月間予約スケジュール</p>
        </div>
        <button
          onClick={goToday}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
        >
          今日
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* カレンダー本体 */}
        <div className="flex-1 bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
          {/* ナビゲーション */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold text-slate-800">
              {formatMonthYear(year, month)}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b border-slate-100">
            {WEEKDAYS.map((w, i) => (
              <div
                key={w}
                className={`py-2.5 text-center text-xs font-semibold ${
                  i === 0 ? "text-red-400" : i === 6 ? "text-emerald-600" : "text-slate-500"
                }`}
              >
                {w}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, idx) => {
              if (!date) {
                return <div key={`empty-${idx}`} className="min-h-[56px] sm:min-h-[100px] border-b border-r border-slate-50 bg-slate-50/30" />;
              }

              const dayRes = getReservationsForDate(date);
              const isToday = isSameDay(date, today);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const dayOfWeek = date.getDay();
              const isSun = dayOfWeek === 0;
              const isSat = dayOfWeek === 6;

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[56px] sm:min-h-[100px] p-1 sm:p-1.5 border-b border-r border-slate-50 cursor-pointer transition-all hover:bg-rose-50/30 ${
                    isSelected ? "bg-rose-50 ring-2 ring-inset ring-rose-300" : ""
                  }`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <span
                      className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-xs sm:text-sm font-medium ${
                        isToday
                          ? "bg-rose-500 text-white"
                          : isSun
                          ? "text-red-400"
                          : isSat
                          ? "text-emerald-600"
                          : "text-slate-700"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  {dayRes.length > 0 && (
                    <div className="space-y-0.5">
                      <div className="text-center">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold">
                          {dayRes.length}
                        </span>
                      </div>
                      {dayRes.slice(0, 1).map((r) => (
                        <div
                          key={r.id}
                          className="hidden sm:block text-xs text-slate-600 truncate bg-rose-50 px-1.5 py-0.5 rounded"
                        >
                          {new Date(r.dateTime).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })} {r.customerName}
                        </div>
                      ))}
                      {dayRes.length > 1 && (
                        <div className="hidden sm:block text-xs text-slate-400 text-center">
                          +{dayRes.length - 1}件
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 選択日の予約詳細 */}
        <div className="lg:w-80 bg-white rounded-lg border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-800">
                {selectedDate
                  ? selectedDate.toLocaleDateString("ja-JP", { month: "long", day: "numeric", weekday: "short" })
                  : "日付を選択"}
              </h3>
              {selectedDate && (
                <p className="text-xs text-slate-500 mt-0.5">{selectedDateRes.length}件の予約</p>
              )}
            </div>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {!selectedDate ? (
              <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center">
                <Calendar size={36} className="text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">カレンダーの日付をクリックすると、その日の予約が表示されます</p>
              </div>
            ) : selectedDateRes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <Calendar size={36} className="text-slate-200 mb-3" />
                <p className="text-sm text-slate-500 font-medium">予約なし</p>
                <p className="text-xs text-slate-400 mt-1">この日に予約はありません</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {selectedDateRes.map((r) => (
                  <div key={r.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-semibold text-slate-800">{r.customerName}</span>
                      <ReservationStatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-rose-600 font-medium mb-1">
                      {new Date(r.dateTime).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-xs text-slate-600">{r.serviceName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">{r.staffName}</span>
                      <span className="text-xs font-medium text-slate-700">{formatCurrency(r.amount)}</span>
                    </div>
                    {r.memo && (
                      <p className="text-xs text-slate-400 mt-1.5 bg-slate-50 px-2 py-1.5 rounded-lg">
                        {r.memo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
