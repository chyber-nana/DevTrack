import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../services/profileService.js';

export async function getProfileController(req: AuthenticatedRequest, res: Response) {
  try {
    const profile = await getProfile(req.user!.userId);
    if (!profile) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: profile });
  } catch (error) { console.error('Failed to fetch profile:', error); res.status(500).json({ success: false, message: 'Failed to fetch profile' }); }
}

export async function updateProfileController(req: AuthenticatedRequest, res: Response) {
  try {
    const profile = await updateProfile(req.user!.userId, {
      name: typeof req.body?.name === 'string' ? req.body.name : undefined,
      username: typeof req.body?.username === 'string' ? req.body.username : undefined,
    });
    if (!profile) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Profile updated', data: profile });
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) return res.status(409).json({ success: false, message: 'Username is already in use' });
    console.error('Failed to update profile:', error); res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
}
