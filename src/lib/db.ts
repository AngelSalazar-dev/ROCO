import mysql from "mysql2/promise";

const uri = process.env.DATABASE_URL?.replace("/sys", "/test");
const pool = mysql.createPool({
  uri,
  ssl: { rejectUnauthorized: process.env.NODE_ENV === "production" ? true : false },
  waitForConnections: true,
  connectionLimit: 5,
});

export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

export async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS Profile (
      id VARCHAR(36) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'viewer',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS GrupoAseo (
      id VARCHAR(36) PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      activo BOOLEAN DEFAULT true,
      orden INT NOT NULL
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS EncargadoAV (
      id VARCHAR(36) PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      activo BOOLEAN DEFAULT true,
      orden INT NOT NULL
    )
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS HistorialRol (
      id VARCHAR(36) PRIMARY KEY,
      fechaInicioSemana DATE NOT NULL,
      tipoReunion VARCHAR(10) NOT NULL,
      grupoAseo1Id VARCHAR(36),
      grupoAseo2Id VARCHAR(36),
      encargadoAvId VARCHAR(36),
      esPausaAsamblea BOOLEAN DEFAULT false,
      completado BOOLEAN DEFAULT false,
      UNIQUE KEY unique_reunion (fechaInicioSemana, tipoReunion)
    )
  `);
}

export default pool;
