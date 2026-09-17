import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getProfileController, updateProfileController } from '../controllers/profileController.js';

const router = Router();
router.get('/', authenticate, getProfileController);
router.patch('/', authenticate, updateProfileController);
export default router;
