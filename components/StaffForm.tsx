"use client";

import { useState } from "react";
import { Staff, StaffStatus } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface StaffFormProps {
  initial?: Staff;
  onSave: (staff: Staff) => void;
  onCancel: () => void;
}

export default function StaffForm({ initial, onSave, onCancel }: StaffFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    role: initial?.role ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    status: initial?.status ?? ("active" as StaffStatus),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "氏名を入力してください";
    if (!form.role.trim()) newErrors.role = "役職を入力してください";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "正しいメールアドレスを入力してください";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const staffMember: Staff = {
      id: initial?.id ?? generateId(),
      name: form.name.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: form.status,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSave(staffMember);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 氏名 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          氏名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="例：佐藤 美咲"
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 ${
            errors.name ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* 役職 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          役職 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          placeholder="例：アドバイザー、マネージャー"
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 ${
            errors.role ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
      </div>

      {/* メール */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">メールアドレス</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="例：sato@example.com"
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 ${
            errors.email ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* 電話番号 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">電話番号</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="例：090-1234-5678"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
        />
      </div>

      {/* ステータス */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">稼働ステータス</label>
        <select
          value={form.status}
          onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StaffStatus }))}
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300"
        >
          <option value="active">稼働中</option>
          <option value="off">休み</option>
          <option value="resigned">退職</option>
        </select>
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 bg-rose-500 text-white text-sm font-medium rounded-lg hover:bg-rose-600 transition"
        >
          {initial ? "変更を保存" : "スタッフを登録"}
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
