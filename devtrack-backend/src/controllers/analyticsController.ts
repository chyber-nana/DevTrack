import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getAnalytics } from '../services/analyticsService.js';

export async function getAnalyticsController(req: AuthenticatedRequest, res: Response) {
  try {
    res.json({ success: true, data: await getAnalytics(req.user!.userId) });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
}
