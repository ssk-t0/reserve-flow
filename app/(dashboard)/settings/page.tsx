"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, Settings, Clock, Ban, Timer, Mail, Store } from "lucide-react";
import { storage } from "@/lib/storage";
import { Settings as SettingsType } from "@/lib/types";

const DAYS = ["月", "火", "水", "木", "金", "土", "日"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    storage.setSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleDay = (day: string) => {
    if (!settings) return;
    setSettings((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        closedDays: prev.closedDays.includes(day)
          ? prev.closedDays.filter((d) => d !== day)
          : [...prev.closedDays, day],
      };
    });
  };

  if (!settings) return null;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">設定</h1>
        <p className="text-sm text-slate-500 mt-0.5">店舗情報と予約ルールを設定します</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* 店舗情報 */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <Store size={18} className="text-rose-600" />
            <h2 className="font-semibold text-slate-800">店舗情報</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">店舗名</label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings((p) => p && { ...p, storeName: e.target.value })}
                placeholder="例：ReserveFlow サンプル店"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">通知メールアドレス</label>
              <input
                type="email"
                value={settings.notificationEmail}
                onChange={(e) => setSettings((p) => p && { ...p, notificationEmail: e.target.value })}
                placeholder="例：admin@example.com"
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>
        </div>

        {/* 営業時間 */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <Clock size={18} className="text-rose-600" />
            <h2 className="font-semibold text-slate-800">営業時間</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">開始時間</label>
                <input
                  type="time"
                  value={settings.openTime}
                  onChange={(e) => setSettings((p) => p && { ...p, openTime: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">終了時間</label>
                <input
                  type="time"
                  value={settings.closeTime}
                  onChange={(e) => setSettings((p) => p && { ...p, closeTime: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 定休日 */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <Ban size={18} className="text-rose-600" />
            <h2 className="font-semibold text-slate-800">定休日</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-11 h-11 rounded-lg text-sm font-medium transition-all ${
                    settings.closedDays.includes(day)
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              赤くなっている曜日が定休日です。クリックで切り替えできます。
            </p>
          </div>
        </div>

        {/* 予約設定 */}
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <Timer size={18} className="text-rose-600" />
            <h2 className="font-semibold text-slate-800">予約設定</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                予約受付単位（分）
              </label>
              <select
                value={settings.reservationUnit}
                onChange={(e) =>
                  setSettings((p) => p && { ...p, reservationUnit: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                {[15, 30, 60, 90, 120].map((n) => (
                  <option key={n} value={n}>
                    {n}分
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                キャンセル期限（時間前）
              </label>
              <select
                value={settings.cancellationDeadline}
                onChange={(e) =>
                  setSettings((p) => p && { ...p, cancellationDeadline: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
              >
                {[12, 24, 48, 72].map((n) => (
                  <option key={n} value={n}>
                    {n}時間前
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 transition shadow-sm sm:w-auto w-full"
          >
            <Save size={16} />
            設定を保存
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <CheckCircle size={16} />
              保存しました
            </div>
          )}
        </div>
      </form>

      {/* 注意書き */}
      <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Settings size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">デモ環境について</p>
            <p className="text-xs text-amber-600 mt-0.5">
              この設定はブラウザのlocalStorageに保存されます。実務環境ではデータベースと連携し、複数スタッフへのリアルタイム反映が可能です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
