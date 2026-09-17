import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getAnalyticsController } from '../controllers/analyticsController.js';

const router = Router();
router.get('/', authenticate, getAnalyticsController);
export default router;
