import { HistorialRolType } from "@/types";

interface Props {
  day: string;
  entry: HistorialRolType | undefined;
  isToday: boolean;
}

export default function MeetingRow({ day, entry, isToday }: Props) {
  const isPause = entry?.esPausaAsamblea || false;

  return (
    <div className={`flex items-center gap-3 py-2 ${isToday ? "bg-[#f0f7ff] rounded-lg px-2 -mx-2" : ""}`}>
      <div className="flex items-center gap-2" style={{ minWidth: 100 }}>
        <span className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
          isToday ? "bg-[#eff6ff] text-[#1e3a5f]" : "bg-[#f1f5f9] text-[#64748b]"
        }`}>
          {day}
        </span>
        {isToday && (
          <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#fff7ed] text-[#ea580c]">
            Hoy
          </span>
        )}
      </div>

      {isPause ? (
        <span className="text-[#94a3b8]">—</span>
      ) : entry ? (
        <>
          <span className="text-sm text-[#1e293b]">
            {[
              entry.grupoAseo1 && entry.grupoAseo2 ? `Aseo: ${entry.grupoAseo1.nombre} y ${entry.grupoAseo2.nombre}` : "",
              entry.encargadoAV ? `AV: ${entry.encargadoAV.nombre}` : "",
            ]
              .filter(Boolean)
              .join(" · ") || "Sin asignación"}
          </span>
          {entry.completado && <span className="text-[#22c55e] text-base ml-auto">✓</span>}
        </>
      ) : (
        <span className="text-[#94a3b8] text-sm">Sin datos</span>
      )}
    </div>
  );
}
