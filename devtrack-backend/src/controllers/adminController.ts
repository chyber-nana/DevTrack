import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getAdminOverview, getRecentActivity, listUsers, setUserRole } from '../services/adminService.js';

export async function overview(req: AuthenticatedRequest, res: Response) {
  try { res.json({ success: true, data: await getAdminOverview() }); }
  catch (error) { console.error('Failed to fetch admin overview:', error); res.status(500).json({ success: false, message: 'Failed to fetch admin overview' }); }
}

export async function users(req: AuthenticatedRequest, res: Response) {
  try { res.json({ success: true, data: await listUsers() }); }
  catch (error) { console.error('Failed to fetch admin users:', error); res.status(500).json({ success: false, message: 'Failed to fetch users' }); }
}

export async function updateRole(req: AuthenticatedRequest, res: Response) {
  const userId = Number(req.params.userId);
  const role = req.body?.role;
  if (Number.isNaN(userId) || (role !== 'user' && role !== 'admin')) return res.status(400).json({ success: false, message: 'Valid user ID and role are required' });
  if (userId === req.user!.userId && role !== 'admin') return res.status(400).json({ success: false, message: 'You cannot remove your own admin access' });
  try {
    const user = await setUserRole(userId, role);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) { console.error('Failed to update role:', error); res.status(500).json({ success: false, message: 'Failed to update user role' }); }
}

export async function activity(req: AuthenticatedRequest, res: Response) {
  try { res.json({ success: true, data: await getRecentActivity() }); }
  catch (error) { console.error('Failed to fetch admin activity:', error); res.status(500).json({ success: false, message: 'Failed to fetch activity' }); }
}
