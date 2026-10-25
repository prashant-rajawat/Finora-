import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './server/routes/authRoutes.js';
import { transactionRouter } from './server/routes/transactionRoutes.js';
import { budgetRouter } from './server/routes/budgetRoutes.js';
import { analyticsRouter } from './server/routes/analyticsRoutes.js';
import { goalRouter } from './server/routes/goalRoutes.js';
import { reportRouter } from './server/routes/reportRoutes.js';
import { settingsRouter } from './server/routes/settingsRoutes.js';
import { recurringRouter } from './server/routes/recurringRoutes.js';
import { notificationRouter } from './server/routes/notificationRoutes.js';
import { insightRouter } from './server/routes/insightRoutes.js';
import { database } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Mount API endpoints
  app.use('/api/auth', authRouter);
  app.use('/api/transactions', transactionRouter);
  app.use('/api/budgets', budgetRouter);
  app.use('/api/analytics', analyticsRouter);
  app.use('/api/goals', goalRouter);
  app.use('/api/reports', reportRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/recurring-transactions', recurringRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/insights', insightRouter);

  // Background Scheduler Engine - runs on startup and every 60 seconds
  try {
    const initProcess = database.processDueRecurringSchedules();
    database.generateFinancialNotifications('usr_ansh_kumar_001');
    if (initProcess.generatedTransactionsCount > 0) {
      console.log(`[Scheduler] Startup process generated ${initProcess.generatedTransactionsCount} transaction(s).`);
    }
  } catch (err) {
    console.error('[Scheduler] Initial run error:', err);
  }

  setInterval(() => {
    try {
      database.processDueRecurringSchedules();
      database.generateFinancialNotifications('usr_ansh_kumar_001');
    } catch (err) {
      console.error('[Scheduler] Periodic run error:', err);
    }
  }, 60000);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'Finora — Personal Finance Tracker', time: new Date().toISOString() });
  });

  if (!isProd) {
    // Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Finora server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
