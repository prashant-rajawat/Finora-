import { Router, Response } from 'express';
import { database } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';
import { AnalyticsPeriodPreset, ForecastHorizon } from '../../src/types.js';

export const insightRouter = Router();

// Protect all insights endpoints
insightRouter.use(requireAuth);

// GET /api/insights - Full composite insights data
insightRouter.get('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { periodPreset, forecastHorizon } = req.query;

    const insights = database.getFinancialInsights(userId, {
      periodPreset: typeof periodPreset === 'string' ? (periodPreset as AnalyticsPeriodPreset) : 'this_month',
      forecastHorizon: typeof forecastHorizon === 'string' ? (forecastHorizon as ForecastHorizon) : '30d',
    });

    res.json({
      success: true,
      insights,
    });
  } catch (err: any) {
    console.error('Failed to fetch financial insights:', err);
    res.status(500).json({ error: 'Failed to fetch financial insights' });
  }
});

// Sub-resource endpoints for modular fetching
insightRouter.get('/overview', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { periodPreset } = req.query;
    const insights = database.getFinancialInsights(userId, {
      periodPreset: typeof periodPreset === 'string' ? (periodPreset as AnalyticsPeriodPreset) : 'this_month',
    });
    res.json({ success: true, overview: insights.healthOverview });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch financial health overview' });
  }
});

insightRouter.get('/cash-flow', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { periodPreset, forecastHorizon } = req.query;
    const insights = database.getFinancialInsights(userId, {
      periodPreset: typeof periodPreset === 'string' ? (periodPreset as AnalyticsPeriodPreset) : 'this_month',
      forecastHorizon: typeof forecastHorizon === 'string' ? (forecastHorizon as ForecastHorizon) : '30d',
    });
    res.json({ success: true, cashFlowForecast: insights.cashFlowForecast });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch cash-flow forecast' });
  }
});

insightRouter.get('/spending-trends', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { periodPreset } = req.query;
    const insights = database.getFinancialInsights(userId, {
      periodPreset: typeof periodPreset === 'string' ? (periodPreset as AnalyticsPeriodPreset) : 'this_month',
    });
    res.json({ success: true, spendingTrends: insights.spendingTrends });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch spending trends' });
  }
});

insightRouter.get('/budget-forecasts', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { periodPreset } = req.query;
    const insights = database.getFinancialInsights(userId, {
      periodPreset: typeof periodPreset === 'string' ? (periodPreset as AnalyticsPeriodPreset) : 'this_month',
    });
    res.json({ success: true, budgetForecasts: insights.budgetForecasts });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch budget forecasts' });
  }
});

insightRouter.get('/savings-projections', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { periodPreset } = req.query;
    const insights = database.getFinancialInsights(userId, {
      periodPreset: typeof periodPreset === 'string' ? (periodPreset as AnalyticsPeriodPreset) : 'this_month',
    });
    res.json({ success: true, savingsProjections: insights.savingsProjections });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch savings goal projections' });
  }
});

insightRouter.get('/unusual-spending', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { periodPreset } = req.query;
    const insights = database.getFinancialInsights(userId, {
      periodPreset: typeof periodPreset === 'string' ? (periodPreset as AnalyticsPeriodPreset) : 'this_month',
    });
    res.json({ success: true, unusualSpending: insights.unusualSpending });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch unusual spending signals' });
  }
});

insightRouter.get('/recommendations', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { periodPreset } = req.query;
    const insights = database.getFinancialInsights(userId, {
      periodPreset: typeof periodPreset === 'string' ? (periodPreset as AnalyticsPeriodPreset) : 'this_month',
    });
    res.json({ success: true, recommendations: insights.recommendations });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});
