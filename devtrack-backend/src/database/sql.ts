import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

export const sql = new Pool({
  connectionString: process.env.DATABASE_URL!,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: true }
    : undefined,
});

export async function closeSqlPool() {
  await sql.end();
}
