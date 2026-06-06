// ============================================================
// ReserveFlow - localStorage ユーティリティ
// ============================================================

import { Reservation, Customer, Staff, Settings, AuthUser } from "./types";
import { generateSampleData } from "./sampleData";

const KEYS = {
  RESERVATIONS: "rf_reservations",
  CUSTOMERS: "rf_customers",
  STAFF: "rf_staff",
  SETTINGS: "rf_settings",
  AUTH: "rf_auth",
  INITIALIZED: "rf_initialized",
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storageが満杯の場合は無視
  }
}

const DEFAULT_SETTINGS: Settings = {
  storeName: "ReserveFlow サンプル店",
  openTime: "09:00",
  closeTime: "20:00",
  closedDays: ["日"],
  reservationUnit: 60,
  cancellationDeadline: 24,
  notificationEmail: "admin@example.com",
};

export const storage = {
  // ---------- Reservation ----------
  getReservations: (): Reservation[] => safeGet<Reservation[]>(KEYS.RESERVATIONS, []),
  setReservations: (data: Reservation[]): void => safeSet(KEYS.RESERVATIONS, data),

  // ---------- Customer ----------
  getCustomers: (): Customer[] => safeGet<Customer[]>(KEYS.CUSTOMERS, []),
  setCustomers: (data: Customer[]): void => safeSet(KEYS.CUSTOMERS, data),

  // ---------- Staff ----------
  getStaff: (): Staff[] => safeGet<Staff[]>(KEYS.STAFF, []),
  setStaff: (data: Staff[]): void => safeSet(KEYS.STAFF, data),

  // ---------- Settings ----------
  getSettings: (): Settings => safeGet<Settings>(KEYS.SETTINGS, DEFAULT_SETTINGS),
  setSettings: (data: Settings): void => safeSet(KEYS.SETTINGS, data),

  // ---------- Auth ----------
  getAuth: (): AuthUser | null => safeGet<AuthUser | null>(KEYS.AUTH, null),
  setAuth: (user: AuthUser | null): void => safeSet(KEYS.AUTH, user),

  // ---------- 初期化 ----------
  isInitialized: (): boolean => safeGet<boolean>(KEYS.INITIALIZED, false),

  initializeSampleData: (): void => {
    if (safeGet<boolean>(KEYS.INITIALIZED, false)) return;
    const { reservations, customers, staff, settings } = generateSampleData();
    safeSet(KEYS.RESERVATIONS, reservations);
    safeSet(KEYS.CUSTOMERS, customers);
    safeSet(KEYS.STAFF, staff);
    safeSet(KEYS.SETTINGS, settings);
    safeSet(KEYS.INITIALIZED, true);
  },

  // ---------- リセット（開発用） ----------
  reset: (): void => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
