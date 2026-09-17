import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getAchievements, refreshAchievements } from '../controllers/achievementController.js';

const router = Router();
router.get('/', authenticate, getAchievements);
router.post('/refresh', authenticate, refreshAchievements);
export default router;
