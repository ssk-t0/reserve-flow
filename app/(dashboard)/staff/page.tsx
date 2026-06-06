"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, UserCog, Mail, Phone } from "lucide-react";
import Modal from "@/components/Modal";
import SearchInput from "@/components/SearchInput";
import { StaffStatusBadge, ReservationStatusBadge } from "@/components/StatusBadge";
import StaffForm from "@/components/StaffForm";
import { storage } from "@/lib/storage";
import { Staff, StaffStatus } from "@/lib/types";
import { formatCurrency, formatDateTime, isSameMonth } from "@/lib/utils";

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StaffStatus | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Staff | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Staff | undefined>();
  const [detailStaff, setDetailStaff] = useState<Staff | undefined>();

  useEffect(() => {
    setStaff(storage.getStaff());
  }, []);

  const now = new Date();

  const getStaffStats = (staffId: string) => {
    const res = storage.getReservations().filter(
      (r) =>
        r.staffId === staffId &&
        isSameMonth(r.dateTime, now.getFullYear(), now.getMonth()) &&
        r.status !== "cancelled" &&
        r.status !== "no_show"
    );
    return {
      count: res.length,
      sales: res.reduce((s, r) => s + r.amount, 0),
    };
  };

  const filtered = useMemo(() => {
    return staff.filter((s) => {
      if (search && !s.name.includes(search) && !s.role.includes(search)) return false;
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      return true;
    });
  }, [staff, search, statusFilter]);

  const save = (s: Staff) => {
    const all = storage.getStaff();
    const idx = all.findIndex((x) => x.id === s.id);
    const updated = idx >= 0 ? all.map((x) => (x.id === s.id ? s : x)) : [...all, s];
    storage.setStaff(updated);
    setStaff(updated);
    setShowModal(false);
    setEditTarget(undefined);
  };

  const remove = (id: string) => {
    const updated = storage.getStaff().filter((s) => s.id !== id);
    storage.setStaff(updated);
    setStaff(updated);
    setDeleteTarget(undefined);
  };

  const detailReservations = detailStaff
    ? storage.getReservations()
        .filter((r) => r.staffId === detailStaff.id)
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
        .slice(0, 10)
    : [];

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">スタッフ管理</h1>
          <p className="text-sm text-slate-500 mt-0.5">全{staff.length}名のスタッフを管理</p>
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} />
          スタッフを追加
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="氏名・役職で検索"
            className="w-56"
          />
          <div className="flex gap-2">
            {(["all", "active", "off", "resigned"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  statusFilter === s
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s === "all" ? "すべて" : s === "active" ? "稼働中" : s === "off" ? "休み" : "退職"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* カードグリッド */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center py-16">
          <UserCog size={40} className="text-slate-200 mb-3" />
          <p className="text-slate-500 font-medium">スタッフが見つかりません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const stats = getStaffStats(s.id);
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-lg font-bold text-white">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.role}</p>
                      </div>
                    </div>
                    <StaffStatusBadge status={s.status} />
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail size={12} />
                      <span className="truncate">{s.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone size={12} />
                      <span>{s.phone || "—"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl mb-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-0.5">今月の予約</p>
                      <p className="text-lg font-bold text-slate-800">{stats.count}<span className="text-xs font-normal text-slate-500">件</span></p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-0.5">今月の売上</p>
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(stats.sales)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setDetailStaff(s)}
                      className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
                    >
                      予約一覧
                    </button>
                    <button
                      onClick={() => { setEditTarget(s); setShowModal(true); }}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      aria-label="編集"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      aria-label="削除"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 作成・編集モーダル */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditTarget(undefined); }}
        title={editTarget ? "スタッフ情報を編集" : "スタッフを登録"}
        size="md"
      >
        <StaffForm
          initial={editTarget}
          onSave={save}
          onCancel={() => { setShowModal(false); setEditTarget(undefined); }}
        />
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        title="スタッフを削除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{deleteTarget?.name}</span>
            を削除しますか？
          </p>
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

      {/* スタッフ詳細（予約一覧）モーダル */}
      <Modal
        isOpen={!!detailStaff}
        onClose={() => setDetailStaff(undefined)}
        title={`${detailStaff?.name} の予約一覧`}
        size="lg"
      >
        {detailStaff && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl text-center">
                <p className="text-xs text-blue-600 mb-0.5">今月の予約数</p>
                <p className="text-2xl font-bold text-blue-700">{getStaffStats(detailStaff.id).count}件</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-center">
                <p className="text-xs text-emerald-600 mb-0.5">今月の売上</p>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(getStaffStats(detailStaff.id).sales)}</p>
              </div>
            </div>

            {detailReservations.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-xl">予約データがありません</p>
            ) : (
              <div className="space-y-2">
                {detailReservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-slate-700">{r.customerName}</p>
                        <ReservationStatusBadge status={r.status} />
                      </div>
                      <p className="text-xs text-slate-500">{formatDateTime(r.dateTime)}　{r.serviceName}</p>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{formatCurrency(r.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
