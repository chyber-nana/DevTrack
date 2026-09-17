import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { sql } from '../database/sql.js';

export async function getCalendar(req: AuthenticatedRequest, res: Response) {
  try {
    const from = typeof req.query.from === 'string' ? req.query.from : null;
    const to = typeof req.query.to === 'string' ? req.query.to : null;
    const result = await sql.query(
      `SELECT sd.id, sd.date, sd.week, sd.phase, sd.focus, sd.practice, sd."projectTarget", sd.hours,
              (c.id IS NOT NULL) AS completed,
              c."completedAt"
       FROM "studyDay" sd
       LEFT JOIN "completion" c ON c."studyDayId" = sd.id AND c."userId" = $1
       WHERE ($2::date IS NULL OR sd.date::date >= $2::date)
         AND ($3::date IS NULL OR sd.date::date <= $3::date)
       ORDER BY sd.date ASC`,
      [req.user!.userId, from, to],
    );
    res.json({ success: true, count: result.rowCount, data: result.rows });
  } catch (error) { console.error('Failed to fetch calendar:', error); res.status(500).json({ success: false, message: 'Failed to fetch calendar' }); }
}
