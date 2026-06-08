import { ReservationStatus, CustomerTag, StaffStatus } from "@/lib/types";

// ---------- 予約ステータスバッジ ----------
const reservationConfig: Record<
  ReservationStatus,
  { label: string; className: string }
> = {
  reserved: {
    label: "予約済み",
    className: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  },
  visited: {
    label: "来店済み",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  cancelled: {
    label: "キャンセル",
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  },
  no_show: {
    label: "無断キャンセル",
    className: "bg-red-50 text-red-700 ring-1 ring-red-200",
  },
};

export function ReservationStatusBadge({ status }: { status: ReservationStatus }) {
  const cfg = reservationConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ---------- 顧客タグバッジ ----------
const tagConfig: Record<CustomerTag, { label: string; className: string }> = {
  vip: {
    label: "VIP",
    className: "bg-stone-100 text-stone-700 ring-1 ring-stone-200",
  },
  new: {
    label: "新規",
    className: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  },
  repeater: {
    label: "リピーター",
    className: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  },
  caution: {
    label: "要注意",
    className: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  },
};

export function CustomerTagBadge({ tag }: { tag: CustomerTag }) {
  const cfg = tagConfig[tag];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ---------- スタッフステータスバッジ ----------
const staffConfig: Record<StaffStatus, { label: string; dot: string; className: string }> = {
  active: {
    label: "稼働中",
    dot: "bg-emerald-500",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  off: {
    label: "休み",
    dot: "bg-amber-400",
    className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  },
  resigned: {
    label: "退職",
    dot: "bg-slate-400",
    className: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  },
};

export function StaffStatusBadge({ status }: { status: StaffStatus }) {
  const cfg = staffConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
