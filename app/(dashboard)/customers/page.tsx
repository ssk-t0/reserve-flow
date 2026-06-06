"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Users, ChevronRight, X, Phone, Mail, FileText } from "lucide-react";
import Modal from "@/components/Modal";
import SearchInput from "@/components/SearchInput";
import { CustomerTagBadge, ReservationStatusBadge } from "@/components/StatusBadge";
import CustomerForm from "@/components/CustomerForm";
import { storage } from "@/lib/storage";
import { Customer, CustomerTag, CUSTOMER_TAG_LABELS } from "@/lib/types";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<CustomerTag | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<Customer | undefined>();
  const [detailCustomer, setDetailCustomer] = useState<Customer | undefined>();

  useEffect(() => {
    setCustomers(storage.getCustomers());
  }, []);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (search && !c.name.includes(search) && !c.email.includes(search) && !c.phone.includes(search))
        return false;
      if (tagFilter !== "all" && !c.tags.includes(tagFilter)) return false;
      return true;
    });
  }, [customers, search, tagFilter]);

  const save = (customer: Customer) => {
    const all = storage.getCustomers();
    const idx = all.findIndex((c) => c.id === customer.id);
    const updated = idx >= 0 ? all.map((c) => (c.id === customer.id ? customer : c)) : [...all, customer];
    storage.setCustomers(updated);
    setCustomers(updated);
    setShowModal(false);
    setEditTarget(undefined);
  };

  const remove = (id: string) => {
    const updated = storage.getCustomers().filter((c) => c.id !== id);
    storage.setCustomers(updated);
    setCustomers(updated);
    setDeleteTarget(undefined);
  };

  const detailReservations = detailCustomer
    ? storage.getReservations()
        .filter((r) => r.customerId === detailCustomer.id)
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    : [];

  return (
    <div className="space-y-5 max-w-screen-xl mx-auto">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">顧客管理</h1>
          <p className="text-sm text-slate-500 mt-0.5">全{customers.length}名の顧客を管理</p>
        </div>
        <button
          onClick={() => { setEditTarget(undefined); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={16} />
          顧客を追加
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="氏名・メール・電話番号で検索"
            className="w-64"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTagFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                tagFilter === "all"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              すべて
            </button>
            {(Object.keys(CUSTOMER_TAG_LABELS) as CustomerTag[]).map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                  tagFilter === tag
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {CUSTOMER_TAG_LABELS[tag]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users size={40} className="text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">顧客が見つかりません</p>
            <p className="text-sm text-slate-400 mt-1">検索条件を変えてみてください</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">顧客</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">連絡先</th>
                  <th className="text-center px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">来店回数</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">最終予約日</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">タグ</th>
                  <th className="text-right px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{c.name}</p>
                          <p className="text-xs text-slate-400 sm:hidden">{c.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <p className="text-slate-600">{c.phone}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden md:table-cell">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold">
                        {c.visitCount}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 hidden lg:table-cell">
                      {c.lastReservationDate ? formatDate(c.lastReservationDate) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((t) => <CustomerTagBadge key={t} tag={t} />)}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailCustomer(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition opacity-0 group-hover:opacity-100"
                          aria-label="詳細"
                        >
                          <ChevronRight size={15} />
                        </button>
                        <button
                          onClick={() => { setEditTarget(c); setShowModal(true); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition opacity-0 group-hover:opacity-100"
                          aria-label="編集"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
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
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-50 text-xs text-slate-400">
            {filtered.length}件表示
          </div>
        )}
      </div>

      {/* 作成・編集モーダル */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditTarget(undefined); }}
        title={editTarget ? "顧客情報を編集" : "顧客を登録"}
        size="md"
      >
        <CustomerForm
          initial={editTarget}
          onSave={save}
          onCancel={() => { setShowModal(false); setEditTarget(undefined); }}
        />
      </Modal>

      {/* 削除確認モーダル */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(undefined)}
        title="顧客を削除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{deleteTarget?.name}</span>
            を削除しますか？関連する予約データは残ります。
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

      {/* 顧客詳細モーダル */}
      <Modal
        isOpen={!!detailCustomer}
        onClose={() => setDetailCustomer(undefined)}
        title="顧客詳細"
        size="lg"
      >
        {detailCustomer && (
          <div className="space-y-5">
            {/* プロフィール */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                {detailCustomer.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-slate-800">{detailCustomer.name}</h3>
                  {detailCustomer.tags.map((t) => <CustomerTagBadge key={t} tag={t} />)}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  来店回数：<span className="font-semibold text-slate-700">{detailCustomer.visitCount}回</span>
                  　最終来店：{detailCustomer.lastReservationDate ? formatDate(detailCustomer.lastReservationDate) : "—"}
                </p>
              </div>
            </div>

            {/* 連絡先 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                <Phone size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">電話番号</p>
                  <p className="text-sm font-medium text-slate-700">{detailCustomer.phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl">
                <Mail size={16} className="text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">メール</p>
                  <p className="text-sm font-medium text-slate-700 truncate">{detailCustomer.email || "—"}</p>
                </div>
              </div>
            </div>

            {/* メモ */}
            {detailCustomer.memo && (
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <FileText size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{detailCustomer.memo}</p>
              </div>
            )}

            {/* 予約履歴 */}
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                予約履歴（{detailReservations.length}件）
              </h4>
              {detailReservations.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6 bg-slate-50 rounded-xl">予約履歴がありません</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {detailReservations.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium text-slate-700">{r.serviceName}</p>
                          <ReservationStatusBadge status={r.status} />
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(r.dateTime).toLocaleDateString("ja-JP")}　{r.staffName}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        {formatCurrency(r.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setDetailCustomer(undefined);
                  setEditTarget(detailCustomer);
                  setShowModal(true);
                }}
                className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                編集する
              </button>
              <button
                onClick={() => setDetailCustomer(undefined)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
