import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import { activity, overview, updateRole, users } from '../controllers/adminController.js';

const router = Router();
router.use(authenticate, requireAdmin);
router.get('/overview', overview);
router.get('/users', users);
router.patch('/users/:userId/role', updateRole);
router.get('/activity', activity);
export default router;
