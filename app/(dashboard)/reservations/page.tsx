"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, CalendarCheck, Filter } from "lucide-react";
import Modal from "@/components/Modal";
import SearchInput from "@/components/SearchInput";
import { ReservationStatusBadge } from "@/components/StatusBadge";
import ReservationForm from "@/components/ReservationForm";
import CsvExportButton from "@/components/CsvExportButton";
import { storage } from "@/lib/storage";
import { Reservation, ReservationStatus, RESERVATION_STATUS_LABELS } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "all">("all");
  const [staffFilter, setStaffFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Reservation | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Reservation | undefined>();

  useEffect(() => {
    setReservations(storage.getReservations());
  }, []);

  const staffNames = useMemo(
    () => Array.from(new Set(reservations.map((r) => r.staffName))).sort(),
    [reservations]
  );

  const filtered = useMemo(() => {
    return reservations
      .filter((r) => {
        const q = search.toLowerCase();
        if (q && !r.customerName.includes(search) && !r.serviceName.includes(search)) return false;
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (staffFilter && r.staffName !== staffFilter) return false;
        if (dateFilter) {
          const rDate = new Date(r.dateTime).toISOString().slice(0, 10);
          if (rDate !== dateFilter) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  }, [reservations, search, statusFilter, staffFilter, dateFilter]);

  const save = (res: Reservation) => {
    const all = storage.getReservations();
    const idx = all.findIndex((r) => r.id === res.id);
    const updated = idx >= 0 ? all.map((r) => (r.id === res.id ? res : r)) : [...all, res];
    storage.setReservations(updated);
    setReservations(updated);
    setShowModal(false);
    setEditTarget(undefined);
  };

  const remove = (id: string) => {
    const updated = storage.getReservations().filter((r) => r.id !== id);
    storage.setReservations(updated);
    setReservations(updated);
    setDeleteTarget(undefined);
  };

  const csvRows = filtered.map((r) => [
    r.id,
    formatDateTime(r.dateTime),
    r.customerName,
    r.staffName,
    r.serviceName,
    String(r.amount),
    RESERVATION_STATUS_LABELS[r.status],
    r.memo,
  ]);

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">予約管理</h1>
          <p className="text-sm text-slate-500 mt-0.5">全{reservations.length}件の予約を管理</p>
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowModal(true); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 transition shadow-sm sm:w-auto w-full"
        >
          <Plus size={16} />
          予約を追加
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          <Filter size={16} className="text-slate-400 flex-shrink-0" />
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="顧客名・サービス名で検索"
            className="w-full sm:w-56"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReservationStatus | "all")}
            className="w-full sm:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="all">すべてのステータス</option>
            {(Object.keys(RESERVATION_STATUS_LABELS) as ReservationStatus[]).map((s) => (
              <option key={s} value={s}>{RESERVATION_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
          >
            <option value="">すべてのスタッフ</option>
            {staffNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <div className="sm:ml-auto w-full sm:w-auto">
            <CsvExportButton
              filename="reservations.csv"
              headers={["予約ID", "日時", "顧客名", "担当スタッフ", "サービス", "金額", "ステータス", "メモ"]}
              rows={csvRows}
            />
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <CalendarCheck size={40} className="text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">予約が見つかりません</p>
            <p className="text-sm text-slate-400 mt-1">検索条件を変えてみてください</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">日時</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">顧客</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">スタッフ</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">サービス</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">金額</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">ステータス</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                      {formatDateTime(r.dateTime)}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{r.customerName}</td>
                    <td className="px-4 py-3.5 text-slate-600 hidden sm:table-cell">{r.staffName}</td>
                    <td className="px-4 py-3.5 text-slate-600 hidden md:table-cell">{r.serviceName}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-700 hidden md:table-cell">
                      {formatCurrency(r.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <ReservationStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditTarget(r); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          aria-label="編集"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          aria-label="削除"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* フッター */}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-50 text-xs text-slate-400 flex items-center justify-between">
            <span>{filtered.length}件表示</span>
            <span>
              合計：{formatCurrency(filtered.reduce((s, r) => s + r.amount, 0))}
            </span>
          </div>
        )}
      </div>

      {/* 作成・編集モーダル */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditTarget(undefined); }}
        title={editTarget ? "予約を編集" : "新規予約"}
        size="md"
      >
        <ReservationForm
          initial={editTarget}
          onSave={save}
          onCancel={() => { setShowModal(false); setEditTarget(undefined); }}
        />
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        title="予約を削除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{deleteTarget?.customerName}</span>
            の予約（{deleteTarget && formatDateTime(deleteTarget.dateTime)}）を削除しますか？
          </p>
          <p className="text-xs text-slate-400">この操作は取り消せません。</p>
          <div className="flex gap-3">
            <button
              onClick={() => deleteTarget && remove(deleteTarget.id)}
              className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
            >
              削除する
            </button>
            <button
              onClick={() => setDeleteTarget(undefined)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
            >
              キャンセル
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
