import { sql } from '../database/sql.js';

export async function getNotes(userId: number) {
  const result = await sql.query(
    `SELECT n.id, n."studyDayId", n.content, n."createdAt", n."updatedAt",
            sd.date, sd.week, sd.phase, sd.focus
     FROM "dailyNote" n
     JOIN "studyDay" sd ON sd.id = n."studyDayId"
     WHERE n."userId" = $1
     ORDER BY sd.date DESC`,
    [userId],
  );
  return result.rows;
}

export async function getNote(userId: number, studyDayId: number) {
  const result = await sql.query(
    `SELECT id, "studyDayId", content, "createdAt", "updatedAt"
     FROM "dailyNote" WHERE "userId" = $1 AND "studyDayId" = $2`,
    [userId, studyDayId],
  );
  return result.rows[0] ?? null;
}

export async function upsertNote(userId: number, studyDayId: number, content: string) {
  const studyDay = await sql.query(`SELECT id FROM "studyDay" WHERE id = $1`, [studyDayId]);
  if (!studyDay.rowCount) throw new Error('STUDY_DAY_NOT_FOUND');

  const result = await sql.query(
    `INSERT INTO "dailyNote" ("userId", "studyDayId", content)
     VALUES ($1, $2, $3)
     ON CONFLICT ("userId", "studyDayId")
     DO UPDATE SET content = EXCLUDED.content, "updatedAt" = now()
     RETURNING id, "studyDayId", content, "createdAt", "updatedAt"`,
    [userId, studyDayId, content],
  );
  return result.rows[0];
}

export async function deleteNote(userId: number, studyDayId: number) {
  const result = await sql.query(
    `DELETE FROM "dailyNote" WHERE "userId" = $1 AND "studyDayId" = $2 RETURNING id`,
    [userId, studyDayId],
  );
  return (result.rowCount ?? 0) > 0;
}
