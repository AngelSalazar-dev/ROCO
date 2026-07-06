import { HistorialRolType } from "@/types";

interface Props {
  weeks: { weekStart: string; thu: HistorialRolType | undefined; sun: HistorialRolType | undefined }[];
  currentWeekStart: string;
  shortDate: (s: string) => string;
}

export default function WeekCalendar({ weeks, currentWeekStart, shortDate }: Props) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 animate-fade-in mt-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94a3b8]">Calendario de Roles</span>
      </div>

      <div className="grid gap-3">
        {weeks.map(({ weekStart, thu, sun }) => {
          const isPause = thu?.esPausaAsamblea || sun?.esPausaAsamblea || false;
          const isCurrent = weekStart === currentWeekStart;
          const isPast = weekStart < currentWeekStart;

          return (
            <div
              key={weekStart}
              className={`flex items-center gap-4 px-4 py-3.5 bg-white border border-[#e2e8f0] rounded-xl transition-all ${
                isPause ? "bg-[#f8fafc]" : ""
              } ${isCurrent ? "bg-[#f0f7ff] border-[#bdd3eb]" : ""} ${isPast && !isCurrent ? "opacity-75" : ""}`}
            >
              <div className="text-[13px] font-medium text-[#475569]" style={{ minWidth: 140 }}>
                {shortDate(weekStart)}
                {isCurrent && (
                  <span className="ml-2 text-[11px] font-semibold text-[#1e3a5f] bg-[#dbeafe] px-2 py-0.5 rounded">
                    Actual
                  </span>
                )}
              </div>

              <div className="flex-1">
                {isPause ? (
                  <span className="text-[#94a3b8] text-sm">Semana de Asamblea</span>
                ) : (
                  <>
                    {thu && (
                      <div className="text-sm text-[#1e293b]">
                        <strong>Jueves </strong>
                        {thu.completado && "✓ "}
                        {thu.encargadoAV
                          ? `${thu.grupoAseo1?.nombre || "?"} y ${thu.grupoAseo2?.nombre || "?"} · AV: ${thu.encargadoAV.nombre}`
                          : `${thu.grupoAseo1?.nombre || "?"} y ${thu.grupoAseo2?.nombre || "?"}`}
                      </div>
                    )}
                    {sun && (
                      <div className="text-sm text-[#1e293b]">
                        <strong>Domingo </strong>
                        {sun.completado && "✓ "}
                        {sun.encargadoAV
                          ? `${sun.grupoAseo1?.nombre || "?"} y ${sun.grupoAseo2?.nombre || "?"} · AV: ${sun.encargadoAV.nombre}`
                          : `${sun.grupoAseo1?.nombre || "?"} y ${sun.grupoAseo2?.nombre || "?"}`}
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
    </div>
  );
}
