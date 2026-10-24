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
