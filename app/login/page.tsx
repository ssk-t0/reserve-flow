"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck2, Eye, EyeOff, Info } from "lucide-react";
import { storage } from "@/lib/storage";
import { AuthUser } from "@/lib/types";

const DEMO_ACCOUNTS = [
  { email: "admin@example.com", password: "password", role: "admin" as const, name: "管理者" },
  { email: "staff@example.com", password: "password", role: "staff" as const, name: "スタッフ（佐藤 美咲）" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 初回起動時にサンプルデータを投入
    storage.initializeSampleData();
    // 既にログイン済みなら遷移
    const user = storage.getAuth();
    if (user) router.replace("/");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const account = DEMO_ACCOUNTS.find(
      (a) => a.email === email && a.password === password
    );

    if (!account) {
      setError("メールアドレスまたはパスワードが正しくありません");
      setLoading(false);
      return;
    }

    const user: AuthUser = { email: account.email, role: account.role, name: account.name };
    storage.setAuth(user);
    router.replace("/");
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-lg mb-4 text-rose-700 ring-1 ring-rose-200">
            <CalendarCheck2 size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ReserveFlow</h1>
          <p className="mt-1.5 text-sm text-stone-500">予約・顧客・スタッフをすっきり管理</p>
        </div>

        {/* ログインカード */}
        <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">ログイン</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-slate-800 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                  className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-slate-800 placeholder:text-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ログイン中...
                </span>
              ) : (
                "ログイン"
              )}
            </button>
          </form>
        </div>

        {/* デモアカウント情報 */}
        <div className="mt-4 bg-white border border-stone-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-rose-500 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-700">デモアカウント</span>
          </div>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => fillDemo(account)}
                className="w-full text-left p-3 rounded-lg bg-stone-50 hover:bg-rose-50 border border-stone-100 hover:border-rose-100 transition group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-0.5">
                      {account.role === "admin" ? "管理者" : "スタッフ"}
                    </p>
                    <p className="text-xs text-stone-500">{account.email}</p>
                    <p className="text-xs text-stone-400">パスワード: password</p>
                  </div>
                  <span className="text-xs text-rose-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
                    入力する
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-stone-400 text-center">
            クリックでフォームに自動入力されます
          </p>
        </div>
      </div>
    </div>
  );
}
