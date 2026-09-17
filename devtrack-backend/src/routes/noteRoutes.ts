import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getDailyNote, listNotes, removeDailyNote, saveDailyNote } from '../controllers/noteController.js';

const router = Router();
router.get('/', authenticate, listNotes);
router.get('/:studyDayId', authenticate, getDailyNote);
router.put('/:studyDayId', authenticate, saveDailyNote);
router.delete('/:studyDayId', authenticate, removeDailyNote);
export default router;
