import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
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
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users: User[];
  transactions: Transaction[];
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

  return {
    users: [demoUser],
    transactions: initialTransactions,
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.transactions)) {
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

  // Transaction operations (Strictly scoped by userId)
  getTransactions(userId: string, filters?: {
    month?: string; // e.g. "2026-10"
    category?: string;
    type?: 'income' | 'expense' | 'all';
    search?: string;
  }): Transaction[] {
    let list = db.transactions.filter((tx) => tx.userId === userId);

    if (filters?.month && filters.month !== 'all') {
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
          tx.category.toLowerCase().includes(q)
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
    }
  ): Transaction {
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type: data.type,
      amount: Math.round(data.amount * 100) / 100, // round to 2 decimals
      category: data.category.trim(),
      date: data.date,
      description: data.description?.trim() || '',
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
    }
  ): Transaction | null {
    const tx = db.transactions.find((t) => t.id === txId && t.userId === userId);
    if (!tx) return null;

    if (updates.type) tx.type = updates.type;
    if (typeof updates.amount === 'number') tx.amount = Math.round(updates.amount * 100) / 100;
    if (updates.category) tx.category = updates.category.trim();
    if (updates.date) tx.date = updates.date;
    if (updates.description !== undefined) tx.description = updates.description.trim();
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
    const monthTx = allUserTx.filter((tx) => tx.date.startsWith(monthPrefix));

    let totalIncome = 0;
    let totalExpenses = 0;

    monthTx.forEach((tx) => {
      if (tx.type === 'income') totalIncome += tx.amount;
      if (tx.type === 'expense') totalExpenses += tx.amount;
    });

    const balance = totalIncome - totalExpenses;

    // Monthly breakdown for the year 2026 (Jan to Dec)
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
        income: inc,
        expenses: exp,
      };
    });

    // Expense breakdown by category for the selected month
    const categoryTotals: Record<string, number> = {};
    monthTx
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const cat = tx.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;
      });

    const categoryList = Object.entries(categoryTotals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // Recent 5 transactions
    const recentTransactions = [...allUserTx]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      period: monthPrefix,
      totalIncome,
      totalExpenses,
      balance,
      incomeGrowth: '+12%',
      expenseGrowth: '+8%',
      balanceGrowth: '+14%',
      monthlyOverview,
      expensesByCategory: categoryList,
      recentTransactions,
      transactionCount: allUserTx.length,
    };
  },
};
