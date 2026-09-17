import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getPreferences, listNotifications, markRead, updatePreferences } from '../services/notificationService.js';

export async function getNotificationPreferences(req: AuthenticatedRequest, res: Response) {
  try { res.json({ success: true, data: await getPreferences(req.user!.userId) }); }
  catch (error) { console.error('Failed to fetch notification preferences:', error); res.status(500).json({ success: false, message: 'Failed to fetch notification preferences' }); }
}

export async function saveNotificationPreferences(req: AuthenticatedRequest, res: Response) {
  const enabled = Boolean(req.body?.enabled);
  const reminderTime = typeof req.body?.reminderTime === 'string' ? req.body.reminderTime : '08:00:00';
  const timezone = typeof req.body?.timezone === 'string' ? req.body.timezone : 'UTC';
  if (!/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(reminderTime)) return res.status(400).json({ success: false, message: 'Invalid reminder time' });
  try { res.json({ success: true, data: await updatePreferences(req.user!.userId, enabled, reminderTime.length === 5 ? `${reminderTime}:00` : reminderTime, timezone) }); }
  catch (error) { console.error('Failed to save notification preferences:', error); res.status(500).json({ success: false, message: 'Failed to save notification preferences' }); }
}

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  try {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await listNotifications(req.user!.userId, unreadOnly);
    res.json({ success: true, count: notifications.length, data: notifications });
  } catch (error) { console.error('Failed to fetch notifications:', error); res.status(500).json({ success: false, message: 'Failed to fetch notifications' }); }
}

export async function readNotification(req: AuthenticatedRequest, res: Response) {
  const notificationId = Number(req.params.notificationId);
  if (Number.isNaN(notificationId)) return res.status(400).json({ success: false, message: 'Invalid notification ID' });
  try {
    const notification = await markRead(req.user!.userId, notificationId);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notification });
  } catch (error) { console.error('Failed to mark notification read:', error); res.status(500).json({ success: false, message: 'Failed to update notification' }); }
}
