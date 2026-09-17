import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { deleteNote, getNote, getNotes, upsertNote } from '../services/noteService.js';

export async function listNotes(req: AuthenticatedRequest, res: Response) {
  try {
    const notes = await getNotes(req.user!.userId);
    res.json({ success: true, count: notes.length, data: notes });
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notes' });
  }
}

export async function getDailyNote(req: AuthenticatedRequest, res: Response) {
  const studyDayId = Number(req.params.studyDayId);
  if (Number.isNaN(studyDayId)) return res.status(400).json({ success: false, message: 'Invalid study day ID' });
  try {
    const note = await getNote(req.user!.userId, studyDayId);
    res.json({ success: true, data: note });
  } catch (error) {
    console.error('Failed to fetch note:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch note' });
  }
}

export async function saveDailyNote(req: AuthenticatedRequest, res: Response) {
  const studyDayId = Number(req.params.studyDayId);
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
  if (Number.isNaN(studyDayId)) return res.status(400).json({ success: false, message: 'Invalid study day ID' });
  if (content.length > 20_000) return res.status(400).json({ success: false, message: 'Note is too long' });
  try {
    const note = await upsertNote(req.user!.userId, studyDayId, content);
    res.status(200).json({ success: true, message: 'Note saved', data: note });
  } catch (error) {
    if (error instanceof Error && error.message === 'STUDY_DAY_NOT_FOUND') {
      return res.status(404).json({ success: false, message: 'Study day not found' });
    }
    console.error('Failed to save note:', error);
    res.status(500).json({ success: false, message: 'Failed to save note' });
  }
}

export async function removeDailyNote(req: AuthenticatedRequest, res: Response) {
  const studyDayId = Number(req.params.studyDayId);
  if (Number.isNaN(studyDayId)) return res.status(400).json({ success: false, message: 'Invalid study day ID' });
  try {
    const deleted = await deleteNote(req.user!.userId, studyDayId);
    if (!deleted) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Failed to delete note:', error);
    res.status(500).json({ success: false, message: 'Failed to delete note' });
  }
}
