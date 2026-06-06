"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, Info } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ReserveFlow</h1>
          <p className="mt-1.5 text-sm text-slate-400">予約・顧客・スタッフ管理システム</p>
        </div>

        {/* ログインカード */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-6">ログイン</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed mt-2"
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
        <div className="mt-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-blue-400 flex-shrink-0" />
            <span className="text-sm font-medium text-blue-300">デモアカウント</span>
          </div>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => fillDemo(account)}
                className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-300 mb-0.5">
                      {account.role === "admin" ? "👑 管理者" : "🧑‍💼 スタッフ"}
                    </p>
                    <p className="text-xs text-slate-400">{account.email}</p>
                    <p className="text-xs text-slate-500">パスワード: password</p>
                  </div>
                  <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition">
                    入力する →
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500 text-center">
            クリックでフォームに自動入力されます
          </p>
        </div>
      </div>
    </div>
  );
}
