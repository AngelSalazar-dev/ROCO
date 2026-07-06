import { HistorialRolType } from "@/types";
import MeetingRow from "./MeetingRow";

interface Props {
  weekStart: string;
  thuActual: HistorialRolType | undefined;
  sunActual: HistorialRolType | undefined;
  isPause: boolean;
  isThursday: boolean;
  isSunday: boolean;
  longDateStr: string;
}

export default function CurrentWeek({ weekStart, thuActual, sunActual, isPause, isThursday, isSunday, longDateStr }: Props) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 border-l-3 border-l-[#1e3a5f] mb-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[13px] font-semibold uppercase tracking-wider text-[#94a3b8]">Semana Actual</span>
      </div>

      {isPause ? (
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-5 flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#94a3b8] shrink-0">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          <div>
            <div className="text-sm font-medium text-[#64748b]">Semana de Asamblea</div>
            <div className="text-xs text-[#94a3b8]">{longDateStr}</div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-[#94a3b8]">Semana del {longDateStr}</span>
            {(isThursday || isSunday) && (
              <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#fff7ed] text-[#ea580c]">
                HOY
              </span>
            )}
          </div>
          <MeetingRow day="Jueves" entry={thuActual} isToday={isThursday} />
          <MeetingRow day="Domingo" entry={sunActual} isToday={isSunday} />
        </>
      )}
    </div>
  );
}
