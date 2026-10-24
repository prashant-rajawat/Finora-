import React from 'react';
import { AnalyticsSummary, AnalyticsPeriodComparison } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  HelpCircle,
} from 'lucide-react';

interface AnalyticsCardsProps {
  summary: AnalyticsSummary;
  comparison: AnalyticsPeriodComparison;
  onNavigateToBudgets?: () => void;
}

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({
  summary,
  comparison,
  onNavigateToBudgets,
}) => {
  const formatINR = (val: number) => {
    return `₹${Math.abs(val).toLocaleString('en-IN')}`;
  };

  const getDeltaBadge = (
    delta: { amount: number; percentage: number | null; direction: 'up' | 'down' | 'flat'; isFavorable: boolean },
    unit = '%'
  ) => {
    if (delta.percentage === null && delta.amount === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#718096] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
          <Minus size={11} />
          <span>No prior data</span>
        </span>
      );
    }

    const isGood = delta.isFavorable;
    const isUp = delta.direction === 'up';
    const text = delta.percentage !== null
      ? `${isUp ? '+' : ''}${delta.percentage}${unit}`
      : `${isUp ? '+' : ''}${formatINR(delta.amount)}`;

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md ${
          isGood
            ? 'text-[#059669] bg-[#ECFDF5]'
            : 'text-[#DC2626] bg-[#FEF2F2]'
        }`}
      >
        {isUp ? <ArrowUpRight size={12} strokeWidth={2.5} /> : <ArrowDownRight size={12} strokeWidth={2.5} />}
        <span>{text} vs prior</span>
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Total Income */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            Total Income
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-[#10B981] flex items-center justify-center">
            <TrendingUp size={20} strokeWidth={2.2} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-[#203451] tracking-tight">
            ₹{summary.totalIncome.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {getDeltaBadge(comparison.deltas.income)}
            <span className="text-[11px] text-[#718096]">
              {summary.incomeCount} transaction{summary.incomeCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Total Expenses */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            Total Expenses
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FEEBED] text-[#EF5360] flex items-center justify-center">
            <TrendingDown size={20} strokeWidth={2.2} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-[#203451] tracking-tight">
            ₹{summary.totalExpenses.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {getDeltaBadge(comparison.deltas.expenses)}
            <span className="text-[11px] text-[#718096]">
              {summary.expenseCount} outflow{summary.expenseCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Net Cash Flow */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            Net Cash Flow
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#EBF3FF] text-[#1677F2] flex items-center justify-center">
            <Wallet size={20} strokeWidth={2.2} />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={`text-2xl font-extrabold tracking-tight ${
              summary.netCashFlow >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'
            }`}
          >
            {summary.netCashFlow < 0 ? '-' : '+'}₹{Math.abs(summary.netCashFlow).toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md ${
                summary.netCashFlow >= 0
                  ? 'text-[#059669] bg-[#ECFDF5]'
                  : 'text-[#DC2626] bg-[#FEF2F2]'
              }`}
            >
              {summary.netCashFlow >= 0 ? 'Surplus' : 'Deficit'}
            </span>
            <span className="text-[11px] text-[#718096]">
              Retained of income
            </span>
          </div>
        </div>
      </div>

      {/* 4. Savings Rate */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
              Savings Rate
            </span>
            <span title="Formula: (Income - Expenses) / Income * 100" className="cursor-help text-[#94A3B8]">
              <HelpCircle size={13} />
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#8B5CF6] flex items-center justify-center">
            <PiggyBank size={20} strokeWidth={2.2} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-[#203451] tracking-tight">
            {summary.savingsRate !== null ? `${summary.savingsRate}%` : 'N/A'}
          </div>
          <div className="mt-2 flex items-center gap-2">
            {summary.savingsRate !== null ? (
              <span
                className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  summary.savingsRate >= 20
                    ? 'text-[#059669] bg-[#ECFDF5]'
                    : summary.savingsRate > 0
                    ? 'text-[#D97706] bg-[#FFFBEB]'
                    : 'text-[#DC2626] bg-[#FEF2F2]'
                }`}
              >
                {summary.savingsRate >= 20 ? 'Above 20% Benchmark' : 'Below 20% Benchmark'}
              </span>
            ) : (
              <span className="text-[11px] text-[#718096]">No income recorded</span>
            )}
          </div>
        </div>
      </div>

      {/* 5. Average Daily Spend */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            Daily Average Outflow
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
            <Calendar size={20} strokeWidth={2.2} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-[#203451] tracking-tight">
            ₹{summary.avgDailySpend.toLocaleString('en-IN')}
            <span className="text-sm font-medium text-[#718096]">/day</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-medium text-[#718096]">
              Averaged over {summary.daysInPeriod} day{summary.daysInPeriod !== 1 ? 's' : ''} in period
            </span>
          </div>
        </div>
      </div>

      {/* 6. Budget Utilization */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            Budget Utilization
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
            <PieChart size={20} strokeWidth={2.2} />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-[#203451] tracking-tight">
              {summary.budgetUtilization > 0 ? `${summary.budgetUtilization}%` : '0%'}
            </div>
            {onNavigateToBudgets && (
              <button
                type="button"
                onClick={onNavigateToBudgets}
                className="text-[11px] font-semibold text-[#1677F2] hover:underline cursor-pointer"
              >
                View Budgets
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  summary.budgetUtilization > 100
                    ? 'bg-[#EF5360]'
                    : summary.budgetUtilization >= 85
                    ? 'bg-[#F59E0B]'
                    : 'bg-[#1677F2]'
                }`}
                style={{ width: `${Math.min(100, summary.budgetUtilization)}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-[#718096] shrink-0">
              {summary.budgetUtilization <= 100 ? 'On Track' : 'Over Limit'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
