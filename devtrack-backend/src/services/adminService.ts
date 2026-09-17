import { sql } from '../database/sql.js';

export async function getAdminOverview() {
  const [users, completions, projects, notes, notifications, achievements] = await Promise.all([
    sql.query(`SELECT COUNT(*)::int AS count FROM "user"`),
    sql.query(`SELECT COUNT(*)::int AS count FROM "completion"`),
    sql.query(`SELECT COUNT(*)::int AS count FROM "project"`),
    sql.query(`SELECT COUNT(*)::int AS count FROM "dailyNote"`),
    sql.query(`SELECT COUNT(*)::int AS count FROM "notification" WHERE "isRead" = false`),
    sql.query(`SELECT COUNT(*)::int AS count FROM "userAchievement"`),
  ]);

  return {
    users: users.rows[0].count,
    completions: completions.rows[0].count,
    projects: projects.rows[0].count,
    notes: notes.rows[0].count,
    unreadNotifications: notifications.rows[0].count,
    unlockedAchievements: achievements.rows[0].count,
  };
}

export async function listUsers() {
  const result = await sql.query(
    `SELECT id, email, username, name, role, "createdAt", "updatedAt"
     FROM "user" ORDER BY id ASC`,
  );
  return result.rows;
}

export async function setUserRole(userId: number, role: 'user' | 'admin') {
  const result = await sql.query(
    `UPDATE "user" SET role = $2, "updatedAt" = now() WHERE id = $1
     RETURNING id, email, username, name, role`,
    [userId, role],
  );
  return result.rows[0] ?? null;
}

export async function getRecentActivity() {
  const result = await sql.query(
    `SELECT c.id, c."completedAt", u.email, sd.date, sd.phase, sd.focus
     FROM "completion" c
     JOIN "user" u ON u.id = c."userId"
     JOIN "studyDay" sd ON sd.id = c."studyDayId"
     ORDER BY c."completedAt" DESC LIMIT 100`,
  );
  return result.rows;
}
