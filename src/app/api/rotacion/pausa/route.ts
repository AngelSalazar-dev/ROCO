import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getMonday, addDays, formatDate } from "@/lib/dates";

export async function POST(request: NextRequest) {
  const { weekStart, paused } = await request.json();

  for (const tipo of ["Jueves", "Domingo"] as const) {
    const existing = await query<any>(
      "SELECT id FROM HistorialRol WHERE fechaInicioSemana = ? AND tipoReunion = ?",
      [weekStart, tipo]
    );
    if (existing.length > 0) {
      await query(
        "UPDATE HistorialRol SET esPausaAsamblea = ?, grupoAseo1Id = NULL, grupoAseo2Id = NULL, encargadoAvId = NULL WHERE id = ?",
        [paused ? 1 : 0, existing[0].id]
      );
    } else {
      const id = crypto.randomUUID();
      await query(
        "INSERT INTO HistorialRol (id, fechaInicioSemana, tipoReunion, esPausaAsamblea) VALUES (?, ?, ?, ?)",
        [id, weekStart, tipo, paused ? 1 : 0]
      );
    }
  }

  const monday = getMonday(new Date());
  const nextMon = addDays(monday, 7);
  const nextStart = formatDate(nextMon);

  await query("DELETE FROM HistorialRol WHERE fechaInicioSemana >= ?", [nextStart]);

  return NextResponse.json({ ok: true });
}
