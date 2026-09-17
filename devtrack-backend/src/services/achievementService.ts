import { sql } from '../database/sql.js';

export async function getUserAchievements(userId: number) {
  const result = await sql.query(
    `SELECT a.code, a.name, a.description, a.icon, ua."unlockedAt"
     FROM "achievement" a
     LEFT JOIN "userAchievement" ua
       ON ua."achievementId" = a.id AND ua."userId" = $1
     ORDER BY a.id ASC`,
    [userId],
  );

  return result.rows;
}

export async function evaluateAchievements(userId: number) {
  const progressResult = await sql.query(
    `SELECT
       (SELECT COUNT(*)::int FROM "studyDay") AS total_days,
       (SELECT COUNT(*)::int FROM "completion" WHERE "userId" = $1) AS completed_days,
       (SELECT MAX(progress) FROM "project") AS max_project_progress`,
    [userId],
  );

  const { total_days, completed_days, max_project_progress } = progressResult.rows[0];
  const completedDays = Number(completed_days || 0);
  const totalDays = Number(total_days || 0);

  const streakResult = await sql.query(
    `WITH dates AS (
       SELECT DISTINCT sd.date::date AS day
       FROM "completion" c
       JOIN "studyDay" sd ON sd.id = c."studyDayId"
       WHERE c."userId" = $1
     ), groups AS (
       SELECT day, day - (ROW_NUMBER() OVER (ORDER BY day))::int AS grp
       FROM dates
     ), streaks AS (
       SELECT grp, COUNT(*)::int AS streak_length
       FROM groups
       GROUP BY grp
     )
     SELECT COALESCE(MAX(streak_length), 0)::int AS longest_streak
     FROM streaks`,
    [userId],
  );

  const longestStreak = Math.max(
    0,
    ...streakResult.rows.map((row) => Number(row.longest_streak || 0)),
  );

  const codes: string[] = [];
  if (completedDays >= 1) codes.push('FIRST_DAY');
  if (completedDays >= 3) codes.push('THREE_DAYS');
  if (longestStreak >= 7) codes.push('SEVEN_DAY_STREAK');
  if (completedDays >= 10) codes.push('TEN_DAYS');
  if (Number(max_project_progress || 0) > 0) codes.push('FIRST_PROJECT');
  if (totalDays > 0 && completedDays / totalDays >= 0.25) codes.push('TWENTY_FIVE_PERCENT');
  if (totalDays > 0 && completedDays / totalDays >= 0.5) codes.push('FIFTY_PERCENT');
  if (totalDays > 0 && completedDays >= totalDays) codes.push('ALL_DAYS');

  if (!codes.length) return [];

  await sql.query(
    `INSERT INTO "userAchievement" ("userId", "achievementId")
     SELECT $1, id FROM "achievement" WHERE code = ANY($2::text[])
     ON CONFLICT ("userId", "achievementId") DO NOTHING`,
    [userId, codes],
  );

  return getUserAchievements(userId);
}
