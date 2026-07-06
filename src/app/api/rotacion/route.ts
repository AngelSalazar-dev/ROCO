import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAutoCompletes, getMissingWeeks, getFixAssignments } from "@/lib/rotation";
import { getMonday, addDays, formatDate } from "@/lib/dates";

export async function GET() {
  const [grupos, encargados, historial] = await Promise.all([
    query<any>("SELECT * FROM GrupoAseo"),
    query<any>("SELECT * FROM EncargadoAV"),
    query<any>("SELECT * FROM HistorialRol ORDER BY fechaInicioSemana ASC"),
  ]);

  // 1. Auto-complete past weeks
  const toComplete = getAutoCompletes(
    historial.map((h: any) => ({ id: h.id, fechaInicioSemana: formatDate(new Date(h.fechaInicioSemana)), tipoReunion: h.tipoReunion, completado: h.completado }))
  );
  for (const id of toComplete) {
    await query("UPDATE HistorialRol SET completado = true WHERE id = ?", [id]);
  }

  // 2. Generate missing weeks
  const existing = new Set<string>(historial.map((h: any) => formatDate(new Date(h.fechaInicioSemana)) + "_" + h.tipoReunion));
  const missing = getMissingWeeks(grupos, encargados, existing);
  for (const m of missing) {
    await query(
      "INSERT INTO HistorialRol (id, fechaInicioSemana, tipoReunion, grupoAseo1Id, grupoAseo2Id, encargadoAvId, esPausaAsamblea, completado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [m.id, m.fechaInicioSemana, m.tipoReunion, m.grupoAseo1Id, m.grupoAseo2Id, m.encargadoAvId, m.esPausaAsamblea, m.completado]
    );
  }

  // 3. Fix future assignments
  const allHistorial = await query<any>("SELECT * FROM HistorialRol ORDER BY fechaInicioSemana ASC");
  const monday = getMonday(new Date());
  const nextMon = addDays(monday, 7);
  const nextStart = formatDate(nextMon);

  const weekMap = new Map<string, { weekStart: string; thuId: string; sunId: string; isPause: boolean }>();
  for (const h of allHistorial) {
    const ws = formatDate(new Date(h.fechaInicioSemana));
    if (!weekMap.has(ws)) {
      weekMap.set(ws, { weekStart: ws, thuId: "", sunId: "", isPause: false });
    }
    const w = weekMap.get(ws)!;
    if (h.tipoReunion === "Jueves") w.thuId = h.id;
    if (h.tipoReunion === "Domingo") w.sunId = h.id;
    if (h.esPausaAsamblea) w.isPause = true;
  }

  const weeks = Array.from(weekMap.values()).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const fixes = getFixAssignments(grupos, encargados, weeks, nextStart);
  for (const f of fixes) {
    await query(
      "UPDATE HistorialRol SET grupoAseo1Id = ?, grupoAseo2Id = ?, encargadoAvId = ? WHERE id = ?",
      [f.grupoAseo1Id, f.grupoAseo2Id, f.encargadoAvId, f.id]
    );
  }

  // 4. Return normalized data
  const final = await query<any>(`
    SELECT
      h.id, h.fechaInicioSemana, h.tipoReunion, h.esPausaAsamblea, h.completado,
      h.grupoAseo1Id, h.grupoAseo2Id, h.encargadoAvId,
      g1.id AS g1id, g1.nombre AS g1nombre, g1.activo AS g1activo, g1.orden AS g1orden,
      g2.id AS g2id, g2.nombre AS g2nombre, g2.activo AS g2activo, g2.orden AS g2orden,
      e.id AS eid, e.nombre AS enombre, e.activo AS eactivo, e.orden AS eorden
    FROM HistorialRol h
    LEFT JOIN GrupoAseo g1 ON h.grupoAseo1Id = g1.id
    LEFT JOIN GrupoAseo g2 ON h.grupoAseo2Id = g2.id
    LEFT JOIN EncargadoAV e ON h.encargadoAvId = e.id
    ORDER BY h.fechaInicioSemana ASC
  `);

  const normalized = final.map((row: any) => ({
    id: row.id,
    fechaInicioSemana: formatDate(new Date(row.fechaInicioSemana)),
    tipoReunion: row.tipoReunion,
    esPausaAsamblea: !!row.esPausaAsamblea,
    completado: !!row.completado,
    grupoAseo1: row.g1id ? { id: row.g1id, nombre: row.g1nombre, activo: !!row.g1activo, orden: row.g1orden } : null,
    grupoAseo2: row.g2id ? { id: row.g2id, nombre: row.g2nombre, activo: !!row.g2activo, orden: row.g2orden } : null,
    encargadoAV: row.eid ? { id: row.eid, nombre: row.enombre, activo: !!row.eactivo, orden: row.eorden } : null,
  }));

  return NextResponse.json(normalized);
}
