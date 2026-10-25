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
  | 'recurring'
  | 'budgets'
  | 'analytics'
  | 'goals'
  | 'reports'
  | 'settings'
  | 'notifications'
  | 'insights';

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

// ==================== PHASE 8: RECURRING TRANSACTIONS TYPES ====================

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
  dayOfWeek?: number;
  dayOfMonth?: number;
  status: RecurringScheduleStatus;
  paymentMethod?: string;
  merchant?: string;
  notes?: string;
  nextRunDate: string; // YYYY-MM-DD
  lastRunDate?: string;
  completedOccurrences: number;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringOccurrence {
  id: string;
  scheduleId: string;
  userId: string;
  scheduledDate: string;
  processedAt: string;
  status: 'generated' | 'skipped' | 'failed';
  transactionId?: string;
  errorMessage?: string;
}

export interface RecurringSummary {
  totalSchedulesCount: number;
  activeCount: number;
  pausedCount: number;
  completedCount: number;
  cancelledCount: number;
  upcomingCount: number;
  estMonthlyIncome: number;
  estMonthlyExpense: number;
  nextUpcomingPayment: {
    name: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
    category: string;
  } | null;
}

export interface UpcomingOccurrenceProjected {
  scheduleId: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  scheduledDate: string;
  frequency: RecurrenceFrequency;
  paymentMethod?: string;
}

// ==================== PHASE 9: NOTIFICATIONS & FINANCIAL ALERTS TYPES ====================

export type NotificationCategory =
  | 'budget_alert'
  | 'recurring_reminder'
  | 'recurring_failure'
  | 'goal_milestone'
  | 'goal_deadline'
  | 'weekly_summary'
  | 'monthly_summary'
  | 'security_alert'
  | 'system_info';

export interface AppNotification {
  id: string;
  userId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  isRead: boolean;
  actionTarget?: NavigationPage;
  actionPayload?: Record<string, any>;
  dedupeKey: string;
  createdAt: string; // ISO string
}

// ==================== PHASE 10: FINANCIAL INSIGHTS & PLANNING TYPES ====================

export type ForecastHorizon = '7d' | '30d' | '3m' | '6m';

export interface FinancialHealthOverview {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  savingsRate: number | null;
  avgDailyExpenses: number;
  budgetUtilization: number;
  activeGoalProgress: number;
  essentialSpending: number;
  discretionarySpending: number;
  healthScore: number;
  healthScoreLabel: string;
}

export interface CashFlowForecastPoint {
  date: string;
  label: string;
  actualIncome?: number;
  actualExpenses?: number;
  forecastIncome?: number;
  forecastExpenses?: number;
  forecastNet?: number;
  type: 'actual' | 'forecast';
}

export interface CashFlowForecast {
  horizon: ForecastHorizon;
  estimatedIncome: number;
  estimatedExpenses: number;
  estimatedNetCashFlow: number;
  expectedRecurringIncome: number;
  expectedRecurringExpenses: number;
  unscheduledEstimatedExpenses: number;
  forecastPoints: CashFlowForecastPoint[];
  confidence: 'High' | 'Moderate' | 'Limited';
}

export interface SpendingTrendItem {
  category: string;
  currentAmount: number;
  previousAmount: number;
  changeAmount: number;
  changePercentage: number | null;
  trend: 'up' | 'down' | 'flat';
}

export interface HistoricalSpendingTrends {
  currentPeriodLabel: string;
  previousPeriodLabel: string;
  topCategories: SpendingTrendItem[];
  largestExpenses: TopExpenseItem[];
  recurringVsNonRecurring: {
    recurringAmount: number;
    nonRecurringAmount: number;
    recurringPercentage: number;
    nonRecurringPercentage: number;
  };
  avgDailySpending: number;
}

export interface BudgetForecastItem {
  budgetId: string;
  budgetName: string;
  limit: number;
  actualSpent: number;
  remainingAmount: number;
  percentageUsed: number;
  daysElapsed: number;
  daysRemaining: number;
  projectedEndSpending: number;
  projectedOverage: number;
  status: 'on_track' | 'warning' | 'near_limit' | 'over_budget' | 'projected_overrun';
  confidence: 'High' | 'Moderate' | 'Limited';
}

export interface SavingsGoalProjectionItem {
  goalId: string;
  goalName: string;
  targetAmount: number;
  savedAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  targetDate?: string;
  daysRemaining: number | null;
  requiredMonthlyContribution: number | null;
  requiredWeeklyContribution: number | null;
  estimatedCompletionDate: string | null;
  historicalMonthlyVelocity: number;
  statusText: string;
}

export interface UnusualSpendingSignal {
  id: string;
  category: string;
  type: 'large_transaction' | 'category_spike' | 'budget_exceeded' | 'new_recurring';
  title: string;
  explanation: string;
  actualValue: number;
  baselineValue: number;
  percentageIncrease: number;
  transactionId?: string;
  date: string;
}

export interface FinancialRecommendation {
  id: string;
  title: string;
  observedPattern: string;
  supportingData: string;
  suggestedAction: string;
  assumptions: string;
  type: 'budget' | 'recurring' | 'savings' | 'spending' | 'buffer';
  actionTarget?: NavigationPage;
  actionPayload?: Record<string, any>;
}

export interface ForecastConfidenceMeta {
  level: 'High' | 'Moderate' | 'Limited';
  description: string;
  factors: string[];
  historicalPeriodCount: number;
  totalTransactionCount: number;
  recurringScheduleCount: number;
}

export interface FinancialInsightsData {
  periodPreset: AnalyticsPeriodPreset;
  forecastHorizon: ForecastHorizon;
  lastUpdated: string;
  healthOverview: FinancialHealthOverview;
  cashFlowForecast: CashFlowForecast;
  spendingTrends: HistoricalSpendingTrends;
  budgetForecasts: BudgetForecastItem[];
  savingsProjections: SavingsGoalProjectionItem[];
  unusualSpending: UnusualSpendingSignal[];
  recommendations: FinancialRecommendation[];
  confidenceMeta: ForecastConfidenceMeta;
}


