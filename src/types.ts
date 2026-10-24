export interface User {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
  paymentMethod?: string;
  merchant?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyOverviewItem {
  month: string;
  monthCode: string;
  income: number;
  expenses: number;
}

export interface CategoryExpense {
  name: string;
  amount: number;
  percentage: number;
}

export interface DashboardSummary {
  period: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  incomeGrowth: string;
  expenseGrowth: string;
  balanceGrowth: string;
  monthlyOverview: MonthlyOverviewItem[];
  expensesByCategory: CategoryExpense[];
  recentTransactions: Transaction[];
  transactionCount: number;
}

export type BudgetType = 'category' | 'overall';

export interface Budget {
  id: string;
  userId: string;
  name: string;
  type: BudgetType;
  category?: string;
  amount: number;
  period: string;
  notes?: string;
  alertThreshold: number;
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

export interface BudgetAlert {
  id: string;
  budgetId: string;
  budgetName: string;
  percentage: number;
  threshold: number;
  amount: number;
  spent: number;
  status: string;
  message: string;
  level: 'warning' | 'danger';
}

export interface BudgetSummary {
  period: string;
  budgetCount: number;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  overBudgetCount: number;
  warningCount: number;
  alerts: BudgetAlert[];
  budgets: BudgetWithCalculations[];
}

export type NavigationPage =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'transactions'
  | 'budgets'
  | 'analytics'
  | 'goals'
  | 'reports'
  | 'settings';
