import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { changePassword, createPasswordReset, resetPassword, sendResetEmail } from '../services/passwordService.js';

function validPassword(value: unknown): value is string {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128;
}

export async function changePasswordController(req: AuthenticatedRequest, res: Response) {
  const currentPassword = req.body?.currentPassword;
  const newPassword = req.body?.newPassword;
  if (!validPassword(currentPassword) || !validPassword(newPassword)) return res.status(400).json({ success: false, message: 'Passwords must be 8–128 characters' });
  if (currentPassword === newPassword) return res.status(400).json({ success: false, message: 'New password must differ from current password' });
  try {
    await changePassword(req.user!.userId, currentPassword, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CURRENT_PASSWORD') return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    console.error('Failed to change password:', error); res.status(500).json({ success: false, message: 'Failed to change password' });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });
  try {
    const reset = await createPasswordReset(email);
    if (reset) {
      const sent = await sendResetEmail(reset.user.email, reset.user.name, reset.token);
      if (!sent && process.env.NODE_ENV !== 'production') {
        return res.json({ success: true, message: 'If the account exists, reset instructions are available.', developmentToken: reset.token });
      }
    }
    res.json({ success: true, message: 'If that email is registered, password reset instructions have been sent.' });
  } catch (error) {
    console.error('Failed to create password reset:', error);
    res.status(500).json({ success: false, message: 'Unable to process password reset request' });
  }
}

export async function resetPasswordController(req: Request, res: Response) {
  const token = typeof req.body?.token === 'string' ? req.body.token : '';
  const newPassword = req.body?.newPassword;
  if (!token || !validPassword(newPassword)) return res.status(400).json({ success: false, message: 'Valid token and new password are required' });
  try {
    await resetPassword(token, newPassword);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_RESET_TOKEN') return res.status(400).json({ success: false, message: 'Reset token is invalid or expired' });
    console.error('Failed to reset password:', error); res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
}
