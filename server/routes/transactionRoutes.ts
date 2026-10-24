import { Router, Response } from 'express';
import { database } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';

export const transactionRouter = Router();

// Protect all transaction routes
transactionRouter.use(requireAuth);

// GET /api/transactions
transactionRouter.get('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { month, category, type, search } = req.query;

    const transactions = database.getTransactions(userId, {
      month: typeof month === 'string' ? month : undefined,
      category: typeof category === 'string' ? category : undefined,
      type: type === 'income' || type === 'expense' ? type : 'all',
      search: typeof search === 'string' ? search : undefined,
    });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err: any) {
    console.error('Failed to fetch transactions:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve transactions.' });
  }
});

// GET /api/dashboard/summary
transactionRouter.get('/summary', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const month = typeof req.query.month === 'string' ? req.query.month : '2026-10';

    const summary = database.getUserSummary(userId, month);
    res.json({
      success: true,
      summary,
    });
  } catch (err: any) {
    console.error('Failed to fetch summary:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve dashboard summary.' });
  }
});

// POST /api/transactions
transactionRouter.post('/', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { type, amount, category, date, description } = req.body;

    if (!type || (type !== 'income' && type !== 'expense')) {
      res.status(400).json({ success: false, error: 'Transaction type must be either income or expense.' });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ success: false, error: 'Amount must be a positive number greater than 0.' });
      return;
    }

    if (!category || !category.trim()) {
      res.status(400).json({ success: false, error: 'Category is required.' });
      return;
    }

    if (!date) {
      res.status(400).json({ success: false, error: 'Transaction date is required.' });
      return;
    }

    const transaction = database.createTransaction(userId, {
      type,
      amount: numAmount,
      category: category.trim(),
      date,
      description: description ? description.trim() : '',
    });

    res.status(201).json({
      success: true,
      transaction,
      message: `${type === 'income' ? 'Income' : 'Expense'} recorded successfully`,
    });
  } catch (err: any) {
    console.error('Create transaction error:', err);
    res.status(500).json({ success: false, error: 'Failed to record transaction.' });
  }
});

// PUT /api/transactions/:id
transactionRouter.put('/:id', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const txId = req.params.id;
    const { type, amount, category, date, description } = req.body;

    let parsedAmount: number | undefined;
    if (amount !== undefined) {
      parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        res.status(400).json({ success: false, error: 'Amount must be a positive number.' });
        return;
      }
    }

    const updated = database.updateTransaction(userId, txId, {
      type: type === 'income' || type === 'expense' ? type : undefined,
      amount: parsedAmount,
      category,
      date,
      description,
    });

    if (!updated) {
      res.status(404).json({ success: false, error: 'Transaction not found or unauthorized.' });
      return;
    }

    res.json({
      success: true,
      transaction: updated,
      message: 'Transaction updated successfully',
    });
  } catch (err: any) {
    console.error('Update transaction error:', err);
    res.status(500).json({ success: false, error: 'Failed to update transaction.' });
  }
});

// DELETE /api/transactions/:id
transactionRouter.delete('/:id', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const txId = req.params.id;

    const deleted = database.deleteTransaction(userId, txId);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Transaction not found or already deleted.' });
      return;
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (err: any) {
    console.error('Delete transaction error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete transaction.' });
  }
});

// GET /api/export/csv
transactionRouter.get('/export/csv', (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const transactions = database.getTransactions(userId);

    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount (INR)', 'Description'];
    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      `"${(t.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="finora_transactions_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (err: any) {
    console.error('Export CSV error:', err);
    res.status(500).json({ success: false, error: 'Failed to export CSV report.' });
  }
});
