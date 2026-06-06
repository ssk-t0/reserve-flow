import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReserveFlow - 予約管理システム",
  description:
    "サロン・クリニック・スクール・小規模店舗向けの予約・顧客・スタッフ管理システム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
