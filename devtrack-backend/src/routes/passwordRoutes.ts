import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { changePasswordController, forgotPassword, resetPasswordController } from '../controllers/passwordController.js';

const router = Router();
router.post('/change', authenticate, changePasswordController);
router.post('/forgot', forgotPassword);
router.post('/reset', resetPasswordController);
export default router;
