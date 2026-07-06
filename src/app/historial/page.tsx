"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import { HistorialRolType } from "@/types";
import { getMonday, formatDate } from "@/lib/dates";

function shortDate(s: string) {
  const d = new Date(s + "T12:00:00");
  return d.toLocaleDateString("es", { day: "numeric", month: "short" });
}

export default function HistorialPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [historial, setHistorial] = useState<HistorialRolType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const me = await fetch("/api/auth/me");
      if (!me.ok) { router.push("/login"); return; }
      const meData = await me.json();
      setUser({ name: meData.user.email.split("@")[0] });

      const res = await fetch("/api/rotacion");
      const data = await res.json();
      setHistorial(data as HistorialRolType[]);
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9]">
        <div className="text-sm text-[#94a3b8]">Cargando...</div>
      </div>
    );
  }

  const weekStart = formatDate(getMonday(new Date()));
  const pastWeeks = [...new Set(historial.map((h) => h.fechaInicioSemana))]
    .filter((w) => w < weekStart)
    .sort()
    .reverse();

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Header userName={user?.name || ""} />
      <main className="max-w-[960px] mx-auto px-6 py-8">
        <h2 className="font-semibold text-[#1e293b] mb-4">Historial de Roles</h2>

        {pastWeeks.length === 0 ? (
          <p className="text-sm text-[#94a3b8]">No hay historial disponible.</p>
        ) : (
          <div className="grid gap-2">
            {pastWeeks.map((ws) => {
              const thu = historial.find((h) => h.fechaInicioSemana === ws && h.tipoReunion === "Jueves");
              const sun = historial.find((h) => h.fechaInicioSemana === ws && h.tipoReunion === "Domingo");
              const isPause = thu?.esPausaAsamblea || sun?.esPausaAsamblea || false;

              return (
                <div
                  key={ws}
                  className={`flex items-center gap-4 px-4 py-3.5 bg-white border border-[#e2e8f0] rounded-xl transition-all ${
                    isPause ? "bg-[#f8fafc]" : ""
                  } ${thu?.completado && sun?.completado ? "opacity-75" : ""}`}
                >
                  <div className="text-[13px] font-medium text-[#475569]" style={{ minWidth: 100 }}>
                    {shortDate(ws)}
                  </div>

                  <div className="flex-1">
                    {isPause ? (
                      <span className="text-[#94a3b8] text-sm">Semana de Asamblea</span>
                    ) : (
                      <>
                        {thu && (
                          <div className="text-sm text-[#1e293b]">
                            <span className="font-medium">Jue:</span>{" "}
                            {thu.encargadoAV
                              ? `${thu.grupoAseo1?.nombre || "?"} y ${thu.grupoAseo2?.nombre || "?"} · AV: ${thu.encargadoAV.nombre}`
                              : `${thu.grupoAseo1?.nombre || "?"} y ${thu.grupoAseo2?.nombre || "?"}`}
                            {thu.completado && (
                              <span className="ml-2 inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f0fdf4] text-[#16a34a]">✓</span>
                            )}
                          </div>
                        )}
                        {sun && (
                          <div className="text-sm text-[#1e293b]">
                            <span className="font-medium">Dom:</span>{" "}
                            {sun.encargadoAV
                              ? `${sun.grupoAseo1?.nombre || "?"} y ${sun.grupoAseo2?.nombre || "?"} · AV: ${sun.encargadoAV.nombre}`
                              : `${sun.grupoAseo1?.nombre || "?"} y ${sun.grupoAseo2?.nombre || "?"}`}
                            {sun.completado && (
                              <span className="ml-2 inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f0fdf4] text-[#16a34a]">✓</span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="text-[#22c55e] text-base min-w-[24px] text-center">
                    {thu?.completado && sun?.completado ? "✓" : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
