import { Router, Response } from 'express';
import { database, BudgetType } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';

export const budgetRouter = Router();

// Protect all budget routes with authentication
budgetRouter.use(requireAuth);

// GET /api/budgets
budgetRouter.get('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const period = typeof req.query.month === 'string'
      ? req.query.month
      : typeof req.query.period === 'string'
      ? req.query.period
      : '2026-10';

    const budgets = database.getBudgets(userId, period);
    res.json({
      success: true,
      count: budgets.length,
      budgets,
    });
  } catch (err: any) {
    console.error('Failed to fetch budgets:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve budgets.' });
  }
});

// GET /api/budgets/summary
budgetRouter.get('/summary', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const period = typeof req.query.month === 'string'
      ? req.query.month
      : typeof req.query.period === 'string'
      ? req.query.period
      : '2026-10';

    const summary = database.getBudgetSummary(userId, period);
    res.json({
      success: true,
      summary,
    });
  } catch (err: any) {
    console.error('Failed to fetch budget summary:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve budget summary.' });
  }
});

// GET /api/budgets/:id
budgetRouter.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const budgetId = req.params.id;

    const result = database.getBudgetById(userId, budgetId);
    if (!result) {
      res.status(404).json({ success: false, error: 'Budget not found or unauthorized.' });
      return;
    }

    res.json({
      success: true,
      budget: result.budget,
      transactions: result.transactions,
    });
  } catch (err: any) {
    console.error('Failed to retrieve budget details:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve budget details.' });
  }
});

// POST /api/budgets
budgetRouter.post('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, type, category, amount, period, notes, alertThreshold } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: 'Budget name is required.' });
      return;
    }

    if (!type || (type !== 'category' && type !== 'overall')) {
      res.status(400).json({ success: false, error: 'Budget type must be either category or overall.' });
      return;
    }

    if (type === 'category' && (!category || !category.trim())) {
      res.status(400).json({ success: false, error: 'Category is required for category-specific budgets.' });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
      res.status(400).json({ success: false, error: 'Budget amount must be a positive number greater than 0.' });
      return;
    }

    const cleanPeriod = (typeof period === 'string' && period.trim()) ? period.trim() : '2026-10';

    // Prevent duplicate budgets for the same category and period
    const existingBudgets = database.getBudgets(userId, cleanPeriod);
    if (type === 'category') {
      const isDuplicate = existingBudgets.some(
        (b) => b.type === 'category' && b.category?.toLowerCase() === category.trim().toLowerCase()
      );
      if (isDuplicate) {
        res.status(409).json({
          success: false,
          error: `A budget for category "${category}" already exists for ${cleanPeriod}.`,
        });
        return;
      }
    } else if (type === 'overall') {
      const hasOverall = existingBudgets.some((b) => b.type === 'overall');
      if (hasOverall) {
        res.status(409).json({
          success: false,
          error: `An overall budget already exists for ${cleanPeriod}.`,
        });
        return;
      }
    }

    const parsedThreshold = alertThreshold ? parseInt(alertThreshold, 10) : 90;

    const newBudget = database.createBudget(userId, {
      name: name.trim(),
      type: type as BudgetType,
      category: type === 'category' ? category.trim() : undefined,
      amount: numAmount,
      period: cleanPeriod,
      notes: notes ? notes.trim() : undefined,
      alertThreshold: parsedThreshold > 0 && parsedThreshold <= 100 ? parsedThreshold : 90,
    });

    res.status(201).json({
      success: true,
      budget: newBudget,
      message: 'Budget created successfully',
    });
  } catch (err: any) {
    console.error('Create budget error:', err);
    res.status(500).json({ success: false, error: 'Failed to create budget.' });
  }
});

// PUT /api/budgets/:id
budgetRouter.put('/:id', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const budgetId = req.params.id;
    const { name, type, category, amount, period, notes, alertThreshold } = req.body;

    let parsedAmount: number | undefined;
    if (amount !== undefined) {
      parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ success: false, error: 'Amount must be a positive number.' });
        return;
      }
    }

    let parsedThreshold: number | undefined;
    if (alertThreshold !== undefined) {
      parsedThreshold = parseInt(alertThreshold, 10);
      if (isNaN(parsedThreshold) || parsedThreshold <= 0 || parsedThreshold > 100) {
        parsedThreshold = 90;
      }
    }

    const updated = database.updateBudget(userId, budgetId, {
      name: name ? name.trim() : undefined,
      type: type === 'category' || type === 'overall' ? type : undefined,
      category,
      amount: parsedAmount,
      period,
      notes,
      alertThreshold: parsedThreshold,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'Budget not found or unauthorized.' });
      return;
    }

    res.json({
      success: true,
      budget: updated,
      message: 'Budget updated successfully',
    });
  } catch (err: any) {
    console.error('Update budget error:', err);
    res.status(500).json({ success: false, error: 'Failed to update budget.' });
  }
});

// DELETE /api/budgets/:id
budgetRouter.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const budgetId = req.params.id;

    const deleted = database.deleteBudget(userId, budgetId);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Budget not found or already deleted.' });
      return;
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully. Transactions remain untouched.',
    });
  } catch (err: any) {
    console.error('Delete budget error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete budget.' });
  }
});
