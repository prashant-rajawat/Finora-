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

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface GoalContribution {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  note?: string;
  source?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  category: string;
  targetAmount: number;
  initialAmount?: number;
  targetDate?: string; // YYYY-MM-DD
  description?: string;
  color?: string;
  icon?: string;
  status: GoalStatus;
  frequencyPreference?: 'weekly' | 'bi-weekly' | 'monthly' | 'one-time';
  createdAt: string;
  updatedAt: string;
}

export interface GoalProjections {
  monthlyNeeded: number | null;
  weeklyNeeded: number | null;
  dailyNeeded: number | null;
  monthsRemaining: number | null;
  daysRemaining: number | null;
  statusText: string;
}

export interface GoalWithCalculations extends Goal {
  savedAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  daysRemaining: number | null;
  isOverdue: boolean;
  contributionsCount: number;
  contributions: GoalContribution[];
  projections: GoalProjections;
}

export interface GoalSummary {
  totalTarget: number;
  totalSaved: number;
  totalRemaining: number;
  activeCount: number;
  completedCount: number;
  pausedCount: number;
  archivedCount: number;
  overallProgress: number;
}

export interface UserPreferences {
  userId: string;
  currency: string;
  dateFormat: string;
  timezone: string;
  tableDensity: 'compact' | 'comfortable';
  emailAlerts: boolean;
  monthlyDigest: boolean;
  budgetThresholdAlerts: boolean;
  updatedAt: string;
}

export type RecurrenceFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly';
export type RecurringScheduleStatus = 'active' | 'paused' | 'completed' | 'cancelled';

export interface RecurringSchedule {
  id: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  frequency: RecurrenceFrequency;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  maxOccurrences?: number;
  dayOfWeek?: number; // 0=Sun .. 6=Sat
  dayOfMonth?: number; // 1-31
  status: RecurringScheduleStatus;
  paymentMethod?: string;
  merchant?: string;
  notes?: string;
  nextRunDate: string; // YYYY-MM-DD
  lastRunDate?: string; // YYYY-MM-DD
  completedOccurrences: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringOccurrence {
  id: string;
  scheduleId: string;
  userId: string;
  scheduledDate: string; // YYYY-MM-DD
  processedAt: string; // ISO
  status: 'generated' | 'skipped' | 'failed';
  transactionId?: string;
  errorMessage?: string;
}

interface DatabaseSchema {
  users: User[];
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  goalContributions: GoalContribution[];
  userPreferences: UserPreferences[];
  recurringSchedules: RecurringSchedule[];
  recurringOccurrences: RecurringOccurrence[];
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
  goals: [],
  goalContributions: [],
  userPreferences: [],
  recurringSchedules: [],
  recurringOccurrences: [],
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

  const initialGoals: Goal[] = [
    {
      id: 'gol_01',
      userId: demoUser.id,
      name: 'Emergency Safety Net',
      category: 'Emergency Fund',
      targetAmount: 100000,
      initialAmount: 20000,
      targetDate: '2027-04-30',
      description: '6 months of essential living expenses buffer for unforeseen situations.',
      color: '#10B981',
      icon: 'ShieldCheck',
      status: 'active',
      frequencyPreference: 'monthly',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-10-02T10:00:00.000Z',
    },
    {
      id: 'gol_02',
      userId: demoUser.id,
      name: 'MacBook Pro M3 Max',
      category: 'Tech & Gadgets',
      targetAmount: 250000,
      initialAmount: 50000,
      targetDate: '2027-01-15',
      description: 'High-performance workstation laptop for freelance UI and coding projects.',
      color: '#1677F2',
      icon: 'Laptop',
      status: 'active',
      frequencyPreference: 'monthly',
      createdAt: '2026-09-15T08:00:00.000Z',
      updatedAt: '2026-10-03T10:00:00.000Z',
    },
    {
      id: 'gol_03',
      userId: demoUser.id,
      name: 'Goa Beach Retreat',
      category: 'Travel',
      targetAmount: 30000,
      initialAmount: 10000,
      targetDate: '2026-12-25',
      description: 'Year-end holiday getaway with friends to relax and unwind.',
      color: '#F59E0B',
      icon: 'Plane',
      status: 'active',
      frequencyPreference: 'monthly',
      createdAt: '2026-10-05T08:00:00.000Z',
      updatedAt: '2026-10-16T10:00:00.000Z',
    },
  ];

  const initialContributions: GoalContribution[] = [
    {
      id: 'gc_01',
      goalId: 'gol_01',
      userId: demoUser.id,
      amount: 20000,
      date: '2026-09-01',
      note: 'Initial emergency reserve fund deposit',
      source: 'Savings Account',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'gc_02',
      goalId: 'gol_01',
      userId: demoUser.id,
      amount: 15000,
      date: '2026-10-02',
      note: 'Monthly salary allocation to emergency fund',
      source: 'Bank Transfer',
      createdAt: '2026-10-02T10:00:00.000Z',
    },
    {
      id: 'gc_03',
      goalId: 'gol_02',
      userId: demoUser.id,
      amount: 50000,
      date: '2026-09-15',
      note: 'Initial workstation budget allocation',
      source: 'Savings Account',
      createdAt: '2026-09-15T08:00:00.000Z',
    },
    {
      id: 'gc_04',
      goalId: 'gol_02',
      userId: demoUser.id,
      amount: 25000,
      date: '2026-10-03',
      note: 'Freelance client advance dedicated to hardware upgrade',
      source: 'UPI',
      createdAt: '2026-10-03T10:00:00.000Z',
    },
    {
      id: 'gc_05',
      goalId: 'gol_03',
      userId: demoUser.id,
      amount: 10000,
      date: '2026-10-05',
      note: 'Initial vacation fund allocation',
      source: 'UPI',
      createdAt: '2026-10-05T08:00:00.000Z',
    },
    {
      id: 'gc_06',
      goalId: 'gol_03',
      userId: demoUser.id,
      amount: 10000,
      date: '2026-10-16',
      note: 'Flight ticket and accommodation savings',
      source: 'Bank Transfer',
      createdAt: '2026-10-16T10:00:00.000Z',
    },
  ];

  const initialPreferences: UserPreferences = {
    userId: demoUser.id,
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Kolkata',
    tableDensity: 'comfortable',
    emailAlerts: true,
    monthlyDigest: true,
    budgetThresholdAlerts: true,
    updatedAt: '2026-10-24T00:00:00.000Z',
  };

  const initialSchedules: RecurringSchedule[] = [
    {
      id: 'rec_01',
      userId: demoUser.id,
      name: 'Monthly Salary Credit',
      type: 'income',
      amount: 40000,
      category: 'Salary',
      frequency: 'monthly',
      startDate: '2026-10-01',
      dayOfMonth: 1,
      status: 'active',
      paymentMethod: 'Bank Transfer',
      merchant: 'Acme Corp',
      notes: 'Primary monthly employment income',
      nextRunDate: '2026-11-01',
      lastRunDate: '2026-10-01',
      completedOccurrences: 1,
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 'rec_02',
      userId: demoUser.id,
      name: 'Apartment Rent',
      type: 'expense',
      amount: 12000,
      category: 'Bills & Utilities',
      frequency: 'monthly',
      startDate: '2026-10-01',
      dayOfMonth: 1,
      status: 'active',
      paymentMethod: 'UPI / NetBanking',
      merchant: 'Landlord',
      notes: 'Monthly residential house rent payment',
      nextRunDate: '2026-11-01',
      lastRunDate: '2026-10-01',
      completedOccurrences: 1,
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-10-01T10:00:00.000Z',
    },
    {
      id: 'rec_03',
      userId: demoUser.id,
      name: 'Netflix & Spotify Premium',
      type: 'expense',
      amount: 800,
      category: 'Entertainment',
      frequency: 'monthly',
      startDate: '2026-10-05',
      dayOfMonth: 5,
      status: 'active',
      paymentMethod: 'Credit Card',
      merchant: 'Netflix Inc',
      notes: 'Streaming & music subscriptions auto-pay',
      nextRunDate: '2026-11-05',
      lastRunDate: '2026-10-05',
      completedOccurrences: 1,
      createdAt: '2026-09-05T08:00:00.000Z',
      updatedAt: '2026-10-05T08:00:00.000Z',
    },
    {
      id: 'rec_04',
      userId: demoUser.id,
      name: 'Airtel Broadband Fiber',
      type: 'expense',
      amount: 1200,
      category: 'Bills & Utilities',
      frequency: 'monthly',
      startDate: '2026-10-10',
      dayOfMonth: 10,
      status: 'active',
      paymentMethod: 'UPI',
      merchant: 'Airtel Payments',
      notes: 'High speed fiber internet monthly bill',
      nextRunDate: '2026-11-10',
      lastRunDate: '2026-10-10',
      completedOccurrences: 1,
      createdAt: '2026-09-10T08:00:00.000Z',
      updatedAt: '2026-10-10T08:00:00.000Z',
    },
    {
      id: 'rec_05',
      userId: demoUser.id,
      name: 'SIP Mutual Fund Auto-Debit',
      type: 'expense',
      amount: 5000,
      category: 'Investments',
      frequency: 'monthly',
      startDate: '2026-10-15',
      dayOfMonth: 15,
      status: 'active',
      paymentMethod: 'Bank Auto-Debit',
      merchant: 'Zerodha Coin',
      notes: 'Index Fund SIP monthly investment',
      nextRunDate: '2026-11-15',
      lastRunDate: '2026-10-15',
      completedOccurrences: 1,
      createdAt: '2026-09-15T08:00:00.000Z',
      updatedAt: '2026-10-15T08:00:00.000Z',
    },
  ];

  const initialOccurrences: RecurringOccurrence[] = [
    {
      id: 'occ_01',
      scheduleId: 'rec_01',
      userId: demoUser.id,
      scheduledDate: '2026-10-01',
      processedAt: '2026-10-01T10:00:00.000Z',
      status: 'generated',
      transactionId: 'tx_05',
    },
    {
      id: 'occ_03',
      scheduleId: 'rec_03',
      userId: demoUser.id,
      scheduledDate: '2026-10-05',
      processedAt: '2026-10-05T08:00:00.000Z',
      status: 'generated',
      transactionId: 'tx_11',
    },
    {
      id: 'occ_04',
      scheduleId: 'rec_04',
      userId: demoUser.id,
      scheduledDate: '2026-10-10',
      processedAt: '2026-10-10T08:00:00.000Z',
      status: 'generated',
      transactionId: 'tx_03',
    },
  ];

  return {
    users: [demoUser],
    transactions: initialTransactions,
    budgets: initialBudgets,
    goals: initialGoals,
    goalContributions: initialContributions,
    userPreferences: [initialPreferences],
    recurringSchedules: initialSchedules,
    recurringOccurrences: initialOccurrences,
  };
}

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.transactions)) {
        let changed = false;
        if (!Array.isArray(parsed.budgets)) {
          const initial = seedInitialData();
          parsed.budgets = initial.budgets;
          changed = true;
        }
        if (!Array.isArray(parsed.goals)) {
          const initial = seedInitialData();
          parsed.goals = initial.goals;
          changed = true;
        }
        if (!Array.isArray(parsed.goalContributions)) {
          const initial = seedInitialData();
          parsed.goalContributions = initial.goalContributions;
          changed = true;
        }
        if (!Array.isArray(parsed.userPreferences)) {
          const initial = seedInitialData();
          parsed.userPreferences = initial.userPreferences;
          changed = true;
        }
        if (!Array.isArray(parsed.recurringSchedules)) {
          const initial = seedInitialData();
          parsed.recurringSchedules = initial.recurringSchedules;
          changed = true;
        }
        if (!Array.isArray(parsed.recurringOccurrences)) {
          const initial = seedInitialData();
          parsed.recurringOccurrences = initial.recurringOccurrences;
          changed = true;
        }
        if (changed) {
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

  getAnalyticsData(
    userId: string,
    options: {
      periodPreset?: string;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    const periodPreset = options.periodPreset || 'this_month';
    let startDate = options.startDate || '';
    let endDate = options.endDate || '';
    let periodLabel = '';
    let prevStartDate = '';
    let prevEndDate = '';
    let prevPeriodLabel = '';

    // Standard anchoring around demo reference date 2026-10-31
    // (If user explicitly sends custom startDate & endDate, use those)
    if (periodPreset === 'this_month') {
      startDate = '2026-10-01';
      endDate = '2026-10-31';
      periodLabel = 'This Month (October 2026)';
      prevStartDate = '2026-09-01';
      prevEndDate = '2026-09-30';
      prevPeriodLabel = 'Last Month (September 2026)';
    } else if (periodPreset === 'last_month') {
      startDate = '2026-09-01';
      endDate = '2026-09-30';
      periodLabel = 'Last Month (September 2026)';
      prevStartDate = '2026-08-01';
      prevEndDate = '2026-08-31';
      prevPeriodLabel = 'Prior Month (August 2026)';
    } else if (periodPreset === 'last_3_months') {
      startDate = '2026-08-01';
      endDate = '2026-10-31';
      periodLabel = 'Last 3 Months (Aug – Oct 2026)';
      prevStartDate = '2026-05-01';
      prevEndDate = '2026-07-31';
      prevPeriodLabel = 'Previous 3 Months (May – Jul 2026)';
    } else if (periodPreset === 'last_6_months') {
      startDate = '2026-05-01';
      endDate = '2026-10-31';
      periodLabel = 'Last 6 Months (May – Oct 2026)';
      prevStartDate = '2025-11-01';
      prevEndDate = '2026-04-30';
      prevPeriodLabel = 'Previous 6 Months';
    } else if (periodPreset === 'this_year') {
      startDate = '2026-01-01';
      endDate = '2026-12-31';
      periodLabel = 'This Year (2026)';
      prevStartDate = '2025-01-01';
      prevEndDate = '2025-12-31';
      prevPeriodLabel = 'Last Year (2025)';
    } else {
      // Custom date range
      if (!startDate) startDate = '2026-10-01';
      if (!endDate) endDate = '2026-10-31';
      periodLabel = `${startDate} to ${endDate}`;

      const sTime = new Date(startDate).getTime();
      const eTime = new Date(endDate).getTime();
      const durationMs = Math.max(86400000, eTime - sTime + 86400000);
      const prevETime = sTime - 86400000;
      const prevSTime = prevETime - durationMs + 86400000;

      prevStartDate = new Date(prevSTime).toISOString().split('T')[0];
      prevEndDate = new Date(prevETime).toISOString().split('T')[0];
      prevPeriodLabel = `Previous Period (${prevStartDate} to ${prevEndDate})`;
    }

    // 1. Filter current user transactions for current period
    const currentTx = db.transactions.filter(
      (tx) => tx.userId === userId && tx.date >= startDate && tx.date <= endDate
    );

    // 2. Filter previous period transactions for comparison
    const prevTx = db.transactions.filter(
      (tx) => tx.userId === userId && tx.date >= prevStartDate && tx.date <= prevEndDate
    );

    // 3. Current period metrics
    const currentIncomeTx = currentTx.filter((tx) => tx.type === 'income');
    const currentExpenseTx = currentTx.filter((tx) => tx.type === 'expense');

    const totalIncome = Math.round(currentIncomeTx.reduce((acc, tx) => acc + tx.amount, 0) * 100) / 100;
    const totalExpenses = Math.round(currentExpenseTx.reduce((acc, tx) => acc + tx.amount, 0) * 100) / 100;
    const netCashFlow = Math.round((totalIncome - totalExpenses) * 100) / 100;

    // Savings rate: ((income - expenses) / income) * 100.
    // When income is 0 or negative, mathematically savings rate is null / undefined.
    let savingsRate: number | null = null;
    if (totalIncome > 0) {
      savingsRate = Math.round(((totalIncome - totalExpenses) / totalIncome) * 1000) / 10;
    }

    // Calculate days in period
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const diffTime = Math.abs(endObj.getTime() - startObj.getTime());
    const daysInPeriod = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const avgDailySpend = Math.round((totalExpenses / daysInPeriod) * 100) / 100;

    // 4. Budget performance in this period
    // Determine which budget period code to look up (e.g. if single month, use YYYY-MM; else overall/all)
    const isSingleMonth = startDate.slice(0, 7) === endDate.slice(0, 7);
    const budgetLookupPeriod = isSingleMonth ? startDate.slice(0, 7) : 'all';
    const budgetSummary = this.getBudgetSummary(userId, budgetLookupPeriod);
    const budgetUtilization = budgetSummary.totalBudget > 0
      ? Math.round((budgetSummary.totalSpent / budgetSummary.totalBudget) * 1000) / 10
      : 0;

    // 5. Category Breakdown (Expenses ONLY)
    const categoryTotals: Record<string, { amount: number; count: number }> = {};
    for (const tx of currentExpenseTx) {
      const cat = tx.category || 'Others';
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { amount: 0, count: 0 };
      }
      categoryTotals[cat].amount += tx.amount;
      categoryTotals[cat].count += 1;
    }

    const palette = [
      '#1677F2', // Primary Blue
      '#14B8A6', // Teal
      '#F59E0B', // Amber
      '#8B5CF6', // Purple
      '#EF5360', // Rose
      '#10B981', // Emerald
      '#EC4899', // Pink
      '#6366F1', // Indigo
      '#0EA5E9', // Sky
      '#64748B', // Slate
    ];

    const categoryBreakdown = Object.entries(categoryTotals)
      .map(([category, info], idx) => {
        const roundedAmount = Math.round(info.amount * 100) / 100;
        const percentage = totalExpenses > 0
          ? Math.round((roundedAmount / totalExpenses) * 1000) / 10
          : 0;
        return {
          category,
          amount: roundedAmount,
          percentage,
          transactionCount: info.count,
          color: palette[idx % palette.length],
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // 6. Time Series Grouping
    // If <= 35 days: group daily
    // If > 35 and <= 100 days: group weekly
    // If > 100 days: group monthly
    const timeSeries: Array<{
      key: string;
      label: string;
      date: string;
      income: number;
      expenses: number;
      net: number;
    }> = [];

    if (daysInPeriod <= 35) {
      // Daily map
      const dailyMap: Record<string, { income: number; expenses: number }> = {};
      const cur = new Date(startDate);
      const endD = new Date(endDate);

      while (cur <= endD) {
        const dStr = cur.toISOString().split('T')[0];
        dailyMap[dStr] = { income: 0, expenses: 0 };
        cur.setDate(cur.getDate() + 1);
      }

      for (const tx of currentTx) {
        if (dailyMap[tx.date]) {
          if (tx.type === 'income') dailyMap[tx.date].income += tx.amount;
          else dailyMap[tx.date].expenses += tx.amount;
        }
      }

      for (const [dStr, val] of Object.entries(dailyMap)) {
        const d = new Date(dStr + 'T00:00:00');
        const monthShort = d.toLocaleString('en-US', { month: 'short' });
        const dayNum = d.getDate();
        timeSeries.push({
          key: dStr,
          label: `${monthShort} ${dayNum}`,
          date: dStr,
          income: Math.round(val.income * 100) / 100,
          expenses: Math.round(val.expenses * 100) / 100,
          net: Math.round((val.income - val.expenses) * 100) / 100,
        });
      }
    } else if (daysInPeriod <= 100) {
      // Weekly chunks (7-day intervals)
      const cur = new Date(startDate);
      const endD = new Date(endDate);
      let weekIndex = 1;

      while (cur <= endD) {
        const chunkStart = new Date(cur);
        const chunkEnd = new Date(cur);
        chunkEnd.setDate(chunkEnd.getDate() + 6);
        if (chunkEnd > endD) chunkEnd.setTime(endD.getTime());

        const csStr = chunkStart.toISOString().split('T')[0];
        const ceStr = chunkEnd.toISOString().split('T')[0];

        let wIncome = 0;
        let wExpenses = 0;

        for (const tx of currentTx) {
          if (tx.date >= csStr && tx.date <= ceStr) {
            if (tx.type === 'income') wIncome += tx.amount;
            else wExpenses += tx.amount;
          }
        }

        const sLabel = chunkStart.toLocaleString('en-US', { month: 'short', day: 'numeric' });
        const eLabel = chunkEnd.toLocaleString('en-US', { month: 'short', day: 'numeric' });

        timeSeries.push({
          key: `w_${weekIndex}_${csStr}`,
          label: `W${weekIndex} (${sLabel}–${eLabel})`,
          date: csStr,
          income: Math.round(wIncome * 100) / 100,
          expenses: Math.round(wExpenses * 100) / 100,
          net: Math.round((wIncome - wExpenses) * 100) / 100,
        });

        weekIndex++;
        cur.setDate(cur.getDate() + 7);
      }
    } else {
      // Monthly grouping
      const monthMap: Record<string, { income: number; expenses: number; label: string }> = {};
      const cur = new Date(startDate);
      const endD = new Date(endDate);

      while (cur <= endD) {
        const ym = cur.toISOString().slice(0, 7);
        if (!monthMap[ym]) {
          const mLabel = cur.toLocaleString('en-US', { month: 'short', year: 'numeric' });
          monthMap[ym] = { income: 0, expenses: 0, label: mLabel };
        }
        cur.setMonth(cur.getMonth() + 1);
        cur.setDate(1);
      }

      for (const tx of currentTx) {
        const ym = tx.date.slice(0, 7);
        if (monthMap[ym]) {
          if (tx.type === 'income') monthMap[ym].income += tx.amount;
          else monthMap[ym].expenses += tx.amount;
        }
      }

      for (const [ym, val] of Object.entries(monthMap)) {
        timeSeries.push({
          key: ym,
          label: val.label,
          date: `${ym}-01`,
          income: Math.round(val.income * 100) / 100,
          expenses: Math.round(val.expenses * 100) / 100,
          net: Math.round((val.income - val.expenses) * 100) / 100,
        });
      }
    }

    // 7. Comparison with Previous Period
    const prevIncome = Math.round(
      prevTx.filter((t) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) * 100
    ) / 100;
    const prevExpenses = Math.round(
      prevTx.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) * 100
    ) / 100;
    const prevNet = Math.round((prevIncome - prevExpenses) * 100) / 100;
    let prevSavingsRate: number | null = null;
    if (prevIncome > 0) {
      prevSavingsRate = Math.round(((prevIncome - prevExpenses) / prevIncome) * 1000) / 10;
    }

    const calcDelta = (curVal: number, prevVal: number, lowerIsBetter: boolean) => {
      const amount = Math.round((curVal - prevVal) * 100) / 100;
      let percentage: number | null = null;
      if (prevVal !== 0) {
        percentage = Math.round(((curVal - prevVal) / Math.abs(prevVal)) * 1000) / 10;
      }
      const direction: 'up' | 'down' | 'flat' = amount > 0 ? 'up' : amount < 0 ? 'down' : 'flat';
      const isFavorable = lowerIsBetter ? amount <= 0 : amount >= 0;
      return { amount, percentage, direction, isFavorable };
    };

    const comparison = {
      currentPeriodLabel: periodLabel,
      previousPeriodLabel: prevPeriodLabel,
      current: {
        income: totalIncome,
        expenses: totalExpenses,
        net: netCashFlow,
        savingsRate,
      },
      previous: {
        income: prevIncome,
        expenses: prevExpenses,
        net: prevNet,
        savingsRate: prevSavingsRate,
      },
      deltas: {
        income: calcDelta(totalIncome, prevIncome, false),
        expenses: calcDelta(totalExpenses, prevExpenses, true),
        net: calcDelta(netCashFlow, prevNet, false),
        savingsRateDiff:
          savingsRate !== null && prevSavingsRate !== null
            ? Math.round((savingsRate - prevSavingsRate) * 10) / 10
            : null,
      },
    };

    // 8. Spending Trends & Trajectory
    let trajectory: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let trajectoryPercentage = 0;
    let trajectoryDescription = 'Spending is in line with baseline levels.';

    if (prevExpenses > 0) {
      const expChangePct = ((totalExpenses - prevExpenses) / prevExpenses) * 100;
      trajectoryPercentage = Math.abs(Math.round(expChangePct * 10) / 10);
      if (expChangePct > 3) {
        trajectory = 'increasing';
        trajectoryDescription = `Spending increased by ${trajectoryPercentage}% compared to the prior period.`;
      } else if (expChangePct < -3) {
        trajectory = 'decreasing';
        trajectoryDescription = `Spending decreased by ${trajectoryPercentage}% compared to the prior period.`;
      } else {
        trajectory = 'stable';
        trajectoryDescription = `Spending remained steady (${trajectoryPercentage}% shift) compared to the prior period.`;
      }
    } else if (totalExpenses > 0) {
      trajectory = 'increasing';
      trajectoryPercentage = 100;
      trajectoryDescription = `Recorded ₹${totalExpenses.toLocaleString('en-IN')} in expenses this period.`;
    }

    // Peak spending day
    const dayTotals: Record<string, number> = {};
    for (const tx of currentExpenseTx) {
      dayTotals[tx.date] = (dayTotals[tx.date] || 0) + tx.amount;
    }
    let peakDay: { date: string; amount: number; formattedDate: string } | null = null;
    let highestDayAmount = 0;
    for (const [date, amount] of Object.entries(dayTotals)) {
      if (amount > highestDayAmount) {
        highestDayAmount = amount;
        const dObj = new Date(date + 'T00:00:00');
        const formattedDate = dObj.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        peakDay = { date, amount: Math.round(amount * 100) / 100, formattedDate };
      }
    }

    // Top Category
    const topCategory = categoryBreakdown.length > 0
      ? {
          name: categoryBreakdown[0].category,
          amount: categoryBreakdown[0].amount,
          percentage: categoryBreakdown[0].percentage,
        }
      : null;

    const spendingTrends = {
      trajectory,
      trajectoryPercentage,
      trajectoryDescription,
      peakSpendDay: peakDay,
      topCategory,
    };

    // 9. Deterministic Smart Financial Insights (Rules Engine)
    const smartInsights: Array<{
      id: string;
      type: 'positive' | 'warning' | 'info' | 'danger';
      title: string;
      description: string;
      metric?: string;
      actionText?: string;
      actionTarget?: 'dashboard' | 'transactions' | 'budgets' | 'analytics' | 'settings';
    }> = [];

    // Rule 1: No Transactions / Empty
    if (currentTx.length === 0) {
      smartInsights.push({
        id: 'ins_no_tx',
        type: 'info',
        title: 'No Data for This Timeframe',
        description: `No transactions recorded between ${startDate} and ${endDate}. Record your income and expenses to view smart analytics.`,
        actionText: 'Add Transaction',
        actionTarget: 'transactions',
      });
    }

    // Rule 2: High Savings Rate
    if (savingsRate !== null && savingsRate >= 20) {
      smartInsights.push({
        id: 'ins_high_savings',
        type: 'positive',
        title: 'Strong Savings Momentum',
        description: `You saved ${savingsRate}% of your total earnings in this period, well above the recommended 20% financial wellness rule.`,
        metric: `${savingsRate}% saved`,
      });
    } else if (savingsRate !== null && savingsRate > 0 && savingsRate < 20) {
      smartInsights.push({
        id: 'ins_mod_savings',
        type: 'info',
        title: 'Savings Potential Identified',
        description: `Your savings rate is ${savingsRate}%. Trimming non-essential costs in top categories can help you reach the 20% target.`,
        metric: `${savingsRate}% saved`,
      });
    }

    // Rule 3: Negative Cash Flow Deficit
    if (netCashFlow < 0 && totalIncome > 0) {
      smartInsights.push({
        id: 'ins_deficit',
        type: 'danger',
        title: 'Deficit Warning: Negative Cash Flow',
        description: `Expenses exceeded income by ₹${Math.abs(netCashFlow).toLocaleString('en-IN')}. Pausing discretionary purchases is advised to avoid drawing down savings.`,
        metric: `-₹${Math.abs(netCashFlow).toLocaleString('en-IN')}`,
        actionText: 'Review Transactions',
        actionTarget: 'transactions',
      });
    } else if (netCashFlow > 0 && totalExpenses > 0) {
      smartInsights.push({
        id: 'ins_surplus',
        type: 'positive',
        title: 'Healthy Cash Flow Surplus',
        description: `You maintained a positive balance of ₹${netCashFlow.toLocaleString('en-IN')} after covering all expenditures.`,
        metric: `+₹${netCashFlow.toLocaleString('en-IN')}`,
      });
    }

    // Rule 4: Zero Income Logged
    if (totalIncome === 0 && totalExpenses > 0) {
      smartInsights.push({
        id: 'ins_zero_inc',
        type: 'info',
        title: 'Expenses Without Recorded Income',
        description: `You recorded ₹${totalExpenses.toLocaleString('en-IN')} in expenses but have not logged any income for this selected window.`,
        actionText: 'Log Income',
        actionTarget: 'transactions',
      });
    }

    // Rule 5: High Category Concentration
    if (topCategory && topCategory.percentage >= 30) {
      smartInsights.push({
        id: 'ins_concentration',
        type: 'warning',
        title: `Heavy Outflow in ${topCategory.name}`,
        description: `${topCategory.name} represents ${topCategory.percentage}% of all expenditures (₹${topCategory.amount.toLocaleString('en-IN')}). Consider establishing a strict cap.`,
        metric: `${topCategory.percentage}% of expenses`,
        actionText: 'Create Category Budget',
        actionTarget: 'budgets',
      });
    }

    // Rule 6: Spending Drop vs Previous Period
    if (prevExpenses > 0 && totalExpenses < prevExpenses) {
      const dropPct = Math.round(((prevExpenses - totalExpenses) / prevExpenses) * 100);
      smartInsights.push({
        id: 'ins_spend_drop',
        type: 'positive',
        title: 'Reduced Spending Pace',
        description: `Great job! Your total spending is down by ${dropPct}% (₹${(prevExpenses - totalExpenses).toLocaleString('en-IN')} lower) compared to the prior period.`,
        metric: `-${dropPct}% spending`,
      });
    } else if (prevExpenses > 0 && totalExpenses > prevExpenses * 1.15) {
      const jumpPct = Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100);
      smartInsights.push({
        id: 'ins_spend_jump',
        type: 'warning',
        title: 'Expenditure Surge Detected',
        description: `Spending rose by ${jumpPct}% compared to the prior timeframe. Inspect recent outlays to maintain budget discipline.`,
        metric: `+${jumpPct}% spending`,
        actionText: 'View Outflows',
        actionTarget: 'transactions',
      });
    }

    // Rule 7: Budget Exceeded
    if (budgetSummary.overBudgetCount > 0) {
      smartInsights.push({
        id: 'ins_budget_over',
        type: 'danger',
        title: 'Active Budgets Exceeded',
        description: `${budgetSummary.overBudgetCount} budget category has surpassed its allocated ceiling. Review and reallocate funds if necessary.`,
        metric: `${budgetSummary.overBudgetCount} over budget`,
        actionText: 'Manage Budgets',
        actionTarget: 'budgets',
      });
    } else if (budgetSummary.warningCount > 0) {
      smartInsights.push({
        id: 'ins_budget_warn',
        type: 'warning',
        title: 'Budgets Nearing Limits',
        description: `${budgetSummary.warningCount} budget category is close to or has passed its configured alert threshold.`,
        metric: `${budgetSummary.warningCount} near limit`,
        actionText: 'View Budgets',
        actionTarget: 'budgets',
      });
    } else if (budgetSummary.budgetCount > 0) {
      smartInsights.push({
        id: 'ins_budget_ok',
        type: 'positive',
        title: 'All Budgets Fully On Track',
        description: `All ${budgetSummary.budgetCount} configured budgets remain safely within allocated spending allowances.`,
        metric: '100% on track',
      });
    }

    // Rule 8: High Single-Day Outflow
    if (peakDay && totalExpenses > 0 && (peakDay.amount / totalExpenses) >= 0.25 && currentExpenseTx.length > 2) {
      const peakPct = Math.round((peakDay.amount / totalExpenses) * 100);
      smartInsights.push({
        id: 'ins_peak_day',
        type: 'info',
        title: `Spending Spike on ${peakDay.formattedDate}`,
        description: `₹${peakDay.amount.toLocaleString('en-IN')} (${peakPct}% of your period's total spending) occurred on a single date.`,
        metric: `₹${peakDay.amount.toLocaleString('en-IN')}`,
      });
    }

    // 10. Top Expenses List (Ranked descending by amount)
    const topExpenses = currentExpenseTx
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)
      .map((tx) => ({
        id: tx.id,
        description: tx.description,
        merchant: tx.merchant,
        category: tx.category,
        date: tx.date,
        amount: tx.amount,
        percentageOfTotal: totalExpenses > 0
          ? Math.round((tx.amount / totalExpenses) * 1000) / 10
          : 0,
      }));

    return {
      periodPreset,
      startDate,
      endDate,
      periodLabel,
      summary: {
        totalIncome,
        totalExpenses,
        netCashFlow,
        savingsRate,
        avgDailySpend,
        budgetUtilization,
        transactionCount: currentTx.length,
        incomeCount: currentIncomeTx.length,
        expenseCount: currentExpenseTx.length,
        daysInPeriod,
        currency: 'INR',
      },
      timeSeries,
      categoryBreakdown,
      comparison,
      spendingTrends,
      budgetPerformance: {
        totalAllocated: budgetSummary.totalBudget,
        totalSpent: budgetSummary.totalSpent,
        utilizationPercentage: budgetUtilization,
        overBudgetCount: budgetSummary.overBudgetCount,
        warningCount: budgetSummary.warningCount,
        onTrackCount: budgetSummary.budgetCount - budgetSummary.overBudgetCount - budgetSummary.warningCount,
        budgetCount: budgetSummary.budgetCount,
        budgets: budgetSummary.budgets,
      },
      smartInsights,
      topExpenses,
    };
  },

  // ==================== PHASE 5: SAVINGS GOALS METHODS ====================

  getGoals(
    userId: string,
    filter: 'all' | 'active' | 'completed' | 'paused' | 'archived' = 'all',
    sort: 'deadline' | 'progress_desc' | 'progress_asc' | 'target_desc' | 'target_asc' | 'created_desc' = 'deadline'
  ): GoalWithCalculations[] {
    let userGoals = db.goals.filter((g) => g.userId === userId);

    if (filter !== 'all') {
      userGoals = userGoals.filter((g) => g.status === filter);
    }

    const calculated = userGoals.map((g) => this.calculateGoal(g));

    // Sorting
    calculated.sort((a, b) => {
      switch (sort) {
        case 'deadline':
          if (!a.targetDate && !b.targetDate) return 0;
          if (!a.targetDate) return 1;
          if (!b.targetDate) return -1;
          return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
        case 'progress_desc':
          return b.progressPercentage - a.progressPercentage;
        case 'progress_asc':
          return a.progressPercentage - b.progressPercentage;
        case 'target_desc':
          return b.targetAmount - a.targetAmount;
        case 'target_asc':
          return a.targetAmount - b.targetAmount;
        case 'created_desc':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return calculated;
  },

  calculateGoal(goal: Goal): GoalWithCalculations {
    const goalContribs = db.goalContributions.filter(
      (c) => c.goalId === goal.id && c.userId === goal.userId
    );
    const savedAmount = Math.round(goalContribs.reduce((acc, c) => acc + c.amount, 0) * 100) / 100;
    const remainingAmount = Math.max(0, Math.round((goal.targetAmount - savedAmount) * 100) / 100);
    const progressPercentage = goal.targetAmount > 0
      ? Math.round((savedAmount / goal.targetAmount) * 1000) / 10
      : 0;

    let daysRemaining: number | null = null;
    let isOverdue = false;
    if (goal.targetDate) {
      const today = new Date('2026-10-24T00:00:00Z');
      const targetDateObj = new Date(goal.targetDate + 'T00:00:00Z');
      const diffMs = targetDateObj.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (daysRemaining < 0) {
        isOverdue = true;
      }
    }

    let monthlyNeeded: number | null = null;
    let weeklyNeeded: number | null = null;
    let dailyNeeded: number | null = null;
    let monthsRemaining: number | null = null;
    let statusText = '';

    if (savedAmount >= goal.targetAmount) {
      statusText = 'Target reached! Milestone achieved.';
      monthlyNeeded = 0;
      weeklyNeeded = 0;
      dailyNeeded = 0;
      monthsRemaining = 0;
    } else if (!goal.targetDate) {
      statusText = 'No deadline set. Define a target date to estimate monthly contribution requirements.';
    } else if (daysRemaining !== null && daysRemaining <= 0) {
      statusText = 'Target deadline has passed. Consider extending deadline or adding contributions.';
      monthsRemaining = 0;
    } else if (daysRemaining !== null && daysRemaining > 0) {
      const rawMonths = Math.max(0.1, daysRemaining / 30.4375);
      monthsRemaining = Math.round(rawMonths * 10) / 10;
      monthlyNeeded = Math.round((remainingAmount / Math.max(0.5, rawMonths)) * 100) / 100;
      const rawWeeks = Math.max(0.1, daysRemaining / 7);
      weeklyNeeded = Math.round((remainingAmount / rawWeeks) * 100) / 100;
      dailyNeeded = Math.round((remainingAmount / Math.max(1, daysRemaining)) * 100) / 100;
      statusText = `Save ₹${monthlyNeeded.toLocaleString('en-IN')}/month to reach target by ${goal.targetDate}`;
    }

    const sortedContribs = [...goalContribs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      ...goal,
      savedAmount,
      remainingAmount,
      progressPercentage,
      daysRemaining,
      isOverdue,
      contributionsCount: sortedContribs.length,
      contributions: sortedContribs,
      projections: {
        monthlyNeeded,
        weeklyNeeded,
        dailyNeeded,
        monthsRemaining,
        daysRemaining,
        statusText,
      },
    };
  },

  getGoalById(userId: string, goalId: string): GoalWithCalculations | null {
    const goal = db.goals.find((g) => g.id === goalId && g.userId === userId);
    if (!goal) return null;
    return this.calculateGoal(goal);
  },

  createGoal(
    userId: string,
    data: {
      name: string;
      category: string;
      targetAmount: number;
      initialAmount?: number;
      targetDate?: string;
      description?: string;
      color?: string;
      icon?: string;
      frequencyPreference?: 'weekly' | 'bi-weekly' | 'monthly' | 'one-time';
    }
  ): GoalWithCalculations {
    const goalId = `gol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const initialAmt = typeof data.initialAmount === 'number' && data.initialAmount > 0
      ? Math.round(data.initialAmount * 100) / 100
      : 0;

    const newGoal: Goal = {
      id: goalId,
      userId,
      name: data.name.trim(),
      category: data.category.trim() || 'General',
      targetAmount: Math.round(data.targetAmount * 100) / 100,
      initialAmount: initialAmt,
      targetDate: data.targetDate ? data.targetDate.trim() : undefined,
      description: data.description ? data.description.trim() : undefined,
      color: data.color || '#1677F2',
      icon: data.icon || 'Target',
      status: initialAmt >= data.targetAmount ? 'completed' : 'active',
      frequencyPreference: data.frequencyPreference || 'monthly',
      createdAt: now,
      updatedAt: now,
    };

    db.goals.push(newGoal);

    // If an initial deposit/starting amount was provided, record it as the inaugural contribution
    if (initialAmt > 0) {
      const contribId = `gc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const contrib: GoalContribution = {
        id: contribId,
        goalId: newGoal.id,
        userId,
        amount: initialAmt,
        date: now.split('T')[0],
        note: 'Starting contribution balance',
        source: 'Initial Deposit',
        createdAt: now,
      };
      db.goalContributions.push(contrib);
    }

    saveDatabase(db);
    return this.calculateGoal(newGoal);
  },

  updateGoal(
    userId: string,
    goalId: string,
    updates: {
      name?: string;
      category?: string;
      targetAmount?: number;
      targetDate?: string;
      description?: string;
      color?: string;
      icon?: string;
      status?: GoalStatus;
      frequencyPreference?: 'weekly' | 'bi-weekly' | 'monthly' | 'one-time';
    }
  ): GoalWithCalculations | null {
    const goal = db.goals.find((g) => g.id === goalId && g.userId === userId);
    if (!goal) return null;

    if (updates.name !== undefined) goal.name = updates.name.trim();
    if (updates.category !== undefined) goal.category = updates.category.trim();
    if (typeof updates.targetAmount === 'number') {
      goal.targetAmount = Math.round(updates.targetAmount * 100) / 100;
    }
    if (updates.targetDate !== undefined) {
      goal.targetDate = updates.targetDate ? updates.targetDate.trim() : undefined;
    }
    if (updates.description !== undefined) {
      goal.description = updates.description ? updates.description.trim() : undefined;
    }
    if (updates.color !== undefined) goal.color = updates.color;
    if (updates.icon !== undefined) goal.icon = updates.icon;
    if (updates.frequencyPreference !== undefined) {
      goal.frequencyPreference = updates.frequencyPreference;
    }

    // Check explicit status change or recalculate completion if target changed
    if (updates.status !== undefined) {
      goal.status = updates.status;
    } else if (typeof updates.targetAmount === 'number') {
      const contribs = db.goalContributions.filter((c) => c.goalId === goal.id && c.userId === userId);
      const saved = contribs.reduce((acc, c) => acc + c.amount, 0);
      if (goal.status === 'completed' && saved < goal.targetAmount) {
        goal.status = 'active';
      } else if (goal.status === 'active' && saved >= goal.targetAmount) {
        goal.status = 'completed';
      }
    }

    goal.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return this.calculateGoal(goal);
  },

  deleteGoal(userId: string, goalId: string): boolean {
    const initialLen = db.goals.length;
    db.goals = db.goals.filter((g) => !(g.id === goalId && g.userId === userId));
    const deleted = db.goals.length < initialLen;

    if (deleted) {
      // Clean up orphaned contributions associated with this goal only
      db.goalContributions = db.goalContributions.filter(
        (c) => !(c.goalId === goalId && c.userId === userId)
      );
      saveDatabase(db);
    }
    return deleted;
  },

  addContribution(
    userId: string,
    goalId: string,
    data: {
      amount: number;
      date?: string;
      note?: string;
      source?: string;
    }
  ): { goal: GoalWithCalculations; contribution: GoalContribution } | null {
    const goal = db.goals.find((g) => g.id === goalId && g.userId === userId);
    if (!goal) return null;

    const amount = Math.round(data.amount * 100) / 100;
    const now = new Date().toISOString();
    const contribDate = data.date && /^\d{4}-\d{2}-\d{2}$/.test(data.date)
      ? data.date
      : now.split('T')[0];

    const contribId = `gc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newContrib: GoalContribution = {
      id: contribId,
      goalId,
      userId,
      amount,
      date: contribDate,
      note: data.note ? data.note.trim() : undefined,
      source: data.source ? data.source.trim() : 'Manual Contribution',
      createdAt: now,
    };

    db.goalContributions.push(newContrib);

    // Check if new saved total meets or exceeds target
    const currentContribs = db.goalContributions.filter(
      (c) => c.goalId === goal.id && c.userId === userId
    );
    const newSaved = currentContribs.reduce((acc, c) => acc + c.amount, 0);

    if (goal.status === 'active' && newSaved >= goal.targetAmount) {
      goal.status = 'completed';
    }

    goal.updatedAt = now;
    saveDatabase(db);

    return {
      goal: this.calculateGoal(goal),
      contribution: newContrib,
    };
  },

  deleteContribution(
    userId: string,
    goalId: string,
    contributionId: string
  ): GoalWithCalculations | null {
    const goal = db.goals.find((g) => g.id === goalId && g.userId === userId);
    if (!goal) return null;

    const initialLen = db.goalContributions.length;
    db.goalContributions = db.goalContributions.filter(
      (c) => !(c.id === contributionId && c.goalId === goalId && c.userId === userId)
    );

    if (db.goalContributions.length === initialLen) {
      return null; // Not found or unauthorized
    }

    // Recalculate status if goal was marked completed and now drops below target
    const remainingContribs = db.goalContributions.filter(
      (c) => c.goalId === goal.id && c.userId === userId
    );
    const newSaved = remainingContribs.reduce((acc, c) => acc + c.amount, 0);

    if (goal.status === 'completed' && newSaved < goal.targetAmount) {
      goal.status = 'active';
    }

    goal.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return this.calculateGoal(goal);
  },

  getGoalSummary(userId: string): GoalSummary {
    const allGoals = this.getGoals(userId, 'all');
    const activeGoals = allGoals.filter((g) => g.status === 'active');
    const completedGoals = allGoals.filter((g) => g.status === 'completed');
    const pausedGoals = allGoals.filter((g) => g.status === 'paused');
    const archivedGoals = allGoals.filter((g) => g.status === 'archived');

    const totalTarget = Math.round(activeGoals.reduce((acc, g) => acc + g.targetAmount, 0) * 100) / 100;
    const totalSaved = Math.round(activeGoals.reduce((acc, g) => acc + g.savedAmount, 0) * 100) / 100;
    const totalRemaining = Math.max(0, Math.round((totalTarget - totalSaved) * 100) / 100);
    const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 1000) / 10 : 0;

    return {
      totalTarget,
      totalSaved,
      totalRemaining,
      activeCount: activeGoals.length,
      completedCount: completedGoals.length,
      pausedCount: pausedGoals.length,
      archivedCount: archivedGoals.length,
      overallProgress,
    };
  },

  getUserPreferences(userId: string): UserPreferences {
    let pref = db.userPreferences.find((p) => p.userId === userId);
    if (!pref) {
      pref = {
        userId,
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Kolkata',
        tableDensity: 'comfortable',
        emailAlerts: true,
        monthlyDigest: true,
        budgetThresholdAlerts: true,
        updatedAt: new Date().toISOString(),
      };
      db.userPreferences.push(pref);
      saveDatabase(db);
    }
    return pref;
  },

  updateUserPreferences(userId: string, updates: Partial<UserPreferences>): UserPreferences {
    let pref = db.userPreferences.find((p) => p.userId === userId);
    if (!pref) {
      pref = {
        userId,
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Kolkata',
        tableDensity: 'comfortable',
        emailAlerts: true,
        monthlyDigest: true,
        budgetThresholdAlerts: true,
        updatedAt: new Date().toISOString(),
      };
      db.userPreferences.push(pref);
    }
    if (updates.currency !== undefined) pref.currency = updates.currency;
    if (updates.dateFormat !== undefined) pref.dateFormat = updates.dateFormat;
    if (updates.timezone !== undefined) pref.timezone = updates.timezone;
    if (updates.tableDensity !== undefined) pref.tableDensity = updates.tableDensity;
    if (updates.emailAlerts !== undefined) pref.emailAlerts = updates.emailAlerts;
    if (updates.monthlyDigest !== undefined) pref.monthlyDigest = updates.monthlyDigest;
    if (updates.budgetThresholdAlerts !== undefined) pref.budgetThresholdAlerts = updates.budgetThresholdAlerts;
    pref.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return pref;
  },

  updateUserPassword(userId: string, newPasswordHash: string): boolean {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return false;
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return true;
  },

  deleteAccount(userId: string): boolean {
    const initialLen = db.users.length;
    db.users = db.users.filter((u) => u.id !== userId);
    db.transactions = db.transactions.filter((t) => t.userId !== userId);
    db.budgets = db.budgets.filter((b) => b.userId !== userId);
    db.goals = db.goals.filter((g) => g.userId !== userId);
    db.goalContributions = db.goalContributions.filter((c) => c.userId !== userId);
    db.userPreferences = db.userPreferences.filter((p) => p.userId !== userId);
    const deleted = db.users.length < initialLen;
    if (deleted) {
      db.recurringSchedules = db.recurringSchedules.filter((s) => s.userId !== userId);
      db.recurringOccurrences = db.recurringOccurrences.filter((o) => o.userId !== userId);
      saveDatabase(db);
    }
    return deleted;
  },

  // ==================== PHASE 8: RECURRING TRANSACTIONS METHODS ====================

  getRecurringSchedules(
    userId: string,
    filters?: {
      status?: string;
      type?: string;
      frequency?: string;
      search?: string;
    }
  ): RecurringSchedule[] {
    let list = db.recurringSchedules.filter((s) => s.userId === userId);

    if (filters?.status && filters.status !== 'all') {
      list = list.filter((s) => s.status === filters.status);
    }

    if (filters?.type && (filters.type === 'income' || filters.type === 'expense')) {
      list = list.filter((s) => s.type === filters.type);
    }

    if (filters?.frequency && filters.frequency !== 'all') {
      list = list.filter((s) => s.frequency === filters.frequency);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          (s.merchant && s.merchant.toLowerCase().includes(q)) ||
          (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => new Date(a.nextRunDate).getTime() - new Date(b.nextRunDate).getTime());
  },

  getRecurringScheduleById(userId: string, id: string): RecurringSchedule | undefined {
    return db.recurringSchedules.find((s) => s.id === id && s.userId === userId);
  },

  createRecurringSchedule(
    userId: string,
    data: {
      name: string;
      type: 'income' | 'expense';
      amount: number;
      category: string;
      frequency: RecurrenceFrequency;
      startDate: string;
      endDate?: string;
      maxOccurrences?: number;
      dayOfWeek?: number;
      dayOfMonth?: number;
      paymentMethod?: string;
      merchant?: string;
      notes?: string;
    }
  ): RecurringSchedule {
    const cleanAmount = Math.round(data.amount * 100) / 100;
    const now = new Date().toISOString();
    const id = `rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const startDate = data.startDate || now.split('T')[0];

    const newSchedule: RecurringSchedule = {
      id,
      userId,
      name: data.name.trim(),
      type: data.type,
      amount: cleanAmount,
      category: data.category.trim() || 'General',
      frequency: data.frequency,
      startDate,
      endDate: data.endDate ? data.endDate.trim() : undefined,
      maxOccurrences: data.maxOccurrences && data.maxOccurrences > 0 ? data.maxOccurrences : undefined,
      dayOfWeek: typeof data.dayOfWeek === 'number' ? data.dayOfWeek : undefined,
      dayOfMonth: typeof data.dayOfMonth === 'number' ? data.dayOfMonth : parseInt(startDate.split('-')[2], 10),
      status: 'active',
      paymentMethod: data.paymentMethod?.trim() || 'UPI / NetBanking',
      merchant: data.merchant?.trim() || '',
      notes: data.notes?.trim() || '',
      nextRunDate: startDate,
      completedOccurrences: 0,
      createdAt: now,
      updatedAt: now,
    };

    db.recurringSchedules.push(newSchedule);
    saveDatabase(db);
    return newSchedule;
  },

  updateRecurringSchedule(
    userId: string,
    id: string,
    updates: Partial<RecurringSchedule>
  ): RecurringSchedule | null {
    const schedule = db.recurringSchedules.find((s) => s.id === id && s.userId === userId);
    if (!schedule) return null;

    if (updates.name !== undefined) schedule.name = updates.name.trim();
    if (updates.type !== undefined) schedule.type = updates.type;
    if (typeof updates.amount === 'number') schedule.amount = Math.round(updates.amount * 100) / 100;
    if (updates.category !== undefined) schedule.category = updates.category.trim();
    if (updates.frequency !== undefined) schedule.frequency = updates.frequency;
    if (updates.startDate !== undefined) schedule.startDate = updates.startDate;
    if (updates.endDate !== undefined) schedule.endDate = updates.endDate || undefined;
    if (updates.maxOccurrences !== undefined) schedule.maxOccurrences = updates.maxOccurrences || undefined;
    if (updates.dayOfWeek !== undefined) schedule.dayOfWeek = updates.dayOfWeek;
    if (updates.dayOfMonth !== undefined) schedule.dayOfMonth = updates.dayOfMonth;
    if (updates.paymentMethod !== undefined) schedule.paymentMethod = updates.paymentMethod;
    if (updates.merchant !== undefined) schedule.merchant = updates.merchant;
    if (updates.notes !== undefined) schedule.notes = updates.notes;
    if (updates.status !== undefined) schedule.status = updates.status;

    schedule.updatedAt = new Date().toISOString();
    saveDatabase(db);
    return schedule;
  },

  pauseRecurringSchedule(userId: string, id: string): RecurringSchedule | null {
    return this.updateRecurringSchedule(userId, id, { status: 'paused' });
  },

  resumeRecurringSchedule(userId: string, id: string): RecurringSchedule | null {
    return this.updateRecurringSchedule(userId, id, { status: 'active' });
  },

  cancelRecurringSchedule(userId: string, id: string): RecurringSchedule | null {
    return this.updateRecurringSchedule(userId, id, { status: 'cancelled' });
  },

  deleteRecurringSchedule(userId: string, id: string): boolean {
    const initialLen = db.recurringSchedules.length;
    db.recurringSchedules = db.recurringSchedules.filter((s) => !(s.id === id && s.userId === userId));
    const deleted = db.recurringSchedules.length < initialLen;
    if (deleted) {
      // Retain generated transactions; only remove schedule metadata
      saveDatabase(db);
    }
    return deleted;
  },

  getScheduleOccurrences(userId: string, scheduleId: string): RecurringOccurrence[] {
    return db.recurringOccurrences
      .filter((o) => o.scheduleId === scheduleId && o.userId === userId)
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());
  },

  getRecurringSummary(userId: string) {
    const userSchedules = db.recurringSchedules.filter((s) => s.userId === userId);
    const activeSchedules = userSchedules.filter((s) => s.status === 'active');

    // Estimate monthly income and expense from active schedules
    let estMonthlyIncome = 0;
    let estMonthlyExpense = 0;

    activeSchedules.forEach((s) => {
      let monthlyFactor = 1;
      switch (s.frequency) {
        case 'daily':
          monthlyFactor = 30;
          break;
        case 'weekly':
          monthlyFactor = 4.33;
          break;
        case 'biweekly':
          monthlyFactor = 2.16;
          break;
        case 'monthly':
          monthlyFactor = 1;
          break;
        case 'quarterly':
          monthlyFactor = 1 / 3;
          break;
        case 'semiannual':
          monthlyFactor = 1 / 6;
          break;
        case 'yearly':
          monthlyFactor = 1 / 12;
          break;
      }

      if (s.type === 'income') estMonthlyIncome += s.amount * monthlyFactor;
      if (s.type === 'expense') estMonthlyExpense += s.amount * monthlyFactor;
    });

    estMonthlyIncome = Math.round(estMonthlyIncome * 100) / 100;
    estMonthlyExpense = Math.round(estMonthlyExpense * 100) / 100;

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingItems = activeSchedules.filter((s) => s.nextRunDate >= todayStr);
    upcomingItems.sort((a, b) => new Date(a.nextRunDate).getTime() - new Date(b.nextRunDate).getTime());

    const nextUpcoming = upcomingItems.length > 0 ? upcomingItems[0] : null;

    return {
      totalSchedulesCount: userSchedules.length,
      activeCount: activeSchedules.length,
      pausedCount: userSchedules.filter((s) => s.status === 'paused').length,
      completedCount: userSchedules.filter((s) => s.status === 'completed').length,
      cancelledCount: userSchedules.filter((s) => s.status === 'cancelled').length,
      upcomingCount: upcomingItems.length,
      estMonthlyIncome,
      estMonthlyExpense,
      nextUpcomingPayment: nextUpcoming
        ? {
            name: nextUpcoming.name,
            amount: nextUpcoming.amount,
            type: nextUpcoming.type,
            date: nextUpcoming.nextRunDate,
            category: nextUpcoming.category,
          }
        : null,
    };
  },

  getUpcomingOccurrences(userId: string, daysAhead = 30) {
    const userSchedules = db.recurringSchedules.filter((s) => s.userId === userId && s.status === 'active');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const futureDate = new Date(today.getTime() + daysAhead * 86400000);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const projected: Array<{
      scheduleId: string;
      name: string;
      type: 'income' | 'expense';
      amount: number;
      category: string;
      scheduledDate: string;
      frequency: RecurrenceFrequency;
      paymentMethod?: string;
    }> = [];

    userSchedules.forEach((s) => {
      let curDate = s.nextRunDate;
      let iterations = 0;

      while (curDate <= futureDateStr && iterations < 12) {
        if (curDate >= todayStr) {
          if (!s.endDate || curDate <= s.endDate) {
            projected.push({
              scheduleId: s.id,
              name: s.name,
              type: s.type,
              amount: s.amount,
              category: s.category,
              scheduledDate: curDate,
              frequency: s.frequency,
              paymentMethod: s.paymentMethod,
            });
          }
        }
        curDate = calculateNextRunDate(curDate, s.frequency, s.dayOfMonth, s.dayOfWeek);
        iterations++;
      }
    });

    return projected.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  },

  // ==================== SCHEDULER & IDEMPOTENT EXECUTION ENGINE ====================

  processDueRecurringSchedules(asOfDate?: string): {
    processedSchedulesCount: number;
    generatedTransactionsCount: number;
    skippedCount: number;
    details: string[];
  } {
    const todayStr = asOfDate || new Date().toISOString().split('T')[0];
    const activeSchedules = db.recurringSchedules.filter((s) => s.status === 'active');

    let processedSchedulesCount = 0;
    let generatedTransactionsCount = 0;
    let skippedCount = 0;
    const details: string[] = [];

    for (const schedule of activeSchedules) {
      if (schedule.nextRunDate > todayStr) {
        continue;
      }

      let currentDue = schedule.nextRunDate;
      let scheduleProcessed = false;
      let safetyCounter = 0;

      while (currentDue <= todayStr && safetyCounter < 50) {
        safetyCounter++;

        // End date limit check
        if (schedule.endDate && currentDue > schedule.endDate) {
          schedule.status = 'completed';
          schedule.updatedAt = new Date().toISOString();
          details.push(`Schedule "${schedule.name}" reached end date (${schedule.endDate}). Marked completed.`);
          break;
        }

        // Max occurrences limit check
        if (schedule.maxOccurrences && schedule.completedOccurrences >= schedule.maxOccurrences) {
          schedule.status = 'completed';
          schedule.updatedAt = new Date().toISOString();
          details.push(`Schedule "${schedule.name}" reached max occurrences limit (${schedule.maxOccurrences}). Marked completed.`);
          break;
        }

        // Idempotency check: has this occurrence already been processed?
        const existingOcc = db.recurringOccurrences.find(
          (o) => o.scheduleId === schedule.id && o.scheduledDate === currentDue
        );

        if (existingOcc && (existingOcc.status === 'generated' || existingOcc.status === 'skipped')) {
          skippedCount++;
          // Advance to next run date to prevent stuck loop
          currentDue = calculateNextRunDate(currentDue, schedule.frequency, schedule.dayOfMonth, schedule.dayOfWeek);
          schedule.nextRunDate = currentDue;
          continue;
        }

        // Generate authoritative transaction using standard createTransaction
        try {
          const generatedTx = this.createTransaction(schedule.userId, {
            type: schedule.type,
            amount: schedule.amount,
            category: schedule.category,
            date: currentDue,
            description: `${schedule.name} (Automated)`,
            paymentMethod: schedule.paymentMethod || 'Scheduled Auto-Debit',
            merchant: schedule.merchant || '',
          });

          // Record occurrence record
          const occId = `occ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const occRecord: RecurringOccurrence = {
            id: occId,
            scheduleId: schedule.id,
            userId: schedule.userId,
            scheduledDate: currentDue,
            processedAt: new Date().toISOString(),
            status: 'generated',
            transactionId: generatedTx.id,
          };

          db.recurringOccurrences.push(occRecord);

          schedule.completedOccurrences += 1;
          schedule.lastRunDate = currentDue;
          scheduleProcessed = true;
          generatedTransactionsCount++;

          details.push(
            `Generated transaction ${generatedTx.id} (₹${schedule.amount}) for "${schedule.name}" on ${currentDue}`
          );

          // Calculate next run date
          currentDue = calculateNextRunDate(currentDue, schedule.frequency, schedule.dayOfMonth, schedule.dayOfWeek);
          schedule.nextRunDate = currentDue;
          schedule.updatedAt = new Date().toISOString();

          // Check if completion threshold hit after incrementing
          if (schedule.maxOccurrences && schedule.completedOccurrences >= schedule.maxOccurrences) {
            schedule.status = 'completed';
            details.push(`Schedule "${schedule.name}" reached max occurrences limit after execution.`);
            break;
          }
          if (schedule.endDate && currentDue > schedule.endDate) {
            schedule.status = 'completed';
            details.push(`Schedule "${schedule.name}" reached end date after execution.`);
            break;
          }
        } catch (err: any) {
          console.error(`Failed to generate transaction for schedule ${schedule.id}:`, err);
          const occId = `occ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          db.recurringOccurrences.push({
            id: occId,
            scheduleId: schedule.id,
            userId: schedule.userId,
            scheduledDate: currentDue,
            processedAt: new Date().toISOString(),
            status: 'failed',
            errorMessage: err?.message || 'Transaction creation error',
          });
          currentDue = calculateNextRunDate(currentDue, schedule.frequency, schedule.dayOfMonth, schedule.dayOfWeek);
          schedule.nextRunDate = currentDue;
          break;
        }
      }

      if (scheduleProcessed) {
        processedSchedulesCount++;
      }
    }

    saveDatabase(db);

    return {
      processedSchedulesCount,
      generatedTransactionsCount,
      skippedCount,
      details,
    };
  },
};

// Date calculation helper exported for tests and standalone use
export function calculateNextRunDate(
  fromDate: string,
  frequency: RecurrenceFrequency,
  dayOfMonth?: number,
  _dayOfWeek?: number
): string {
  const [yStr, mStr, dStr] = fromDate.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const d = parseInt(dStr, 10);
  const dt = new Date(Date.UTC(y, m - 1, d));

  switch (frequency) {
    case 'daily':
      dt.setUTCDate(dt.getUTCDate() + 1);
      break;
    case 'weekly':
      dt.setUTCDate(dt.getUTCDate() + 7);
      break;
    case 'biweekly':
      dt.setUTCDate(dt.getUTCDate() + 14);
      break;
    case 'monthly': {
      let targetMonth = dt.getUTCMonth() + 1;
      let targetYear = dt.getUTCFullYear();
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear += 1;
      }
      const desiredDay = dayOfMonth || d;
      const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
      const actualDay = Math.min(desiredDay, daysInTargetMonth);
      return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;
    }
    case 'quarterly': {
      let targetMonth = dt.getUTCMonth() + 3;
      let targetYear = dt.getUTCFullYear();
      if (targetMonth > 11) {
        targetYear += Math.floor(targetMonth / 12);
        targetMonth = targetMonth % 12;
      }
      const desiredDay = dayOfMonth || d;
      const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
      const actualDay = Math.min(desiredDay, daysInTargetMonth);
      return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;
    }
    case 'semiannual': {
      let targetMonth = dt.getUTCMonth() + 6;
      let targetYear = dt.getUTCFullYear();
      if (targetMonth > 11) {
        targetYear += Math.floor(targetMonth / 12);
        targetMonth = targetMonth % 12;
      }
      const desiredDay = dayOfMonth || d;
      const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
      const actualDay = Math.min(desiredDay, daysInTargetMonth);
      return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;
    }
    case 'yearly': {
      const targetYear = dt.getUTCFullYear() + 1;
      const targetMonth = dt.getUTCMonth();
      const desiredDay = dayOfMonth || d;
      const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
      const actualDay = Math.min(desiredDay, daysInTargetMonth);
      return `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(actualDay).padStart(2, '0')}`;
    }
    default:
      dt.setUTCDate(dt.getUTCDate() + 30);
      break;
  }

  const ny = dt.getUTCFullYear();
  const nm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const nd = String(dt.getUTCDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}


