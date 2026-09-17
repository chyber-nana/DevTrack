import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { sql } from '../database/sql.js';

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const result = await sql.query(`SELECT "passwordHash" FROM "user" WHERE id = $1`, [userId]);
  const user = result.rows[0];
  if (!user) throw new Error('USER_NOT_FOUND');

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new Error('INVALID_CURRENT_PASSWORD');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await sql.query(`UPDATE "user" SET "passwordHash" = $2, "updatedAt" = now() WHERE id = $1`, [userId, passwordHash]);
}

export async function createPasswordReset(email: string) {
  const userResult = await sql.query(`SELECT id, email, name FROM "user" WHERE lower(email) = lower($1)`, [email]);
  if (!userResult.rowCount) return null;
  const user = userResult.rows[0];

  await sql.query(`DELETE FROM "passwordResetToken" WHERE "userId" = $1 OR "expiresAt" < now()`, [user.id]);

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  await sql.query(
    `INSERT INTO "passwordResetToken" ("userId", token_hash, "expiresAt")
     VALUES ($1, $2, now() + interval '30 minutes')`,
    [user.id, tokenHash],
  );

  return { user, token: rawToken };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);
  const result = await sql.query(
    `SELECT id, "userId" FROM "passwordResetToken"
     WHERE token_hash = $1 AND "usedAt" IS NULL AND "expiresAt" > now()`,
    [tokenHash],
  );
  if (!result.rowCount) throw new Error('INVALID_RESET_TOKEN');

  const record = result.rows[0];
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const client = await sql.connect();
  try {
    await client.query('BEGIN');
    await client.query(`UPDATE "user" SET "passwordHash" = $2, "updatedAt" = now() WHERE id = $1`, [record.userId, passwordHash]);
    await client.query(`UPDATE "passwordResetToken" SET "usedAt" = now() WHERE id = $1`, [record.id]);
    await client.query(`DELETE FROM "passwordResetToken" WHERE "userId" = $1 AND id <> $2`, [record.userId, record.id]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function sendResetEmail(email: string, name: string | null, rawToken: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!apiKey || !from || !frontendUrl) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Password reset token for ${email}: ${rawToken}`);
    }
    return false;
  }

  const link = `${frontendUrl.replace(/\/$/, '')}/?resetToken=${encodeURIComponent(rawToken)}`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Reset your DevTrack password',
      html: `<p>Hello ${name || 'there'},</p><p>Use this link to reset your DevTrack password:</p><p><a href="${link}">${link}</a></p><p>This link expires in 30 minutes.</p>`,
    }),
  });

  if (!response.ok) {
    throw new Error('RESET_EMAIL_FAILED');
  }

  return true;
}
