"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { GrupoAseoType, EncargadoAVType } from "@/types";
import { formatDate, getMonday, addDays } from "@/lib/dates";

type Tab = "grupos" | "av" | "pausa";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [grupos, setGrupos] = useState<GrupoAseoType[]>([]);
  const [encargados, setEncargados] = useState<EncargadoAVType[]>([]);
  const [tab, setTab] = useState<Tab>("grupos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const me = await fetch("/api/auth/me");
      if (!me.ok) { router.push("/login"); return; }
      const meData = await me.json();
      setUser({ name: meData.user.email.split("@")[0] });
      await loadData();
      setLoading(false);
    }
    init();
  }, [router]);

  async function loadData() {
    const [g, e] = await Promise.all([
      fetch("/api/grupos-aseo").then((r) => r.json()),
      fetch("/api/encargados-av").then((r) => r.json()),
    ]);
    setGrupos(g);
    setEncargados(e);
  }

  async function saveGrupo(id: string, data: Partial<GrupoAseoType>) {
    await fetch("/api/grupos-aseo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    await loadData();
  }

  async function addGrupo() {
    await fetch("/api/grupos-aseo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    await loadData();
    await regenerate();
  }

  async function deleteGrupo(id: string) {
    if (!confirm("¿Eliminar este grupo? (borrado lógico)")) return;
    await fetch(`/api/grupos-aseo?id=${id}`, { method: "DELETE" });
    await loadData();
    await regenerate();
  }

  async function saveEncargado(id: string, data: Partial<EncargadoAVType>) {
    await fetch("/api/encargados-av", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    await loadData();
  }

  async function addEncargado() {
    await fetch("/api/encargados-av", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    await loadData();
    await regenerate();
  }

  async function deleteEncargado(id: string) {
    if (!confirm("¿Eliminar este encargado? (borrado lógico)")) return;
    await fetch(`/api/encargados-av?id=${id}`, { method: "DELETE" });
    await loadData();
    await regenerate();
  }

  async function regenerate() {
    await fetch("/api/rotacion/completar", { method: "POST" });
    await fetch("/api/rotacion");
  }

  async function togglePausa(weekStart: string, paused: boolean) {
    await fetch("/api/rotacion/pausa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart, paused }),
    });
    await regenerate();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
        <div className="text-sm text-[#94a3b8]">Cargando...</div>
      </div>
    );
  }

  const monday = getMonday(new Date());
  const pausaWeeks: { start: string; label: string }[] = [];
  for (let i = -8; i <= 16; i++) {
    const d = addDays(monday, i * 7);
    const fmt = formatDate(d);
    const label = `Semana del ${d.toLocaleDateString("es", { day: "numeric", month: "short" })}`;
    pausaWeeks.push({ start: fmt, label });
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Header userName={user?.name || ""} />
      <main className="max-w-[960px] mx-auto px-6 py-8">
        <div className="flex gap-0 border-b border-[#e2e8f0] mb-6">
          {(["grupos", "av", "pausa"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-sm font-medium px-5 py-2.5 bg-none border-none border-b-2 transition-colors ${
                tab === t ? "text-[#1e3a5f] border-[#1e3a5f]" : "text-[#94a3b8] border-transparent hover:text-[#64748b]"
              }`}
            >
              {t === "grupos" ? "Grupos de Aseo" : t === "av" ? "Audio y Video" : "Pausa por Asamblea"}
            </button>
          ))}
        </div>

        {tab === "grupos" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1e293b]">Grupos de Aseo</h2>
              <button onClick={addGrupo} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-[#1e3a5f] text-white border border-[#1e3a5f] transition-colors hover:bg-[#152d4a]">
                + Nuevo Grupo
              </button>
            </div>
            {grupos.length === 0 ? (
              <p className="text-sm text-[#94a3b8]">No hay grupos registrados.</p>
            ) : (
              <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-[12px] font-semibold uppercase tracking-wider text-[#94a3b8] px-3 py-2 border-b border-[#e2e8f0]">Orden</th>
                      <th className="text-left text-[12px] font-semibold uppercase tracking-wider text-[#94a3b8] px-3 py-2 border-b border-[#e2e8f0]">Nombre</th>
                      <th className="text-left text-[12px] font-semibold uppercase tracking-wider text-[#94a3b8] px-3 py-2 border-b border-[#e2e8f0]">Activo</th>
                      <th className="text-left text-[12px] font-semibold uppercase tracking-wider text-[#94a3b8] px-3 py-2 border-b border-[#e2e8f0]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupos.map((g) => (
                      <tr key={g.id}>
                        <td className="text-sm px-3 py-2.5 border-b border-[#f1f5f9]">{g.orden}</td>
                        <td className="text-sm px-3 py-2.5 border-b border-[#f1f5f9]">
                          <input
                            className="border border-[#e2e8f0] rounded-md px-2 py-1 text-sm outline-none focus:border-[#1e3a5f] w-48"
                            value={g.nombre}
                            onChange={(e) => saveGrupo(g.id, { nombre: e.target.value })}
                          />
                        </td>
                        <td className="text-sm px-3 py-2.5 border-b border-[#f1f5f9]">
                          <label className="relative inline-block w-9 h-5">
                            <input
                              type="checkbox"
                              className="opacity-0 w-0 h-0"
                              checked={g.activo}
                              onChange={(e) => saveGrupo(g.id, { activo: e.target.checked })}
                            />
                            <span className={`absolute cursor-pointer inset-0 rounded-full transition-colors ${g.activo ? "bg-[#1e3a5f]" : "bg-[#e2e8f0]"}`}>
                              <span className={`absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-transform ${g.activo ? "translate-x-4" : ""}`} />
                            </span>
                          </label>
                        </td>
                        <td className="text-sm px-3 py-2.5 border-b border-[#f1f5f9]">
                          <button
                            onClick={() => deleteGrupo(g.id)}
                            className="text-xs font-medium text-red-500 border border-red-200 rounded-md px-2.5 py-1 transition-colors hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "av" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1e293b]">Encargados de Audio y Video</h2>
              <button onClick={addEncargado} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-[#1e3a5f] text-white border border-[#1e3a5f] transition-colors hover:bg-[#152d4a]">
                + Nuevo Encargado
              </button>
            </div>
            {encargados.length === 0 ? (
              <p className="text-sm text-[#94a3b8]">No hay encargados registrados.</p>
            ) : (
              <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-[12px] font-semibold uppercase tracking-wider text-[#94a3b8] px-3 py-2 border-b border-[#e2e8f0]">Orden</th>
                      <th className="text-left text-[12px] font-semibold uppercase tracking-wider text-[#94a3b8] px-3 py-2 border-b border-[#e2e8f0]">Nombre</th>
                      <th className="text-left text-[12px] font-semibold uppercase tracking-wider text-[#94a3b8] px-3 py-2 border-b border-[#e2e8f0]">Activo</th>
                      <th className="text-left text-[12px] font-semibold uppercase tracking-wider text-[#94a3b8] px-3 py-2 border-b border-[#e2e8f0]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {encargados.map((e) => (
                      <tr key={e.id}>
                        <td className="text-sm px-3 py-2.5 border-b border-[#f1f5f9]">{e.orden}</td>
                        <td className="text-sm px-3 py-2.5 border-b border-[#f1f5f9]">
                          <input
                            className="border border-[#e2e8f0] rounded-md px-2 py-1 text-sm outline-none focus:border-[#1e3a5f] w-64"
                            value={e.nombre}
                            onChange={(ev) => saveEncargado(e.id, { nombre: ev.target.value })}
                          />
                        </td>
                        <td className="text-sm px-3 py-2.5 border-b border-[#f1f5f9]">
                          <label className="relative inline-block w-9 h-5">
                            <input
                              type="checkbox"
                              className="opacity-0 w-0 h-0"
                              checked={e.activo}
                              onChange={(ev) => saveEncargado(e.id, { activo: ev.target.checked })}
                            />
                            <span className={`absolute cursor-pointer inset-0 rounded-full transition-colors ${e.activo ? "bg-[#1e3a5f]" : "bg-[#e2e8f0]"}`}>
                              <span className={`absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-transform ${e.activo ? "translate-x-4" : ""}`} />
                            </span>
                          </label>
                        </td>
                        <td className="text-sm px-3 py-2.5 border-b border-[#f1f5f9]">
                          <button
                            onClick={() => deleteEncargado(e.id)}
                            className="text-xs font-medium text-red-500 border border-red-200 rounded-md px-2.5 py-1 transition-colors hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === "pausa" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#1e293b]">Pausa por Asamblea</h2>
            </div>
            <p className="text-sm text-[#94a3b8] mb-4">
              Selecciona una semana para marcarla como "Semana de Asamblea". Durante esa semana no se asignarán roles y la rotación se reanudará la semana siguiente.
            </p>
            <PausaList weeks={pausaWeeks} onToggle={togglePausa} />
          </>
        )}
      </main>
    </div>
  );
}

function PausaList({ weeks, onToggle }: { weeks: { start: string; label: string }[]; onToggle: (ws: string, paused: boolean) => void }) {
  const [pausedWeeks, setPausedWeeks] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/rotacion")
      .then((r) => r.json())
      .then((data: any[]) => {
        const paused = new Set(
          data.filter((h: any) => h.esPausaAsamblea).map((h: any) => h.fechaInicioSemana)
        );
        setPausedWeeks(paused);
      });
  }, []);

  async function handleToggle(weekStart: string, currentlyPaused: boolean) {
    await onToggle(weekStart, !currentlyPaused);
    setPausedWeeks((prev) => {
      const next = new Set(prev);
      if (currentlyPaused) next.delete(weekStart);
      else next.add(weekStart);
      return next;
    });
  }

  return (
    <div className="grid gap-2">
      {weeks.map((w) => {
        const isPaused = pausedWeeks.has(w.start);
        return (
          <div key={w.start} className={`flex items-center gap-4 px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl transition-all ${isPaused ? "bg-[#f8fafc]" : ""}`}>
            <div className="text-[13px] font-medium text-[#475569]" style={{ minWidth: 200 }}>{w.label}</div>
            <div className="flex items-center gap-2">
              <label className="relative inline-block w-9 h-5">
                <input
                  type="checkbox"
                  className="opacity-0 w-0 h-0"
                  checked={isPaused}
                  onChange={() => handleToggle(w.start, isPaused)}
                />
                <span className={`absolute cursor-pointer inset-0 rounded-full transition-colors ${isPaused ? "bg-[#1e3a5f]" : "bg-[#e2e8f0]"}`}>
                  <span className={`absolute h-4 w-4 left-0.5 bottom-0.5 bg-white rounded-full transition-transform ${isPaused ? "translate-x-4" : ""}`} />
                </span>
              </label>
              <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${isPaused ? "bg-[#f1f5f9] text-[#64748b]" : "bg-[#f1f5f9] text-[#64748b] opacity-0"}`}>
                {isPaused ? "Asamblea" : "Activa"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
