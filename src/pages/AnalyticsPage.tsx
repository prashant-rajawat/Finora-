import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import {
  User,
  AnalyticsData,
  AnalyticsPeriodPreset,
  NavigationPage,
  TransactionType,
} from '../types';
import { DateRangePicker } from '../components/analytics/DateRangePicker';
import { AnalyticsCards } from '../components/analytics/AnalyticsCards';
import { IncomeExpenseChart } from '../components/analytics/IncomeExpenseChart';
import { CategoryBreakdown } from '../components/analytics/CategoryBreakdown';
import { MonthComparison } from '../components/analytics/MonthComparison';
import { SpendingTrends } from '../components/analytics/SpendingTrends';
import { BudgetAnalytics } from '../components/analytics/BudgetAnalytics';
import { SmartInsights } from '../components/analytics/SmartInsights';
import { TopExpensesList } from '../components/analytics/TopExpensesList';
import {
  LineChart,
  RefreshCw,
  Plus,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface AnalyticsPageProps {
  user: User | null;
  onNavigate: (page: NavigationPage) => void;
  onOpenAddTransaction?: (type?: TransactionType) => void;
  onDrillDownToTransactions?: (category?: string, searchTerm?: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  user,
  onNavigate,
  onOpenAddTransaction,
  onDrillDownToTransactions,
}) => {
  const [currentPreset, setCurrentPreset] = useState<AnalyticsPeriodPreset>('this_month');
  const [startDate, setStartDate] = useState<string>('2026-10-01');
  const [endDate, setEndDate] = useState<string>('2026-10-31');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(
    async (preset: AnalyticsPeriodPreset, start?: string, end?: string) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getAnalytics({
          period: preset,
          startDate: preset === 'custom' ? start : undefined,
          endDate: preset === 'custom' ? end : undefined,
        });
        setAnalyticsData(data);
        if (data.startDate) setStartDate(data.startDate);
        if (data.endDate) setEndDate(data.endDate);
      } catch (err: any) {
        console.error('Failed to load analytics:', err);
        setError(err.message || 'Unable to load analytics data.');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchAnalytics(currentPreset, startDate, endDate);
  }, [fetchAnalytics, currentPreset]);

  const handleSelectPreset = (preset: AnalyticsPeriodPreset) => {
    setCurrentPreset(preset);
    if (preset !== 'custom') {
      fetchAnalytics(preset);
    }
  };

  const handleApplyCustomRange = (start: string, end: string) => {
    setCurrentPreset('custom');
    setStartDate(start);
    setEndDate(end);
    fetchAnalytics('custom', start, end);
  };

  const handleDrillDownCategory = (category: string) => {
    if (onDrillDownToTransactions) {
      onDrillDownToTransactions(category);
    } else {
      onNavigate('transactions');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#203451] tracking-tight">
              Financial Analytics
            </h1>
            <span className="w-8 h-8 rounded-xl bg-[#EBF3FF] text-[#1677F2] flex items-center justify-center shrink-0">
              <LineChart size={18} />
            </span>
          </div>
          <p className="text-sm text-[#718096] mt-1">
            Understand your money, identify trends, and make informed financial decisions.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchAnalytics(currentPreset, startDate, endDate)}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[#DCE6F2] bg-white text-[#4A5568] hover:text-[#1677F2] hover:bg-[#F8FAFC] transition-colors cursor-pointer flex items-center justify-center shadow-xs"
            title="Refresh analytics data"
          >
            <RefreshCw size={17} className={isLoading ? 'animate-spin text-[#1677F2]' : ''} />
          </button>

          {onOpenAddTransaction && (
            <button
              type="button"
              onClick={() => onOpenAddTransaction('expense')}
              className="px-4 py-2.5 bg-[#1677F2] hover:bg-[#1264CD] text-white font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer text-sm"
            >
              <Plus size={18} strokeWidth={2.4} />
              <span>Add Transaction</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Range & Preset Filter Bar */}
      <DateRangePicker
        currentPreset={currentPreset}
        startDate={startDate}
        endDate={endDate}
        periodLabel={analyticsData?.periodLabel || 'This Month (October 2026)'}
        onSelectPreset={handleSelectPreset}
        onApplyCustomRange={handleApplyCustomRange}
        isLoading={isLoading}
      />

      {/* Error State Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between gap-3 text-sm text-[#DC2626]">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchAnalytics(currentPreset, startDate, endDate)}
            className="text-xs font-bold underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Initial Loading Skeleton */}
      {isLoading && !analyticsData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-2xl p-5 border border-[#DCE6F2] animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 h-80 bg-white rounded-2xl border border-[#DCE6F2] animate-pulse" />
            <div className="lg:col-span-5 h-80 bg-white rounded-2xl border border-[#DCE6F2] animate-pulse" />
          </div>
        </div>
      ) : analyticsData ? (
        <div className="space-y-6">
          {/* 1. 6 KPI Financial Summary Cards */}
          <AnalyticsCards
            summary={analyticsData.summary}
            comparison={analyticsData.comparison}
            onNavigateToBudgets={() => onNavigate('budgets')}
          />

          {/* 2. Visualizations Grid: Cash Flow Time Series + Category Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <IncomeExpenseChart
                timeSeries={analyticsData.timeSeries}
                isLoading={isLoading}
              />
            </div>
            <div className="lg:col-span-5">
              <CategoryBreakdown
                categories={analyticsData.categoryBreakdown}
                totalExpenses={analyticsData.summary.totalExpenses}
                onDrillDownCategory={handleDrillDownCategory}
              />
            </div>
          </div>

          {/* 3. Comparisons & Trends Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <MonthComparison comparison={analyticsData.comparison} />
            </div>
            <div className="lg:col-span-6">
              <SpendingTrends trends={analyticsData.spendingTrends} />
            </div>
          </div>

          {/* 4. Budget Compliance & Top Outflows */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <BudgetAnalytics
                performance={analyticsData.budgetPerformance}
                onNavigateToBudgets={() => onNavigate('budgets')}
              />
            </div>
            <div className="lg:col-span-6">
              <TopExpensesList
                expenses={analyticsData.topExpenses}
                onViewTransactions={() => onNavigate('transactions')}
              />
            </div>
          </div>

          {/* 5. Smart Financial Insights */}
          <SmartInsights
            insights={analyticsData.smartInsights}
            onNavigate={onNavigate}
          />
        </div>
      ) : null}
    </div>
  );
};
