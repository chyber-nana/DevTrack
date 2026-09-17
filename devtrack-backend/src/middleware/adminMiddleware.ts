import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './authMiddleware.js';
import { sql } from '../database/sql.js';

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const result = await sql.query(`SELECT role FROM "user" WHERE id = $1`, [userId]);
    if (!result.rowCount || result.rows[0].role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin authorization failed:', error);
    res.status(500).json({ success: false, message: 'Authorization check failed' });
  }
}
