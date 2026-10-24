import { Router, Response } from 'express';
import { database } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';

export const analyticsRouter = Router();

// Require user authentication for all analytics endpoints
analyticsRouter.use(requireAuth);

/**
 * GET /api/analytics
 * Returns comprehensive financial analytics, time-series data, category breakdowns,
 * month-to-month comparisons, spending trends, and deterministic smart insights.
 */
analyticsRouter.get('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const periodPreset = (typeof req.query.period === 'string'
      ? req.query.period
      : typeof req.query.preset === 'string'
      ? req.query.preset
      : 'this_month') as any;

    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;

    // Validate custom dates if provided
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return res.status(400).json({ success: false, error: 'startDate must be in YYYY-MM-DD format.' });
    }
    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return res.status(400).json({ success: false, error: 'endDate must be in YYYY-MM-DD format.' });
    }

    if (startDate && endDate && startDate > endDate) {
      return res.status(400).json({
        success: false,
        error: 'startDate must be earlier than or equal to endDate.',
      });
    }

    const analytics = database.getAnalyticsData(userId, {
      periodPreset,
      startDate,
      endDate,
    });

    res.json({
      success: true,
      analytics,
    });
  } catch (err: any) {
    console.error('Failed to compute analytics:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to generate financial analytics.',
    });
  }
});
