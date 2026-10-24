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

// ==================== PHASE 4: ANALYTICS TYPES ====================

export type AnalyticsPeriodPreset =
  | 'this_month'
  | 'last_month'
  | 'last_3_months'
  | 'last_6_months'
  | 'this_year'
  | 'custom';

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number | null; // null when income is zero
  avgDailySpend: number;
  budgetUtilization: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  daysInPeriod: number;
  currency: string;
}

export interface AnalyticsTimeSeriesPoint {
  key: string;
  label: string;
  date: string;
  income: number;
  expenses: number;
  net: number;
}

export interface AnalyticsCategoryItem {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  color: string;
}

export interface PeriodMetricDelta {
  amount: number;
  percentage: number | null;
  direction: 'up' | 'down' | 'flat';
  isFavorable: boolean; // e.g. lower expense is favorable, higher income is favorable
}

export interface AnalyticsPeriodComparison {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  current: {
    income: number;
    expenses: number;
    net: number;
    savingsRate: number | null;
  };
  previous: {
    income: number;
    expenses: number;
    net: number;
    savingsRate: number | null;
  };
  deltas: {
    income: PeriodMetricDelta;
    expenses: PeriodMetricDelta;
    net: PeriodMetricDelta;
    savingsRateDiff: number | null;
  };
}

export interface AnalyticsSpendingTrends {
  trajectory: 'increasing' | 'decreasing' | 'stable';
  trajectoryPercentage: number;
  trajectoryDescription: string;
  peakSpendDay: {
    date: string;
    amount: number;
    formattedDate: string;
  } | null;
  topCategory: {
    name: string;
    amount: number;
    percentage: number;
  } | null;
}

export interface AnalyticsBudgetPerformance {
  totalAllocated: number;
  totalSpent: number;
  utilizationPercentage: number;
  overBudgetCount: number;
  warningCount: number;
  onTrackCount: number;
  budgetCount: number;
  budgets: BudgetWithCalculations[];
}

export interface SmartInsight {
  id: string;
  type: 'positive' | 'warning' | 'info' | 'danger';
  title: string;
  description: string;
  metric?: string;
  actionText?: string;
  actionTarget?: NavigationPage;
}

export interface TopExpenseItem {
  id: string;
  description: string;
  merchant?: string;
  category: string;
  date: string;
  amount: number;
  percentageOfTotal: number;
}

export interface AnalyticsData {
  periodPreset: AnalyticsPeriodPreset;
  startDate: string;
  endDate: string;
  periodLabel: string;
  summary: AnalyticsSummary;
  timeSeries: AnalyticsTimeSeriesPoint[];
  categoryBreakdown: AnalyticsCategoryItem[];
  comparison: AnalyticsPeriodComparison;
  spendingTrends: AnalyticsSpendingTrends;
  budgetPerformance: AnalyticsBudgetPerformance;
  smartInsights: SmartInsight[];
  topExpenses: TopExpenseItem[];
}

// ==================== PHASE 5: SAVINGS GOALS TYPES ====================

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export type GoalFilterType = 'all' | 'active' | 'completed' | 'paused' | 'archived';

export type GoalSortType = 'deadline' | 'progress_desc' | 'progress_asc' | 'target_desc' | 'target_asc' | 'created_desc';

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


