import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAutoCompletes } from "@/lib/rotation";

export async function POST() {
  const historial = await query<any>("SELECT id, fechaInicioSemana, tipoReunion, completado FROM HistorialRol");
  const ids = getAutoCompletes(
    historial.map((h: any) => ({ id: h.id, fechaInicioSemana: new Date(h.fechaInicioSemana).toISOString().slice(0, 10), tipoReunion: h.tipoReunion, completado: h.completado }))
  );
  for (const id of ids) {
    await query("UPDATE HistorialRol SET completado = true WHERE id = ?", [id]);
  }
  return NextResponse.json({ ok: true });
}
