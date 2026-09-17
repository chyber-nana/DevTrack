import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getNotificationPreferences, getNotifications, readNotification, saveNotificationPreferences } from '../controllers/notificationController.js';

const router = Router();
router.get('/', authenticate, getNotifications);
router.get('/preferences', authenticate, getNotificationPreferences);
router.put('/preferences', authenticate, saveNotificationPreferences);
router.patch('/:notificationId/read', authenticate, readNotification);
export default router;
