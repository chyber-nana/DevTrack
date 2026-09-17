import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getCalendar } from '../controllers/calendarController.js';

const router = Router();
router.get('/', authenticate, getCalendar);
export default router;
