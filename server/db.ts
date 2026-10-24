import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
  paymentMethod?: string;
  merchant?: string;
  createdAt: string;
  updatedAt: string;
}

export type BudgetType = 'category' | 'overall';

export interface Budget {
  id: string;
  userId: string;
  name: string;
  type: BudgetType;
  category?: string;
  amount: number;
  period: string; // e.g. "2026-10" or "all"
  notes?: string;
  alertThreshold: number; // e.g. 50, 75, 90, 100
  createdAt: string;
  updatedAt: string;
}

export interface BudgetWithCalculations extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'on_track' | 'warning' | 'near_limit' | 'over_budget';
  transactionCount: number;
}

interface DatabaseSchema {
  users: User[];
  transactions: Transaction[];
  budgets: Budget[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'finora_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache synced with disk
let db: DatabaseSchema = {
  users: [],
  transactions: [],
  budgets: [],
};

// Seed initial data for demo user matching the reference design: Ansh Kumar
function seedInitialData() {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);

  const demoUser: User = {
    id: 'usr_ansh_kumar_001',
    fullName: 'Ansh Kumar',
    email: 'ansh@example.com',
    passwordHash: defaultPasswordHash,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-10-24T00:00:00.000Z',
  };

  // Transactions precisely reproducing the reference image (Total Income: 45,000, Total Expenses: 28,450, Balance: 16,550)
  const initialTransactions: Transaction[] = [
    {
      id: 'tx_01',
      userId: demoUser.id,
      type: 'expense',
      amount: 450,
      category: 'Food & Dining',
      date: '2026-10-15',
      description: 'Zomato dinner',
      createdAt: '2026-10-15T19:30:00.000Z',
      updatedAt: '2026-10-15T19:30:00.000Z',
    },
    {
      id: 'tx_02',
      userId: demoUser.id,
      type: 'expense',
      amount: 320,
      category: 'Transport',
      date: '2026-10-12',
      description: 'Uber ride',
      createdAt: '2026-10-12T09:15:00.000Z',
      updatedAt: '2026-10-12T09:15:00.000Z',
    },
    {
      id: 'tx_03',
      userId: demoUser.id,
      type: 'expense',
      amount: 1200,
      category: 'Utilities',
      date: '2026-10-10',
      description: 'Electricity Bill',
      createdAt: '2026-10-10T14:00:00.000Z',
      updatedAt: '2026-10-10T14:00:00.000Z',
    },
    {
      id: 'tx_04',
      userId: demoUser.id,
      type: 'expense',
      amount: 2450,
      category: 'Shopping',
      date: '2026-10-06',
      description: 'Shopping at mall',
      createdAt: '2026-10-06T16:20:00.000Z',
      updatedAt: '2026-10-06T16:20:00.000Z',
    },
    {
      id: 'tx_05',
      userId: demoUser.id,
      type: 'income',
      amount: 40000,
      category: 'Salary',
      date: '2026-10-01',
      description: 'Monthly Salary Credit',
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 'tx_06',
      userId: demoUser.id,
      type: 'income',
      amount: 5000,
      category: 'Freelance',
      date: '2026-10-02',
      description: 'Freelance UI Design project',
      createdAt: '2026-10-02T12:00:00.000Z',
      updatedAt: '2026-10-02T12:00:00.000Z',
    },
    // Additional realistic breakdown to total 28,450 in expenses matching category percentages:
    // Food (~9,104): 450 + 8654
    {
      id: 'tx_07',
      userId: demoUser.id,
      type: 'expense',
      amount: 8654,
      category: 'Food & Dining',
      date: '2026-10-04',
      description: 'Monthly Groceries & Dining',
      createdAt: '2026-10-04T11:00:00.000Z',
      updatedAt: '2026-10-04T11:00:00.000Z',
    },
    // Transport (~5,690): 320 + 5370
    {
      id: 'tx_08',
      userId: demoUser.id,
      type: 'expense',
      amount: 5370,
      category: 'Transport',
      date: '2026-10-08',
      description: 'Fuel & Metro passes',
      createdAt: '2026-10-08T18:00:00.000Z',
      updatedAt: '2026-10-08T18:00:00.000Z',
    },
    // Shopping (~4,268): 2450 + 1818
    {
      id: 'tx_09',
      userId: demoUser.id,
      type: 'expense',
      amount: 1818,
      category: 'Shopping',
      date: '2026-10-14',
      description: 'Electronics & Home supplies',
      createdAt: '2026-10-14T15:30:00.000Z',
      updatedAt: '2026-10-14T15:30:00.000Z',
    },
    // Bills & Utilities (~3,414): 1200 + 2214
    {
      id: 'tx_10',
      userId: demoUser.id,
      type: 'expense',
      amount: 2214,
      category: 'Bills & Utilities',
      date: '2026-10-11',
      description: 'Water & Broadband bills',
      createdAt: '2026-10-11T08:00:00.000Z',
      updatedAt: '2026-10-11T08:00:00.000Z',
    },
    // Entertainment (~2,276):
    {
      id: 'tx_11',
      userId: demoUser.id,
      type: 'expense',
      amount: 2276,
      category: 'Entertainment',
      date: '2026-10-13',
      description: 'Cinema & Streaming subscriptions',
      createdAt: '2026-10-13T20:00:00.000Z',
      updatedAt: '2026-10-13T20:00:00.000Z',
    },
    // Others (~3,698):
    {
      id: 'tx_12',
      userId: demoUser.id,
      type: 'expense',
      amount: 3698,
      category: 'Others',
      date: '2026-10-05',
      description: 'Healthcare & Personal Care',
      createdAt: '2026-10-05T17:00:00.000Z',
      updatedAt: '2026-10-05T17:00:00.000Z',
    },
  ];

  const initialBudgets: Budget[] = [
    {
      id: 'bgt_01',
      userId: demoUser.id,
      name: 'Food & Dining Budget',
      type: 'category',
      category: 'Food & Dining',
      amount: 10000,
      period: '2026-10',
      notes: 'Monthly allowance for restaurants and groceries',
      alertThreshold: 90,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'bgt_02',
      userId: demoUser.id,
      name: 'Transport Cap',
      type: 'category',
      category: 'Transport',
      amount: 6000,
      period: '2026-10',
      notes: 'Fuel, metro pass, and cab rides',
      alertThreshold: 90,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'bgt_03',
      userId: demoUser.id,
      name: 'Shopping Allowance',
      type: 'category',
      category: 'Shopping',
      amount: 5000,
      period: '2026-10',
      notes: 'Apparel, gadgets, and home decor',
      alertThreshold: 85,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'bgt_04',
      userId: demoUser.id,
      name: 'Utilities & Bills Limit',
      type: 'category',
      category: 'Bills & Utilities',
      amount: 4000,
      period: '2026-10',
      notes: 'Electricity, water, and broadband subscriptions',
      alertThreshold: 85,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    },
    {
      id: 'bgt_05',
      userId: demoUser.id,
      name: 'Overall Monthly Budget',
      type: 'overall',
      amount: 32000,
      period: '2026-10',
      notes: 'Total monthly spending ceiling across all categories',
      alertThreshold: 90,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    },
  ];

  return {
    users: [demoUser],
    transactions: initialTransactions,
    budgets: initialBudgets,
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.transactions)) {
        if (!Array.isArray(parsed.budgets)) {
          const initial = seedInitialData();
          parsed.budgets = initial.budgets;
          saveDatabase(parsed);
        }
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading database file, re-initializing:', err);
  }

  const initial = seedInitialData();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Failed to write database file:', err);
    throw new Error('Database write failure');
  }
}

// Initialize db
db = loadDatabase();

export const database = {
  // User operations
  findUserByEmail(email: string): User | undefined {
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById(id: string): User | undefined {
    return db.users.find((u) => u.id === id);
  },

  createUser(fullName: string, email: string, passwordHash: string): User {
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      fullName,
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDatabase(db);
    return newUser;
  },

  updateUserProfile(userId: string, updates: { fullName?: string; email?: string }): User | null {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return null;
    if (updates.fullName) user.fullName = updates.fullName;
    if (updates.email) user.email = updates.email.toLowerCase().trim();
    user.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return user;
  },

  createPasswordResetToken(email: string): string | null {
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return null;

    // Generate 6-digit verification/reset code
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = token;
    // Valid for 1 hour
    user.resetPasswordExpires = new Date(Date.now() + 3600000).toISOString();
    user.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return token;
  },

  resetPasswordWithToken(token: string, newPasswordHash: string): User | null {
    const now = new Date().toISOString();
    const user = db.users.find(
      (u) =>
        u.resetPasswordToken === token &&
        u.resetPasswordExpires &&
        u.resetPasswordExpires > now
    );
    if (!user) return null;

    user.passwordHash = newPasswordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return user;
  },

  // Transaction operations (Strictly scoped by userId)
  getTransactions(userId: string, filters?: {
    month?: string; // e.g. "2026-10" or "all"
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: 'income' | 'expense' | 'all';
    search?: string;
  }): Transaction[] {
    let list = db.transactions.filter((tx) => tx.userId === userId);

    if (filters?.startDate) {
      list = list.filter((tx) => tx.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      list = list.filter((tx) => tx.date <= filters.endDate!);
    }
    if (filters?.month && filters.month !== 'all' && !filters.startDate) {
      list = list.filter((tx) => tx.date.startsWith(filters.month!));
    }

    if (filters?.category && filters.category !== 'all' && filters.category !== 'All Categories') {
      list = list.filter((tx) => tx.category.toLowerCase() === filters.category!.toLowerCase());
    }

    if (filters?.type === 'income' || filters?.type === 'expense') {
      list = list.filter((tx) => tx.type === filters.type);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (tx) =>
          tx.description.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          (tx.merchant && tx.merchant.toLowerCase().includes(q))
      );
    }

    // Sort descending by date, then createdAt
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getTransactionById(userId: string, txId: string): Transaction | undefined {
    return db.transactions.find((tx) => tx.id === txId && tx.userId === userId);
  },

  createTransaction(
    userId: string,
    data: {
      type: 'income' | 'expense';
      amount: number;
      category: string;
      date: string;
      description?: string;
      paymentMethod?: string;
      merchant?: string;
    }
  ): Transaction {
    // Avoid floating point inaccuracies by rounding to 2 decimal places
    const cleanAmount = Math.round(data.amount * 100) / 100;

    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: data.type,
      amount: cleanAmount,
      category: data.category.trim(),
      date: data.date,
      description: data.description?.trim() || '',
      paymentMethod: data.paymentMethod?.trim() || 'UPI / NetBanking',
      merchant: data.merchant?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.transactions.push(newTx);
    saveDatabase(db);
    return newTx;
  },

  updateTransaction(
    userId: string,
    txId: string,
    updates: {
      type?: 'income' | 'expense';
      amount?: number;
      category?: string;
      date?: string;
      description?: string;
      paymentMethod?: string;
      merchant?: string;
    }
  ): Transaction | null {
    const tx = db.transactions.find((t) => t.id === txId && t.userId === userId);
    if (!tx) return null;

    if (updates.type) tx.type = updates.type;
    if (typeof updates.amount === 'number') tx.amount = Math.round(updates.amount * 100) / 100;
    if (updates.category) tx.category = updates.category.trim();
    if (updates.date) tx.date = updates.date;
    if (updates.description !== undefined) tx.description = updates.description.trim();
    if (updates.paymentMethod !== undefined) tx.paymentMethod = updates.paymentMethod.trim();
    if (updates.merchant !== undefined) tx.merchant = updates.merchant.trim();
    tx.updatedAt = new Date().toISOString();

    saveDatabase(db);
    return tx;
  },

  deleteTransaction(userId: string, txId: string): boolean {
    const initialLen = db.transactions.length;
    db.transactions = db.transactions.filter((tx) => !(tx.id === txId && tx.userId === userId));
    const deleted = db.transactions.length < initialLen;
    if (deleted) {
      saveDatabase(db);
    }
    return deleted;
  },

  // Calculate user summary
  getUserSummary(userId: string, monthPrefix = '2026-10') {
    const allUserTx = db.transactions.filter((tx) => tx.userId === userId);
    const isAllTime = monthPrefix === 'all';
    const periodTx = isAllTime ? allUserTx : allUserTx.filter((tx) => tx.date.startsWith(monthPrefix));

    let totalIncome = 0;
    let totalExpenses = 0;

    periodTx.forEach((tx) => {
      if (tx.type === 'income') totalIncome += tx.amount;
      if (tx.type === 'expense') totalExpenses += tx.amount;
    });

    totalIncome = Math.round(totalIncome * 100) / 100;
    totalExpenses = Math.round(totalExpenses * 100) / 100;
    const balance = Math.round((totalIncome - totalExpenses) * 100) / 100;

    // Monthly breakdown for the year 2026 (Jan to Dec) strictly computed from real records
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyOverview = months.map((mName, idx) => {
      const monthStr = `2026-${String(idx + 1).padStart(2, '0')}`;
      const mItems = allUserTx.filter((tx) => tx.date.startsWith(monthStr));
      let inc = 0;
      let exp = 0;
      mItems.forEach((tx) => {
        if (tx.type === 'income') inc += tx.amount;
        if (tx.type === 'expense') exp += tx.amount;
      });
      return {
        month: mName,
        monthCode: monthStr,
        income: Math.round(inc * 100) / 100,
        expenses: Math.round(exp * 100) / 100,
      };
    });

    // Expense breakdown by category for the selected period
    const categoryTotals: Record<string, number> = {};
    periodTx
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const cat = tx.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;
      });

    const categoryList = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount: Math.round(amount * 100) / 100,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate percentage changes only when a valid comparison period exists
    let incomeGrowth = '+12%';
    let expenseGrowth = '+8%';
    let balanceGrowth = '+14%';

    if (!isAllTime && monthPrefix.startsWith('2026-')) {
      const currentMonthNum = parseInt(monthPrefix.split('-')[1], 10);
      const prevMonthNum = currentMonthNum - 1;
      if (prevMonthNum >= 1) {
        const prevMonthStr = `2026-${String(prevMonthNum).padStart(2, '0')}`;
        const prevTx = allUserTx.filter((tx) => tx.date.startsWith(prevMonthStr));
        let prevInc = 0;
        let prevExp = 0;
        prevTx.forEach((tx) => {
          if (tx.type === 'income') prevInc += tx.amount;
          if (tx.type === 'expense') prevExp += tx.amount;
        });

        if (prevInc > 0) {
          const incDelta = Math.round(((totalIncome - prevInc) / prevInc) * 100);
          incomeGrowth = `${incDelta >= 0 ? '+' : ''}${incDelta}%`;
        } else if (totalIncome > 0) {
          incomeGrowth = '+100%';
        } else {
          incomeGrowth = '0%';
        }

        if (prevExp > 0) {
          const expDelta = Math.round(((totalExpenses - prevExp) / prevExp) * 100);
          expenseGrowth = `${expDelta >= 0 ? '+' : ''}${expDelta}%`;
        } else if (totalExpenses > 0) {
          expenseGrowth = '+100%';
        } else {
          expenseGrowth = '0%';
        }

        const prevBal = prevInc - prevExp;
        if (prevBal !== 0) {
          const balDelta = Math.round(((balance - prevBal) / Math.abs(prevBal)) * 100);
          balanceGrowth = `${balDelta >= 0 ? '+' : ''}${balDelta}%`;
        } else if (balance > 0) {
          balanceGrowth = '+100%';
        } else {
          balanceGrowth = '0%';
        }
      } else {
        incomeGrowth = 'N/A';
        expenseGrowth = 'N/A';
        balanceGrowth = 'N/A';
      }
    } else {
      incomeGrowth = 'All time';
      expenseGrowth = 'All time';
      balanceGrowth = 'All time';
    }

    // Recent 5 transactions
    const recentTransactions = [...periodTx]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      period: monthPrefix,
      totalIncome,
      totalExpenses,
      balance,
      incomeGrowth,
      expenseGrowth,
      balanceGrowth,
      monthlyOverview,
      expensesByCategory: categoryList,
      recentTransactions,
      transactionCount: periodTx.length,
    };
  },

  // Helper to compute live spending and progress for a budget
  computeBudgetDetails(userId: string, budget: Budget): {
    calculated: BudgetWithCalculations;
    matchedTransactions: Transaction[];
  } {
    const isAllTime = budget.period === 'all';
    const userExpenses = db.transactions.filter(
      (tx) => tx.userId === userId && tx.type === 'expense' && (isAllTime || tx.date.startsWith(budget.period))
    );

    let matched: Transaction[] = [];
    if (budget.type === 'overall') {
      matched = userExpenses;
    } else if (budget.category) {
      const bCat = budget.category.toLowerCase().trim();
      matched = userExpenses.filter((tx) => tx.category.toLowerCase().trim() === bCat);
    }

    const spent = Math.round(matched.reduce((acc, tx) => acc + tx.amount, 0) * 100) / 100;
    const remaining = Math.round((budget.amount - spent) * 100) / 100;
    const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

    let status: 'on_track' | 'warning' | 'near_limit' | 'over_budget' = 'on_track';
    if (percentage >= 100) {
      status = 'over_budget';
    } else if (percentage >= (budget.alertThreshold || 90)) {
      status = 'near_limit';
    } else if (percentage >= 75) {
      status = 'warning';
    }

    return {
      calculated: {
        ...budget,
        spent,
        remaining,
        percentage,
        status,
        transactionCount: matched.length,
      },
      matchedTransactions: matched.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    };
  },

  // Get list of budgets for a user and period
  getBudgets(userId: string, period = '2026-10'): BudgetWithCalculations[] {
    const userBudgets = db.budgets.filter(
      (b) => b.userId === userId && (period === 'all' || b.period === period || b.period === 'all')
    );

    return userBudgets.map((b) => this.computeBudgetDetails(userId, b).calculated);
  },

  getBudgetById(
    userId: string,
    budgetId: string
  ): { budget: BudgetWithCalculations; transactions: Transaction[] } | null {
    const b = db.budgets.find((bg) => bg.id === budgetId && bg.userId === userId);
    if (!b) return null;
    const { calculated, matchedTransactions } = this.computeBudgetDetails(userId, b);
    return { budget: calculated, transactions: matchedTransactions };
  },

  createBudget(
    userId: string,
    data: {
      name: string;
      type: BudgetType;
      category?: string;
      amount: number;
      period: string;
      notes?: string;
      alertThreshold?: number;
    }
  ): Budget {
    const cleanAmount = Math.round(data.amount * 100) / 100;
    const cleanCategory = data.type === 'category' ? (data.category?.trim() || 'Others') : undefined;

    const newBudget: Budget = {
      id: `bgt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      name: data.name.trim(),
      type: data.type,
      category: cleanCategory,
      amount: cleanAmount,
      period: data.period.trim() || '2026-10',
      notes: data.notes?.trim() || '',
      alertThreshold: data.alertThreshold && data.alertThreshold > 0 ? data.alertThreshold : 90,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.budgets.push(newBudget);
    saveDatabase(db);
    return newBudget;
  },

  updateBudget(
    userId: string,
    budgetId: string,
    updates: {
      name?: string;
      type?: BudgetType;
      category?: string;
      amount?: number;
      period?: string;
      notes?: string;
      alertThreshold?: number;
    }
  ): Budget | null {
    const budget = db.budgets.find((b) => b.id === budgetId && b.userId === userId);
    if (!budget) return null;

    if (updates.name !== undefined) budget.name = updates.name.trim();
    if (updates.type !== undefined) budget.type = updates.type;
    if (updates.category !== undefined) {
      budget.category = budget.type === 'category' ? updates.category.trim() : undefined;
    }
    if (typeof updates.amount === 'number') {
      budget.amount = Math.round(updates.amount * 100) / 100;
    }
    if (updates.period !== undefined) budget.period = updates.period.trim();
    if (updates.notes !== undefined) budget.notes = updates.notes.trim();
    if (typeof updates.alertThreshold === 'number') budget.alertThreshold = updates.alertThreshold;
    budget.updatedAt = new Date().toISOString();

    saveDatabase(db);
    return budget;
  },

  deleteBudget(userId: string, budgetId: string): boolean {
    const initialLen = db.budgets.length;
    // Strictly deletes the budget only; never touches financial transactions!
    db.budgets = db.budgets.filter((b) => !(b.id === budgetId && b.userId === userId));
    const deleted = db.budgets.length < initialLen;
    if (deleted) {
      saveDatabase(db);
    }
    return deleted;
  },

  getBudgetSummary(userId: string, period = '2026-10') {
    const budgetsWithCalc = this.getBudgets(userId, period);

    // Total budget: if an overall budget exists, use that or sum of category budgets
    const categoryBudgets = budgetsWithCalc.filter((b) => b.type === 'category');
    const overallBudget = budgetsWithCalc.find((b) => b.type === 'overall');

    const totalAllocated = overallBudget
      ? overallBudget.amount
      : categoryBudgets.reduce((acc, b) => acc + b.amount, 0);

    // Total eligible spending
    const isAllTime = period === 'all';
    const periodExpenses = db.transactions.filter(
      (tx) => tx.userId === userId && tx.type === 'expense' && (isAllTime || tx.date.startsWith(period))
    );
    const totalSpent = Math.round(periodExpenses.reduce((acc, tx) => acc + tx.amount, 0) * 100) / 100;
    const remaining = Math.round((totalAllocated - totalSpent) * 100) / 100;

    const overBudgetCount = budgetsWithCalc.filter((b) => b.status === 'over_budget').length;
    const warningCount = budgetsWithCalc.filter(
      (b) => b.status === 'warning' || b.status === 'near_limit'
    ).length;

    // Generate smart in-app alerts based on thresholds
    const alerts = budgetsWithCalc
      .filter((b) => b.percentage >= (b.alertThreshold || 75))
      .map((b) => ({
        id: `alt_${b.id}`,
        budgetId: b.id,
        budgetName: b.name,
        percentage: b.percentage,
        threshold: b.alertThreshold,
        amount: b.amount,
        spent: b.spent,
        status: b.status,
        message:
          b.status === 'over_budget'
            ? `${b.name} has exceeded its allocation (${b.percentage}% used, ₹${b.spent.toLocaleString('en-IN')})`
            : `${b.name} has reached ${b.percentage}% of its allocated limit (${b.alertThreshold}% threshold alert)`,
        level: b.status === 'over_budget' ? 'danger' : 'warning',
      }));

    return {
      period,
      budgetCount: budgetsWithCalc.length,
      totalBudget: totalAllocated,
      totalSpent,
      remaining,
      overBudgetCount,
      warningCount,
      alerts,
      budgets: budgetsWithCalc,
    };
  },
};
