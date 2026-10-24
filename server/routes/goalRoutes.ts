import { Router, Response } from 'express';
import { database, GoalStatus } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';

export const goalRouter = Router();

// Protect all goals endpoints with authentication
goalRouter.use(requireAuth);

/**
 * GET /api/goals
 * List savings goals for the authenticated user with optional filter and sort.
 */
goalRouter.get('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const filter = (typeof req.query.filter === 'string' ? req.query.filter : 'all') as any;
    const sort = (typeof req.query.sort === 'string' ? req.query.sort : 'deadline') as any;

    const goals = database.getGoals(userId, filter, sort);
    res.json({
      success: true,
      count: goals.length,
      goals,
    });
  } catch (err: any) {
    console.error('Failed to retrieve goals:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve savings goals.' });
  }
});

/**
 * GET /api/goals/summary
 * Returns aggregated savings goal metrics and counts for active user.
 */
goalRouter.get('/summary', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const summary = database.getGoalSummary(userId);
    res.json({
      success: true,
      summary,
    });
  } catch (err: any) {
    console.error('Failed to retrieve goal summary:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve savings goal summary.' });
  }
});

/**
 * GET /api/goals/:id
 * Retrieve single goal details including contributions and projection calculations.
 */
goalRouter.get('/:id', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;

    const goal = database.getGoalById(userId, goalId);
    if (!goal) {
      return res.status(404).json({ success: false, error: 'Savings goal not found.' });
    }

    res.json({
      success: true,
      goal,
    });
  } catch (err: any) {
    console.error('Failed to retrieve goal:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve goal details.' });
  }
});

/**
 * POST /api/goals
 * Create a new savings goal with validation.
 */
goalRouter.post('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      category,
      targetAmount,
      initialAmount,
      targetDate,
      description,
      color,
      icon,
      frequencyPreference,
    } = req.body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Goal name is required.' });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ success: false, error: 'Goal name must not exceed 100 characters.' });
    }

    const parsedTarget = Number(targetAmount);
    if (isNaN(parsedTarget) || !isFinite(parsedTarget) || parsedTarget <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Target amount must be a valid positive number greater than 0.',
      });
    }

    let parsedInitial = 0;
    if (initialAmount !== undefined && initialAmount !== null && initialAmount !== '') {
      parsedInitial = Number(initialAmount);
      if (isNaN(parsedInitial) || !isFinite(parsedInitial) || parsedInitial < 0) {
        return res.status(400).json({
          success: false,
          error: 'Starting amount must be 0 or a positive number.',
        });
      }
    }

    if (targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      return res.status(400).json({
        success: false,
        error: 'Target date must be a valid date in YYYY-MM-DD format.',
      });
    }

    const goal = database.createGoal(userId, {
      name,
      category: category || 'General',
      targetAmount: parsedTarget,
      initialAmount: parsedInitial,
      targetDate,
      description,
      color,
      icon,
      frequencyPreference,
    });

    res.status(201).json({
      success: true,
      goal,
      message: `Goal "${goal.name}" created successfully.`,
    });
  } catch (err: any) {
    console.error('Failed to create goal:', err);
    res.status(500).json({ success: false, error: 'Failed to create savings goal.' });
  }
});

/**
 * PUT /api/goals/:id
 * Update an existing savings goal.
 */
goalRouter.put('/:id', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;
    const updates = req.body;

    if (updates.name !== undefined) {
      if (typeof updates.name !== 'string' || updates.name.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Goal name cannot be empty.' });
      }
    }

    if (updates.targetAmount !== undefined) {
      const parsed = Number(updates.targetAmount);
      if (isNaN(parsed) || !isFinite(parsed) || parsed <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Target amount must be a positive number greater than 0.',
        });
      }
      updates.targetAmount = parsed;
    }

    if (updates.targetDate !== undefined && updates.targetDate !== '') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(updates.targetDate)) {
        return res.status(400).json({
          success: false,
          error: 'Target date must be in YYYY-MM-DD format.',
        });
      }
    }

    if (updates.status !== undefined) {
      const validStatuses: GoalStatus[] = ['active', 'completed', 'paused', 'archived'];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid goal status provided.',
        });
      }
    }

    const updated = database.updateGoal(userId, goalId, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Savings goal not found or unauthorized.' });
    }

    res.json({
      success: true,
      goal: updated,
      message: 'Savings goal updated successfully.',
    });
  } catch (err: any) {
    console.error('Failed to update goal:', err);
    res.status(500).json({ success: false, error: 'Failed to update savings goal.' });
  }
});

/**
 * DELETE /api/goals/:id
 * Delete a savings goal safely without affecting general transaction records.
 */
goalRouter.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;

    const deleted = database.deleteGoal(userId, goalId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Savings goal not found or unauthorized.' });
    }

    res.json({
      success: true,
      message: 'Savings goal deleted successfully.',
    });
  } catch (err: any) {
    console.error('Failed to delete goal:', err);
    res.status(500).json({ success: false, error: 'Failed to delete savings goal.' });
  }
});

/**
 * POST /api/goals/:id/contributions
 * Record a contribution toward a goal.
 */
goalRouter.post('/:id/contributions', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const goalId = req.params.id;
    const { amount, date, note, source } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || !isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Contribution amount must be a positive number greater than 0.',
      });
    }

    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'Contribution date must be in YYYY-MM-DD format.',
      });
    }

    const result = database.addContribution(userId, goalId, {
      amount: parsedAmount,
      date,
      note,
      source,
    });

    if (!result) {
      return res.status(404).json({ success: false, error: 'Savings goal not found or unauthorized.' });
    }

    res.status(201).json({
      success: true,
      goal: result.goal,
      contribution: result.contribution,
      message: `Contributed ₹${parsedAmount.toLocaleString('en-IN')} toward ${result.goal.name}.`,
    });
  } catch (err: any) {
    console.error('Failed to record contribution:', err);
    res.status(500).json({ success: false, error: 'Failed to record contribution.' });
  }
});

/**
 * DELETE /api/goals/:id/contributions/:contribId
 * Delete a specific contribution and recalculate progress.
 */
goalRouter.delete('/:id/contributions/:contribId', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id: goalId, contribId } = req.params;

    const updated = database.deleteContribution(userId, goalId, contribId);
    if (!updated) {
      return res.status(404).json({
        success: false,
        error: 'Contribution record not found or unauthorized.',
      });
    }

    res.json({
      success: true,
      goal: updated,
      message: 'Contribution record removed and progress recalculated.',
    });
  } catch (err: any) {
    console.error('Failed to delete contribution:', err);
    res.status(500).json({ success: false, error: 'Failed to delete contribution.' });
  }
});
