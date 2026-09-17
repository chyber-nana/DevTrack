import { sql } from '../database/sql.js';
import { createDueReminder } from './notificationService.js';

export async function runReminderSweep() {
  const result = await sql.query(
    `SELECT "userId" FROM "notificationPreference" WHERE enabled = true`,
  );

  for (const row of result.rows) {
    try {
      await createDueReminder(Number(row.userId));
    } catch (error) {
      console.error(`Reminder sweep failed for user ${row.userId}:`, error);
    }
  }
}
