import { sql } from '../database/sql.js';

export async function getAnalytics(userId: number) {
  const [weekly, phases, activity] = await Promise.all([
    sql.query(
      `SELECT sd.week,
              COUNT(*)::int AS total_days,
              COUNT(c.id)::int AS completed_days,
              COALESCE(SUM(sd.hours), 0)::int AS planned_hours,
              COALESCE(SUM(CASE WHEN c.id IS NULL THEN 0 ELSE sd.hours END), 0)::int AS completed_hours
       FROM "studyDay" sd
       LEFT JOIN "completion" c ON c."studyDayId" = sd.id AND c."userId" = $1
       GROUP BY sd.week ORDER BY sd.week`,
      [userId],
    ),
    sql.query(
      `SELECT sd.phase,
              COUNT(*)::int AS total_days,
              COUNT(c.id)::int AS completed_days,
              COALESCE(SUM(sd.hours), 0)::int AS planned_hours,
              COALESCE(SUM(CASE WHEN c.id IS NULL THEN 0 ELSE sd.hours END), 0)::int AS completed_hours
       FROM "studyDay" sd
       LEFT JOIN "completion" c ON c."studyDayId" = sd.id AND c."userId" = $1
       GROUP BY sd.phase ORDER BY MIN(sd.date)`,
      [userId],
    ),
    sql.query(
      `SELECT sd.date::date AS date,
              CASE WHEN c.id IS NULL THEN 0 ELSE 1 END AS completed,
              sd.hours
       FROM "studyDay" sd
       LEFT JOIN "completion" c ON c."studyDayId" = sd.id AND c."userId" = $1
       ORDER BY sd.date`,
      [userId],
    ),
  ]);

  return {
    weekly: weekly.rows.map((row) => ({
      week: row.week,
      totalDays: row.total_days,
      completedDays: row.completed_days,
      percentage: row.total_days ? Math.round((row.completed_days / row.total_days) * 100) : 0,
      plannedHours: row.planned_hours,
      completedHours: row.completed_hours,
    })),
    phases: phases.rows.map((row) => ({
      phase: row.phase,
      totalDays: row.total_days,
      completedDays: row.completed_days,
      percentage: row.total_days ? Math.round((row.completed_days / row.total_days) * 100) : 0,
      plannedHours: row.planned_hours,
      completedHours: row.completed_hours,
    })),
    activity: activity.rows,
  };
}
