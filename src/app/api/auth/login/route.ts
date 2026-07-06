import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { comparePassword, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const rows = await query<any>("SELECT * FROM Profile WHERE email = ?", [email]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const profile = rows[0] as { id: string; email: string; password: string; role: string };
    const valid = await comparePassword(password, profile.password);
    if (!valid) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    const token = signToken({ id: profile.id, email: profile.email, role: profile.role });
    const response = NextResponse.json({
      user: { id: profile.id, email: profile.email, role: profile.role, name: profile.email.split("@")[0] },
    });
    setSessionCookie(response, token);
    return response;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
