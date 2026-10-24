import { Router, Request, Response } from 'express';
import { database, RecurrenceFrequency } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';

export const recurringRouter = Router();

// List user's recurring schedules
recurringRouter.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { status, type, frequency, search } = req.query;

    const schedules = database.getRecurringSchedules(userId, {
      status: status as string,
      type: type as string,
      frequency: frequency as string,
      search: search as string,
    });

    res.json({ success: true, schedules });
  } catch (err: any) {
    console.error('Get recurring schedules error:', err);
    res.status(500).json({ error: 'Failed to fetch recurring schedules' });
  }
});

// Summary cards & estimated totals
recurringRouter.get('/summary', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const summary = database.getRecurringSummary(userId);
    res.json({ success: true, summary });
  } catch (err: any) {
    console.error('Get recurring summary error:', err);
    res.status(500).json({ error: 'Failed to fetch recurring summary' });
  }
});

// Upcoming projected schedule occurrences
recurringRouter.get('/upcoming', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const daysAhead = parseInt(req.query.days as string, 10) || 30;
    const upcoming = database.getUpcomingOccurrences(userId, daysAhead);
    res.json({ success: true, upcoming });
  } catch (err: any) {
    console.error('Get upcoming occurrences error:', err);
    res.status(500).json({ error: 'Failed to fetch upcoming occurrences' });
  }
});

// Get single schedule details and history
recurringRouter.get('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const scheduleId = req.params.id;

    const schedule = database.getRecurringScheduleById(userId, scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Recurring schedule not found' });
    }

    const occurrences = database.getScheduleOccurrences(userId, scheduleId);

    res.json({ success: true, schedule, history: occurrences });
  } catch (err: any) {
    console.error('Get schedule details error:', err);
    res.status(500).json({ error: 'Failed to fetch schedule details' });
  }
});

// Create new recurring schedule
recurringRouter.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      type,
      amount,
      category,
      frequency,
      startDate,
      endDate,
      maxOccurrences,
      dayOfWeek,
      dayOfMonth,
      paymentMethod,
      merchant,
      notes,
    } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Recurring transaction name is required' });
    }

    if (type !== 'income' && type !== 'expense') {
      return res.status(400).json({ error: 'Transaction type must be income or expense' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Target amount must be a positive number greater than zero' });
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const validFrequencies: RecurrenceFrequency[] = [
      'daily',
      'weekly',
      'biweekly',
      'monthly',
      'quarterly',
      'semiannual',
      'yearly',
    ];

    if (!frequency || !validFrequencies.includes(frequency as RecurrenceFrequency)) {
      return res.status(400).json({ error: `Frequency must be one of: ${validFrequencies.join(', ')}` });
    }

    if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return res.status(400).json({ error: 'Valid start date (YYYY-MM-DD) is required' });
    }

    if (endDate) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({ error: 'End date must be in YYYY-MM-DD format' });
      }
      if (endDate < startDate) {
        return res.status(400).json({ error: 'End date cannot be prior to start date' });
      }
    }

    const schedule = database.createRecurringSchedule(userId, {
      name: name.trim(),
      type,
      amount: numAmount,
      category: category.trim(),
      frequency: frequency as RecurrenceFrequency,
      startDate,
      endDate: endDate || undefined,
      maxOccurrences: maxOccurrences ? parseInt(maxOccurrences, 10) : undefined,
      dayOfWeek: dayOfWeek !== undefined ? parseInt(dayOfWeek, 10) : undefined,
      dayOfMonth: dayOfMonth !== undefined ? parseInt(dayOfMonth, 10) : undefined,
      paymentMethod,
      merchant,
      notes,
    });

    res.status(201).json({
      success: true,
      schedule,
      message: `Recurring schedule "${schedule.name}" created successfully.`,
    });
  } catch (err: any) {
    console.error('Create recurring schedule error:', err);
    res.status(500).json({ error: 'Failed to create recurring schedule' });
  }
});

// Update recurring schedule
recurringRouter.patch('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const scheduleId = req.params.id;

    const existing = database.getRecurringScheduleById(userId, scheduleId);
    if (!existing) {
      return res.status(404).json({ error: 'Recurring schedule not found' });
    }

    const {
      name,
      type,
      amount,
      category,
      frequency,
      startDate,
      endDate,
      maxOccurrences,
      paymentMethod,
      merchant,
      notes,
      status,
    } = req.body;

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }
    }

    if (endDate && startDate && endDate < startDate) {
      return res.status(400).json({ error: 'End date cannot precede start date' });
    }

    const updated = database.updateRecurringSchedule(userId, scheduleId, {
      name,
      type,
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      category,
      frequency,
      startDate,
      endDate,
      maxOccurrences: maxOccurrences !== undefined ? parseInt(maxOccurrences, 10) : undefined,
      paymentMethod,
      merchant,
      notes,
      status,
    });

    res.json({
      success: true,
      schedule: updated,
      message: 'Recurring schedule updated successfully.',
    });
  } catch (err: any) {
    console.error('Update recurring schedule error:', err);
    res.status(500).json({ error: 'Failed to update recurring schedule' });
  }
});

// Pause schedule
recurringRouter.post('/:id/pause', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const scheduleId = req.params.id;

    const paused = database.pauseRecurringSchedule(userId, scheduleId);
    if (!paused) {
      return res.status(404).json({ error: 'Recurring schedule not found' });
    }

    res.json({
      success: true,
      schedule: paused,
      message: `Schedule "${paused.name}" has been paused.`,
    });
  } catch (err: any) {
    console.error('Pause schedule error:', err);
    res.status(500).json({ error: 'Failed to pause schedule' });
  }
});

// Resume schedule
recurringRouter.post('/:id/resume', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const scheduleId = req.params.id;

    const resumed = database.resumeRecurringSchedule(userId, scheduleId);
    if (!resumed) {
      return res.status(404).json({ error: 'Recurring schedule not found' });
    }

    res.json({
      success: true,
      schedule: resumed,
      message: `Schedule "${resumed.name}" resumed.`,
    });
  } catch (err: any) {
    console.error('Resume schedule error:', err);
    res.status(500).json({ error: 'Failed to resume schedule' });
  }
});

// Cancel schedule
recurringRouter.post('/:id/cancel', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const scheduleId = req.params.id;

    const cancelled = database.cancelRecurringSchedule(userId, scheduleId);
    if (!cancelled) {
      return res.status(404).json({ error: 'Recurring schedule not found' });
    }

    res.json({
      success: true,
      schedule: cancelled,
      message: `Future occurrences for "${cancelled.name}" cancelled. Generated transactions remain intact.`,
    });
  } catch (err: any) {
    console.error('Cancel schedule error:', err);
    res.status(500).json({ error: 'Failed to cancel schedule' });
  }
});

// Delete schedule
recurringRouter.delete('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const scheduleId = req.params.id;

    const deleted = database.deleteRecurringSchedule(userId, scheduleId);
    if (!deleted) {
      return res.status(404).json({ error: 'Recurring schedule not found' });
    }

    res.json({
      success: true,
      message: 'Recurring schedule deleted. Generated historical transactions are preserved.',
    });
  } catch (err: any) {
    console.error('Delete schedule error:', err);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// Trigger backend scheduler execution
recurringRouter.post('/process-scheduler', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const schedulerSecret = process.env.SCHEDULER_SECRET || 'finora_internal_scheduler_secret_2026';

    // Allow authenticated users OR header with scheduler secret
    const isSecretValid = authHeader && (authHeader === `Bearer ${schedulerSecret}` || authHeader === schedulerSecret);
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!isSecretValid && !token) {
      return res.status(401).json({ error: 'Unauthorized scheduler trigger' });
    }

    const { asOfDate } = req.body || {};
    const result = database.processDueRecurringSchedules(asOfDate);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (err: any) {
    console.error('Scheduler processing error:', err);
    res.status(500).json({ error: 'Scheduler execution failed' });
  }
});
