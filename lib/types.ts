// ============================================================
// ReserveFlow - 型定義
// ============================================================

export type ReservationStatus = "reserved" | "visited" | "cancelled" | "no_show";
export type CustomerTag = "vip" | "new" | "repeater" | "caution";
export type StaffStatus = "active" | "off" | "resigned";
export type UserRole = "admin" | "staff";

export interface Reservation {
  id: string;
  dateTime: string; // ISO8601
  customerId: string;
  customerName: string;
  staffId: string;
  staffName: string;
  serviceName: string;
  amount: number;
  status: ReservationStatus;
  memo: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  visitCount: number;
  lastReservationDate: string;
  tags: CustomerTag[];
  memo: string;
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: StaffStatus;
  createdAt: string;
}

export interface Settings {
  storeName: string;
  openTime: string;
  closeTime: string;
  closedDays: string[];
  reservationUnit: number; // minutes
  cancellationDeadline: number; // hours
  notificationEmail: string;
}

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
}

export const SERVICES = [
  { name: "初回カウンセリング", amount: 5000 },
  { name: "スタンダードプラン", amount: 10000 },
  { name: "プレミアムプラン", amount: 20000 },
  { name: "オンライン相談", amount: 3000 },
  { name: "定期メンテナンス", amount: 8000 },
] as const;

export type ServiceName = (typeof SERVICES)[number]["name"];

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  reserved: "予約済み",
  visited: "来店済み",
  cancelled: "キャンセル",
  no_show: "無断キャンセル",
};

export const CUSTOMER_TAG_LABELS: Record<CustomerTag, string> = {
  vip: "VIP",
  new: "新規",
  repeater: "リピーター",
  caution: "要注意",
};

export const STAFF_STATUS_LABELS: Record<StaffStatus, string> = {
  active: "稼働中",
  off: "休み",
  resigned: "退職",
};
