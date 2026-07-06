"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import CurrentWeek from "@/components/dashboard/CurrentWeek";
import WeekCalendar from "@/components/dashboard/WeekCalendar";
import { HistorialRolType } from "@/types";
import { getMonday, addDays, formatDate } from "@/lib/dates";

function shortDate(s: string) {
  const d = new Date(s + "T12:00:00");
  return d.toLocaleDateString("es", { day: "numeric", month: "short" });
}

function longDate(s: string) {
  const d = new Date(s + "T12:00:00");
  return d.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
}

export default function Dashboard() {
  const router = useRouter();
  const [historial, setHistorial] = useState<HistorialRolType[]>([]);
  const [user, setUser] = useState<{ name: string } | null>(null);
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

  const monday = getMonday(new Date());
  const weekStart = formatDate(monday);
  const nextMon = addDays(monday, 7);
  const nextStart = formatDate(nextMon);

  const thuActual = historial.find((h) => h.fechaInicioSemana === weekStart && h.tipoReunion === "Jueves");
  const sunActual = historial.find((h) => h.fechaInicioSemana === weekStart && h.tipoReunion === "Domingo");
  const thuNext = historial.find((h) => h.fechaInicioSemana === nextStart && h.tipoReunion === "Jueves");
  const sunNext = historial.find((h) => h.fechaInicioSemana === nextStart && h.tipoReunion === "Domingo");

  const isPauseThisWeek = thuActual?.esPausaAsamblea || sunActual?.esPausaAsamblea || false;
  const isPauseNextWeek = thuNext?.esPausaAsamblea || sunNext?.esPausaAsamblea || false;

  const today = new Date();
  const dayOfWeek = today.getDay();
  const isThursday = dayOfWeek === 4;
  const isSunday = dayOfWeek === 0;

  const calStart = addDays(monday, -2 * 7);
  const calWeeks: { weekStart: string; thu: HistorialRolType | undefined; sun: HistorialRolType | undefined }[] = [];
  for (let i = 0; i < 9; i++) {
    const d = addDays(calStart, i * 7);
    const ws = formatDate(d);
    calWeeks.push({
      weekStart: ws,
      thu: historial.find((h) => h.fechaInicioSemana === ws && h.tipoReunion === "Jueves"),
      sun: historial.find((h) => h.fechaInicioSemana === ws && h.tipoReunion === "Domingo"),
    });
  }

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      <Header userName={user?.name || ""} />
      <main className="max-w-[960px] mx-auto px-6 py-8">
        <CurrentWeek
          weekStart={weekStart}
          thuActual={thuActual}
          sunActual={sunActual}
          isPause={isPauseThisWeek}
          isThursday={isThursday}
          isSunday={isSunday}
          longDateStr={longDate(weekStart)}
        />

        {isPauseNextWeek ? (
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94a3b8]">Próxima Semana</span>
            </div>
            <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#94a3b8] shrink-0">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              <div className="text-sm font-medium text-[#64748b]">Semana de Asamblea</div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94a3b8]">Próxima Semana</span>
            </div>
            <div className="text-sm text-[#94a3b8] mb-4">Semana del {longDate(nextStart)}</div>
            <div className={`flex items-center gap-3 py-2`}>
              <div className="flex items-center gap-2" style={{ minWidth: 100 }}>
                <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f1f5f9] text-[#64748b]">Jueves</span>
              </div>
              {thuNext && !thuNext.esPausaAsamblea ? (
                <span className="text-sm text-[#1e293b]">
                  {[
                    thuNext.grupoAseo1 && thuNext.grupoAseo2 ? `Aseo: ${thuNext.grupoAseo1.nombre} y ${thuNext.grupoAseo2.nombre}` : "",
                    thuNext.encargadoAV ? `AV: ${thuNext.encargadoAV.nombre}` : "",
                  ].filter(Boolean).join(" · ") || "Sin asignación"}
                </span>
              ) : (
                <span className="text-[#94a3b8] text-sm">Sin datos</span>
              )}
            </div>
            <div className={`flex items-center gap-3 py-2`}>
              <div className="flex items-center gap-2" style={{ minWidth: 100 }}>
                <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#f1f5f9] text-[#64748b]">Domingo</span>
              </div>
              {sunNext && !sunNext.esPausaAsamblea ? (
                <span className="text-sm text-[#1e293b]">
                  {[
                    sunNext.grupoAseo1 && sunNext.grupoAseo2 ? `Aseo: ${sunNext.grupoAseo1.nombre} y ${sunNext.grupoAseo2.nombre}` : "",
                    sunNext.encargadoAV ? `AV: ${sunNext.encargadoAV.nombre}` : "",
                  ].filter(Boolean).join(" · ") || "Sin asignación"}
                </span>
              ) : (
                <span className="text-[#94a3b8] text-sm">Sin datos</span>
              )}
            </div>
          </div>
        )}

        <WeekCalendar weeks={calWeeks} currentWeekStart={weekStart} shortDate={shortDate} />
      </main>
    </div>
  );
}
