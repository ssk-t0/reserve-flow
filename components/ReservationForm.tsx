"use client";

import { useState } from "react";
import { Reservation, ReservationStatus, SERVICES } from "@/lib/types";
import { generateId, toDatetimeLocal } from "@/lib/utils";
import { storage } from "@/lib/storage";

interface ReservationFormProps {
  initial?: Reservation;
  onSave: (reservation: Reservation) => void;
  onCancel: () => void;
}

export default function ReservationForm({ initial, onSave, onCancel }: ReservationFormProps) {
  const customers = storage.getCustomers();
  const staff = storage.getStaff().filter((s) => s.status === "active");

  const [form, setForm] = useState({
    dateTime: initial ? toDatetimeLocal(initial.dateTime) : "",
    customerId: initial?.customerId ?? "",
    staffId: initial?.staffId ?? "",
    serviceName: initial?.serviceName ?? SERVICES[0].name,
    amount: initial?.amount ?? SERVICES[0].amount,
    status: initial?.status ?? ("reserved" as ReservationStatus),
    memo: initial?.memo ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleServiceChange = (name: string) => {
    const svc = SERVICES.find((s) => s.name === name);
    setForm((prev) => ({ ...prev, serviceName: name, amount: svc?.amount ?? prev.amount }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.dateTime) newErrors.dateTime = "予約日時を入力してください";
    if (!form.customerId) newErrors.customerId = "顧客を選択してください";
    if (!form.staffId) newErrors.staffId = "担当スタッフを選択してください";
    if (form.amount < 0) newErrors.amount = "金額は0以上で入力してください";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const customer = customers.find((c) => c.id === form.customerId);
    const staffMember = staff.find((s) => s.id === form.staffId);

    const reservation: Reservation = {
      id: initial?.id ?? generateId(),
      dateTime: new Date(form.dateTime).toISOString(),
      customerId: form.customerId,
      customerName: customer?.name ?? "",
      staffId: form.staffId,
      staffName: staffMember?.name ?? "",
      serviceName: form.serviceName,
      amount: Number(form.amount),
      status: form.status,
      memo: form.memo,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSave(reservation);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 日時 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          予約日時 <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={form.dateTime}
          onChange={(e) => setForm((p) => ({ ...p, dateTime: e.target.value }))}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.dateTime ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.dateTime && <p className="mt-1 text-xs text-red-500">{errors.dateTime}</p>}
      </div>

      {/* 顧客 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          顧客 <span className="text-red-500">*</span>
        </label>
        <select
          value={form.customerId}
          onChange={(e) => setForm((p) => ({ ...p, customerId: e.target.value }))}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.customerId ? "border-red-400" : "border-slate-200"
          }`}
        >
          <option value="">顧客を選択</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.customerId && <p className="mt-1 text-xs text-red-500">{errors.customerId}</p>}
      </div>

      {/* 担当スタッフ */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          担当スタッフ <span className="text-red-500">*</span>
        </label>
        <select
          value={form.staffId}
          onChange={(e) => setForm((p) => ({ ...p, staffId: e.target.value }))}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.staffId ? "border-red-400" : "border-slate-200"
          }`}
        >
          <option value="">スタッフを選択</option>
          {staff.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}（{s.role}）
            </option>
          ))}
        </select>
        {errors.staffId && <p className="mt-1 text-xs text-red-500">{errors.staffId}</p>}
      </div>

      {/* サービス */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">サービス</label>
        <select
          value={form.serviceName}
          onChange={(e) => handleServiceChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SERVICES.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}（¥{s.amount.toLocaleString()}）
            </option>
          ))}
        </select>
      </div>

      {/* 金額 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">金額（円）</label>
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
          min={0}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.amount ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
      </div>

      {/* ステータス */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">ステータス</label>
        <select
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ReservationStatus }))}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="reserved">予約済み</option>
          <option value="visited">来店済み</option>
          <option value="cancelled">キャンセル</option>
          <option value="no_show">無断キャンセル</option>
        </select>
      </div>

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">メモ</label>
        <textarea
          value={form.memo}
          onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
          rows={3}
          placeholder="対応メモや注意事項など"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          {initial ? "変更を保存" : "予約を作成"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
