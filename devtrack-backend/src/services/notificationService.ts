import { sql } from '../database/sql.js';

export async function getPreferences(userId: number) {
  const result = await sql.query(
    `INSERT INTO "notificationPreference" ("userId") VALUES ($1)
     ON CONFLICT ("userId") DO NOTHING
     RETURNING id, enabled, "reminderTime", timezone, "updatedAt"`,
    [userId],
  );

  if (result.rowCount) return result.rows[0];

  const existing = await sql.query(
    `SELECT id, enabled, "reminderTime", timezone, "updatedAt"
     FROM "notificationPreference" WHERE "userId" = $1`,
    [userId],
  );
  return existing.rows[0];
}

export async function updatePreferences(
  userId: number,
  enabled: boolean,
  reminderTime: string,
  timezone: string,
) {
  const result = await sql.query(
    `INSERT INTO "notificationPreference" ("userId", enabled, "reminderTime", timezone, "updatedAt")
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT ("userId")
     DO UPDATE SET enabled = EXCLUDED.enabled,
                   "reminderTime" = EXCLUDED."reminderTime",
                   timezone = EXCLUDED.timezone,
                   "updatedAt" = now()
     RETURNING id, enabled, "reminderTime", timezone, "updatedAt"`,
    [userId, enabled, reminderTime, timezone],
  );
  return result.rows[0];
}

export async function createDueReminder(userId: number) {
  const result = await sql.query(
    `SELECT np.enabled, np."reminderTime", np.timezone,
            sd.id AS "studyDayId", sd.date, sd.phase, sd.focus
     FROM "notificationPreference" np
     JOIN "studyDay" sd ON sd.date::date = CURRENT_DATE
     WHERE np."userId" = $1 AND np.enabled = true
       AND (now() AT TIME ZONE np.timezone)::time >= np."reminderTime"`,
    [userId],
  );

  if (!result.rowCount) return null;

  const day = result.rows[0];
  const existing = await sql.query(
    `SELECT id FROM "notification"
     WHERE "userId" = $1 AND type = 'STUDY_REMINDER'
       AND "createdAt"::date = CURRENT_DATE`,
    [userId],
  );
  if (existing.rowCount) return null;

  const note = `Today's plan: ${String(day.focus).replace(/^Learn: |^Practice: |^Build: /, '')}`;
  const inserted = await sql.query(
    `INSERT INTO "notification" ("userId", type, title, message)
     VALUES ($1, 'STUDY_REMINDER', 'Time to study', $2)
     RETURNING *`,
    [userId, note],
  );
  return inserted.rows[0];
}

export async function listNotifications(userId: number, unreadOnly = false) {
  await createDueReminder(userId);
  const result = await sql.query(
    `SELECT id, type, title, message, "isRead", "createdAt"
     FROM "notification"
     WHERE "userId" = $1 ${unreadOnly ? 'AND "isRead" = false' : ''}
     ORDER BY "createdAt" DESC
     LIMIT 100`,
    [userId],
  );
  return result.rows;
}

export async function markRead(userId: number, notificationId: number) {
  const result = await sql.query(
    `UPDATE "notification" SET "isRead" = true
     WHERE id = $1 AND "userId" = $2 RETURNING *`,
    [notificationId, userId],
  );
  return result.rows[0] ?? null;
}
