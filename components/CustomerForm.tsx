"use client";

import { useState } from "react";
import { Customer, CustomerTag } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface CustomerFormProps {
  initial?: Customer;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

const ALL_TAGS: { value: CustomerTag; label: string }[] = [
  { value: "vip", label: "VIP" },
  { value: "new", label: "新規" },
  { value: "repeater", label: "リピーター" },
  { value: "caution", label: "要注意" },
];

export default function CustomerForm({ initial, onSave, onCancel }: CustomerFormProps) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    tags: initial?.tags ?? ([] as CustomerTag[]),
    memo: initial?.memo ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleTag = (tag: CustomerTag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "氏名を入力してください";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "正しいメールアドレスを入力してください";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const customer: Customer = {
      id: initial?.id ?? generateId(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      visitCount: initial?.visitCount ?? 0,
      lastReservationDate: initial?.lastReservationDate ?? "",
      tags: form.tags,
      memo: form.memo,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    onSave(customer);
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
          placeholder="例：山田 太郎"
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* 電話番号 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">電話番号</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
          placeholder="例：080-1234-5678"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* メール */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">メールアドレス</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="例：yamada@example.com"
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? "border-red-400" : "border-slate-200"
          }`}
        />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
      </div>

      {/* タグ */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">顧客タグ</label>
        <div className="flex flex-wrap gap-2">
          {ALL_TAGS.map((tag) => {
            const selected = form.tags.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => toggleTag(tag.value)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                  selected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* メモ */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">メモ</label>
        <textarea
          value={form.memo}
          onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
          rows={3}
          placeholder="アレルギー情報や対応メモなど"
          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
        >
          {initial ? "変更を保存" : "顧客を登録"}
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
