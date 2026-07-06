import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const rows = await query<any>("SELECT * FROM EncargadoAV ORDER BY orden ASC");
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.id) {
    await query(
      "UPDATE EncargadoAV SET nombre = ?, activo = ?, orden = ? WHERE id = ?",
      [body.nombre, body.activo, body.orden, body.id]
    );
    return NextResponse.json({ ok: true });
  }
  const max = await query<any>("SELECT MAX(orden) as m FROM EncargadoAV");
  const maxOrden = max[0]?.m ?? 0;
  const id = crypto.randomUUID();
  await query(
    "INSERT INTO EncargadoAV (id, nombre, activo, orden) VALUES (?, ?, true, ?)",
    [id, body.nombre || "Nuevo encargado", maxOrden + 1]
  );
  return NextResponse.json({ id });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await query("UPDATE EncargadoAV SET activo = false WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
