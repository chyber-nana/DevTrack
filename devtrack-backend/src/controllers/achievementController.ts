import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { evaluateAchievements, getUserAchievements } from '../services/achievementService.js';

export async function getAchievements(req: AuthenticatedRequest, res: Response) {
  try { res.json({ success: true, data: await getUserAchievements(req.user!.userId) }); }
  catch (error) { console.error('Failed to fetch achievements:', error); res.status(500).json({ success: false, message: 'Failed to fetch achievements' }); }
}

export async function refreshAchievements(req: AuthenticatedRequest, res: Response) {
  try { res.json({ success: true, data: await evaluateAchievements(req.user!.userId) }); }
  catch (error) { console.error('Failed to evaluate achievements:', error); res.status(500).json({ success: false, message: 'Failed to evaluate achievements' }); }
}
