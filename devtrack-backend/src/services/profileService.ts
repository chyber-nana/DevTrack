import { sql } from '../database/sql.js';

export async function getProfile(userId: number) {
  const result = await sql.query(
    `SELECT id, email, username, name, role, "createdAt", "updatedAt"
     FROM "user" WHERE id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function updateProfile(
  userId: number,
  data: { name?: string; username?: string },
) {
  const name = data.name?.trim() ?? null;
  const username = data.username?.trim() || null;
  const result = await sql.query(
    `UPDATE "user"
     SET name = COALESCE($2, name), username = COALESCE($3, username), "updatedAt" = now()
     WHERE id = $1
     RETURNING id, email, username, name, role, "createdAt", "updatedAt"`,
    [userId, name, username],
  );
  return result.rows[0] ?? null;
}
