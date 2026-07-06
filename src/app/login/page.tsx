"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] p-6">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-10 w-full max-w-sm shadow-[0_4px_24px_rgba(0,0,0,0.04)] animate-slide-up">
        <div className="text-[28px] font-bold text-[#1e3a5f] text-center mb-1 tracking-wider">ROCO</div>
        <p className="text-sm text-[#94a3b8] text-center mb-7">Roles de Congregación</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#475569] mb-1" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-white outline-none transition-colors focus:border-[#1e3a5f] focus:shadow-[0_0_0_3px_rgba(30,58,95,0.08)]"
              placeholder="admin@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#475569] mb-1" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-3.5 py-2.5 text-sm border border-[#e2e8f0] rounded-lg bg-white outline-none transition-colors focus:border-[#1e3a5f] focus:shadow-[0_0_0_3px_rgba(30,58,95,0.08)]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-sm font-medium bg-[#1e3a5f] text-white rounded-lg border border-[#1e3a5f] transition-colors hover:bg-[#152d4a] disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
