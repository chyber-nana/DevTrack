import express from 'express';
import cors from 'cors';
import studyDayRoutes from './routes/studyDayRoutes.js';
import authRoutes from './routes/authRoutes.js';
import completionRoutes from './routes/completionRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import passwordRoutes from './routes/passwordRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { sql } from './database/sql.js';

const app = express();

const envOrigins = (process.env.FRONTEND_URL ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  'http://localhost:5501',
  'http://127.0.0.1:5501',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...envOrigins,
];

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({ message: 'DevTrack API is running 🚀', version: '2.0.0' });
});

app.get('/api/health', async (_req, res) => {
  try {
    await sql.query('SELECT 1');
    res.json({ success: true, status: 'ok', database: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ success: false, status: 'degraded', database: 'unavailable', timestamp: new Date().toISOString() });
  }
});

app.use('/api/study-days', studyDayRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;
