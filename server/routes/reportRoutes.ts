import { Router, Response } from 'express';
import { database } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';

export const reportRouter = Router();

// Protect all report routes
reportRouter.use(requireAuth);

function sanitizeCsvField(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);
  // Prevent formula injection: if starts with =, +, -, @, prefix with a single quote or space
  let safeStr = str;
  if (/^[=+\-@\t\r]/.test(safeStr)) {
    safeStr = `'${safeStr}`;
  }
  return `"${safeStr.replace(/"/g, '""')}"`;
}

// GET /api/reports/summary?period=this_month&startDate=...&endDate=...
reportRouter.get('/summary', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const periodPreset = (typeof req.query.period === 'string' ? req.query.period : 'this_month') as any;
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;

    const analytics = database.getAnalyticsData(userId, { periodPreset, startDate, endDate });
    const transactions = database.getTransactions(userId, { startDate, endDate });
    const budgets = database.getBudgets(userId, startDate && startDate.startsWith('2026') ? startDate.slice(0, 7) : '2026-10');
    const goalsSummary = database.getGoalSummary(userId);
    const goals = database.getGoals(userId);

    res.json({
      success: true,
      report: {
        analytics,
        transactions,
        budgets,
        goalsSummary,
        goals,
      },
    });
  } catch (err: any) {
    console.error('Failed to generate report summary:', err);
    res.status(500).json({ success: false, error: 'Failed to generate financial report summary.' });
  }
});

// GET /api/reports/transactions
reportRouter.get('/transactions', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, category, type, search } = req.query;

    const transactions = database.getTransactions(userId, {
      startDate: typeof startDate === 'string' ? startDate : undefined,
      endDate: typeof endDate === 'string' ? endDate : undefined,
      category: typeof category === 'string' ? category : undefined,
      type: type === 'income' || type === 'expense' ? type : 'all',
      search: typeof search === 'string' ? search : undefined,
    });

    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({
      success: true,
      count: transactions.length,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netCashFlow: Math.round((totalIncome - totalExpenses) * 100) / 100,
      transactions,
    });
  } catch (err: any) {
    console.error('Failed to generate transaction report:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve transaction report.' });
  }
});

// GET /api/reports/export/csv
reportRouter.get('/export/csv', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const reportType = (typeof req.query.type === 'string' ? req.query.type : 'transactions') as string;
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const type = typeof req.query.type_filter === 'string' ? req.query.type_filter : 'all';

    let csvContent = '';
    let filename = `finora-${reportType}-report-${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'transactions' || reportType === 'all') {
      const txs = database.getTransactions(userId, {
        startDate,
        endDate,
        category,
        type: type as any,
      });

      const headers = ['ID', 'Date', 'Type', 'Category', 'Payment Method', 'Merchant', 'Amount (INR)', 'Description'];
      const rows = txs.map((t) => [
        sanitizeCsvField(t.id),
        sanitizeCsvField(t.date),
        sanitizeCsvField(t.type),
        sanitizeCsvField(t.category),
        sanitizeCsvField(t.paymentMethod),
        sanitizeCsvField(t.merchant),
        t.amount.toFixed(2),
        sanitizeCsvField(t.description),
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      filename = `finora-transaction-report-${startDate || 'all'}.csv`;
    } else if (reportType === 'budgets') {
      const period = startDate && startDate.startsWith('2026') ? startDate.slice(0, 7) : '2026-10';
      const budgets = database.getBudgets(userId, period);

      const headers = ['Budget Name', 'Type', 'Category', 'Allocated (INR)', 'Spent (INR)', 'Remaining (INR)', 'Utilization (%)', 'Status'];
      const rows = budgets.map((b) => [
        sanitizeCsvField(b.name),
        sanitizeCsvField(b.type),
        sanitizeCsvField(b.category || 'Overall'),
        b.amount.toFixed(2),
        b.spent.toFixed(2),
        b.remaining.toFixed(2),
        `${b.percentage}%`,
        sanitizeCsvField(b.status),
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      filename = `finora-budget-performance-report-${period}.csv`;
    } else if (reportType === 'goals') {
      const goals = database.getGoals(userId);

      const headers = ['Goal Name', 'Category', 'Target Amount (INR)', 'Saved Amount (INR)', 'Remaining (INR)', 'Progress (%)', 'Status', 'Target Date'];
      const rows = goals.map((g) => [
        sanitizeCsvField(g.name),
        sanitizeCsvField(g.category),
        g.targetAmount.toFixed(2),
        g.savedAmount.toFixed(2),
        g.remainingAmount.toFixed(2),
        `${g.progressPercentage}%`,
        sanitizeCsvField(g.status),
        sanitizeCsvField(g.targetDate || 'No deadline'),
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      filename = `finora-savings-goals-report.csv`;
    } else {
      // Default income & expense summary report
      const analytics = database.getAnalyticsData(userId, { startDate, endDate });
      const headers = ['Category', 'Type', 'Amount (INR)', 'Percentage (%)', 'Transaction Count'];
      const rows = analytics.categoryBreakdown.map((c) => [
        sanitizeCsvField(c.category),
        'Expense',
        c.amount.toFixed(2),
        `${c.percentage}%`,
        c.transactionCount,
      ]);

      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      filename = `finora-income-expense-report.csv`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (err: any) {
    console.error('CSV export error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate CSV export.' });
  }
});
