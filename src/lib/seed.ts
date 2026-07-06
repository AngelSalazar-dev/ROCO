import { query } from "./db";
import bcrypt from "bcryptjs";
const uid = () => crypto.randomUUID();

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "admin@roco.app").split(",");
const ADMIN_PASS = process.env.ADMIN_PASSWORD || "admin123";

async function seed() {
  for (const email of ADMIN_EMAILS) {
    const existing = await query<any>("SELECT id FROM Profile WHERE email = ?", [email]);
    if (existing.length === 0) {
      const hash = await bcrypt.hash(ADMIN_PASS, 12);
      await query(
        "INSERT INTO Profile (id, email, password, role) VALUES (?, ?, ?, 'admin')",
        [uid(), email, hash]
      );
      console.log(`Admin created: ${email}`);
    }
  }

  const count = await query<any>("SELECT COUNT(*) as c FROM GrupoAseo");
  if (count[0].c === 0) {
    for (let i = 1; i <= 10; i++) {
      await query(
        "INSERT INTO GrupoAseo (id, nombre, activo, orden) VALUES (?, ?, true, ?)",
        [uid(), `Grupo ${i}`, i]
      );
    }
    console.log("10 groups seeded");
  }

  console.log("Seed OK");
  process.exit(0);
}

seed().catch((e) => { console.error(e); process.exit(1); });
