import 'dotenv/config';
import app from './app.js';
import { ensureDatabase } from './database/setup.js';
import { runReminderSweep } from './services/reminderScheduler.js';

const PORT = Number(process.env.PORT) || 5000;

async function start() {
  try {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');

    await ensureDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 DevTrack API running on port ${PORT}`);
    });

    await runReminderSweep();
    setInterval(() => {
      void runReminderSweep();
    }, 60 * 60 * 1000);
  } catch (error) {
    console.error('❌ Failed to start DevTrack API:', error);
    process.exit(1);
  }
}

start();
