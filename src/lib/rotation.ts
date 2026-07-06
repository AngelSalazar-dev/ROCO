import { getMonday, addDays, formatDate } from "./dates";
import { GrupoAseoType, EncargadoAVType } from "@/types";

function rotateLeft<T>(arr: T[], n: number): T[] {
  if (!arr.length) return arr;
  n = ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
}

export function getEffWeekIdx(allWeeks: { weekStart: string; isPause: boolean }[]): number[] {
  const result: number[] = [];
  let idx = 0;
  for (const w of allWeeks) {
    result.push(idx);
    if (!w.isPause) idx++;
  }
  return result;
}

export function getRotationForWeek(
  grupos: GrupoAseoType[],
  encargados: EncargadoAVType[],
  effectiveIdx: number
) {
  const gActivos = grupos.filter((g) => g.activo).sort((a, b) => a.orden - b.orden);
  const eActivos = encargados.filter((e) => e.activo).sort((a, b) => a.orden - b.orden);

  let juevesPair: [GrupoAseoType, GrupoAseoType] | null = null;
  let domingoPair: [GrupoAseoType, GrupoAseoType] | null = null;
  let encargado: EncargadoAVType | null = null;

  if (gActivos.length >= 2) {
    const rotated = rotateLeft(gActivos, effectiveIdx % gActivos.length);
    juevesPair = [rotated[0], rotated[1]];
    if (gActivos.length >= 4) {
      domingoPair = [rotated[2], rotated[3]];
    }
  }

  if (eActivos.length > 0) {
    encargado = eActivos[effectiveIdx % eActivos.length];
  }

  return { juevesPair, domingoPair, encargado };
}

export function getAutoCompletes(
  historial: { id: string; fechaInicioSemana: string; tipoReunion: string; completado: boolean }[]
): string[] {
  const today = formatDate(new Date());
  const ids: string[] = [];
  for (const h of historial) {
    if (h.completado) continue;
    const meeting = addDays(new Date(h.fechaInicioSemana + "T12:00:00"), h.tipoReunion === "Jueves" ? 3 : 6);
    if (formatDate(meeting) < today) {
      ids.push(h.id);
    }
  }
  return ids;
}

export interface NewEntry {
  id: string;
  fechaInicioSemana: string;
  tipoReunion: string;
  grupoAseo1Id: string | null;
  grupoAseo2Id: string | null;
  encargadoAvId: string | null;
  esPausaAsamblea: boolean;
  completado: boolean;
}

export function getMissingWeeks(
  grupos: GrupoAseoType[],
  encargados: EncargadoAVType[],
  existingWeeks: Set<string>
): NewEntry[] {
  const monday = getMonday(new Date());
  const start = addDays(monday, -8 * 7);
  const end = addDays(monday, 12 * 7);
  const entries: NewEntry[] = [];
  const uid = () => crypto.randomUUID();

  let cursor = new Date(start);
  while (cursor <= end) {
    const wsStr = formatDate(cursor);
    const hasThu = existingWeeks.has(wsStr + "_Jueves");
    const hasSun = existingWeeks.has(wsStr + "_Domingo");

    if (!hasThu || !hasSun) {
      const isPause = false;
      const effectiveIdx = 0;
      const rot = getRotationForWeek(grupos, encargados, effectiveIdx);

      if (!hasThu) {
        entries.push({
          id: uid(),
          fechaInicioSemana: wsStr,
          tipoReunion: "Jueves",
          grupoAseo1Id: isPause ? null : rot.juevesPair?.[0]?.id ?? null,
          grupoAseo2Id: isPause ? null : rot.juevesPair?.[1]?.id ?? null,
          encargadoAvId: isPause ? null : rot.encargado?.id ?? null,
          esPausaAsamblea: isPause,
          completado: false,
        });
      }
      if (!hasSun) {
        entries.push({
          id: uid(),
          fechaInicioSemana: wsStr,
          tipoReunion: "Domingo",
          grupoAseo1Id: isPause ? null : rot.domingoPair?.[0]?.id ?? null,
          grupoAseo2Id: isPause ? null : rot.domingoPair?.[1]?.id ?? null,
          encargadoAvId: isPause ? null : rot.encargado?.id ?? null,
          esPausaAsamblea: isPause,
          completado: false,
        });
      }
    }

    cursor = addDays(cursor, 7);
  }

  return entries;
}

export function getFixAssignments(
  grupos: GrupoAseoType[],
  encargados: EncargadoAVType[],
  weeks: { weekStart: string; thuId: string; sunId: string; isPause: boolean }[],
  weekStartFrom: string
): { id: string; grupoAseo1Id: string | null; grupoAseo2Id: string | null; encargadoAvId: string | null }[] {
  const filtered = weeks.filter((w) => w.weekStart >= weekStartFrom).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const allWeeks = weeks.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const weekPauses = allWeeks.map((w) => ({ weekStart: w.weekStart, isPause: w.isPause }));
  const effIdx = getEffWeekIdx(weekPauses);
  const weekToIdx = new Map<string, number>();
  for (let i = 0; i < allWeeks.length; i++) {
    weekToIdx.set(allWeeks[i].weekStart, effIdx[i]);
  }

  const updates: { id: string; grupoAseo1Id: string | null; grupoAseo2Id: string | null; encargadoAvId: string | null }[] = [];

  for (const w of filtered) {
    const idx = weekToIdx.get(w.weekStart) ?? 0;
    const rot = getRotationForWeek(grupos, encargados, idx);

    if (w.thuId) {
      updates.push({
        id: w.thuId,
        grupoAseo1Id: w.isPause ? null : rot.juevesPair?.[0]?.id ?? null,
        grupoAseo2Id: w.isPause ? null : rot.juevesPair?.[1]?.id ?? null,
        encargadoAvId: w.isPause ? null : rot.encargado?.id ?? null,
      });
    }
    if (w.sunId) {
      updates.push({
        id: w.sunId,
        grupoAseo1Id: w.isPause ? null : rot.domingoPair?.[0]?.id ?? null,
        grupoAseo2Id: w.isPause ? null : rot.domingoPair?.[1]?.id ?? null,
        encargadoAvId: w.isPause ? null : rot.encargado?.id ?? null,
      });
    }
  }

  return updates;
}
