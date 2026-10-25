import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Info,
  ShieldCheck,
  Target,
  Wallet,
  ArrowRight,
  PieChart as PieChartIcon,
  Zap,
  Activity,
  DollarSign,
  Scale,
} from 'lucide-react';
import { api } from '../api';
import {
  User,
  NavigationPage,
  AnalyticsPeriodPreset,
  ForecastHorizon,
  FinancialInsightsData,
} from '../types';

interface InsightsPageProps {
  user: User;
  onNavigate: (page: NavigationPage) => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  user,
  onNavigate,
  onShowToast,
}) => {
  const [periodPreset, setPeriodPreset] = useState<AnalyticsPeriodPreset>('this_month');
  const [forecastHorizon, setForecastHorizon] = useState<ForecastHorizon>('30d');
  const [data, setData] = useState<FinancialInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchInsights = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const insightsData = await api.getFinancialInsights({
        periodPreset,
        forecastHorizon,
      });

      setData(insightsData);
      if (isManualRefresh) {
        onShowToast('success', 'Financial insights and forecasts recalculated.');
      }
    } catch (err: any) {
      console.error('Failed to fetch insights:', err);
      onShowToast('error', err.message || 'Failed to load financial insights.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [periodPreset, forecastHorizon, onShowToast]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (isLoading && !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse flex flex-col gap-4">
          <div className="h-8 bg-[#E5F0FF] rounded-lg w-1/3" />
          <div className="h-4 bg-[#E5F0FF] rounded-lg w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="h-32 bg-white rounded-2xl border border-[#DCE6F2]" />
            <div className="h-32 bg-white rounded-2xl border border-[#DCE6F2]" />
            <div className="h-32 bg-white rounded-2xl border border-[#DCE6F2]" />
            <div className="h-32 bg-white rounded-2xl border border-[#DCE6F2]" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center bg-white rounded-2xl border border-[#DCE6F2] shadow-xs my-8">
        <AlertTriangle size={48} className="mx-auto text-[#EF5360] mb-4" />
        <h2 className="text-xl font-bold text-[#203451] mb-2">Unable to Load Insights</h2>
        <p className="text-sm text-[#718096] mb-6">
          We encountered an issue calculating your financial forecasts. Please try again.
        </p>
        <button
          onClick={() => fetchInsights(true)}
          className="px-5 py-2.5 bg-[#1677F2] text-white font-semibold text-sm rounded-xl hover:bg-[#1262CB] transition-colors cursor-pointer"
        >
          Retry Calculation
        </button>
      </div>
    );
  }

  const { healthOverview, cashFlowForecast, spendingTrends, budgetForecasts, savingsProjections, unusualSpending, recommendations, confidenceMeta } = data;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 antialiased">
      {/* PAGE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#DCE6F2] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-[#203451] tracking-tight">Financial Insights</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E5F0FF] text-[#1677F2]">
              Phase 10 Engine
            </span>
          </div>
          <p className="text-sm text-[#718096]">
            Understand your spending, plan ahead, and track your financial progress with explainable forecasts.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl px-3 py-1.5 text-xs text-[#203451] font-medium">
            <Calendar size={14} className="text-[#1677F2]" />
            <select
              value={periodPreset}
              onChange={(e) => setPeriodPreset(e.target.value as AnalyticsPeriodPreset)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              <option value="this_month">This Month (Oct 2026)</option>
              <option value="last_month">Last Month (Sep 2026)</option>
              <option value="last_3_months">Last 3 Months</option>
              <option value="last_6_months">Last 6 Months</option>
              <option value="this_year">This Year (2026)</option>
            </select>
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl px-3 py-1.5 text-xs text-[#203451] font-medium">
            <Zap size={14} className="text-[#1677F2]" />
            <span className="text-[#718096]">Horizon:</span>
            <select
              value={forecastHorizon}
              onChange={(e) => setForecastHorizon(e.target.value as ForecastHorizon)}
              className="bg-transparent font-semibold focus:outline-none cursor-pointer"
            >
              <option value="7d">Next 7 Days</option>
              <option value="30d">Next 30 Days</option>
              <option value="3m">Next 3 Months</option>
              <option value="6m">Next 6 Months</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchInsights(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1677F2] text-white text-xs font-semibold rounded-xl hover:bg-[#1262CB] disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            title="Recalculate financial insights with latest ledger data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Recalculate</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: FINANCIAL HEALTH OVERVIEW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#203451] flex items-center gap-2">
            <Activity size={20} className="text-[#1677F2]" />
            <span>Financial Health Overview</span>
          </h2>
          <span className="text-xs text-[#718096]">
            Updated {new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Composite Score */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">Health Score</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                healthOverview.healthScore >= 80 ? 'bg-emerald-50 text-emerald-700' :
                healthOverview.healthScore >= 65 ? 'bg-blue-50 text-[#1677F2]' :
                'bg-amber-50 text-amber-700'
              }`}>
                {healthOverview.healthScoreLabel}
              </span>
            </div>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-extrabold text-[#203451]">{healthOverview.healthScore}</span>
              <span className="text-xs text-[#718096]">/ 100 points</span>
            </div>
            <div className="w-full bg-[#F2F7FF] h-2 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  healthOverview.healthScore >= 80 ? 'bg-emerald-500' :
                  healthOverview.healthScore >= 65 ? 'bg-[#1677F2]' : 'bg-amber-500'
                }`}
                style={{ width: `${healthOverview.healthScore}%` }}
              />
            </div>
            <p className="text-[11px] text-[#718096]">
              Composite rating based on liquidity, savings velocity, and budget control.
            </p>
          </div>

          {/* Card 2: Net Cash Flow */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">Net Cash Flow</span>
              <Scale size={18} className="text-[#1677F2]" />
            </div>
            <div>
              <div className={`text-2xl font-bold my-1 ${
                healthOverview.netCashFlow >= 0 ? 'text-[#203451]' : 'text-[#EF5360]'
              }`}>
                {healthOverview.netCashFlow >= 0 ? '+' : ''}₹{healthOverview.netCashFlow.toLocaleString('en-IN')}
              </div>
              <div className="flex items-center gap-3 text-xs text-[#718096] mt-2">
                <span>Income: <strong className="text-emerald-600">₹{healthOverview.totalIncome.toLocaleString('en-IN')}</strong></span>
                <span>Spent: <strong className="text-rose-600">₹{healthOverview.totalExpenses.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>
            <p className="text-[11px] text-[#718096] mt-2">
              Net Cash Flow = Total Income - Total Expenses
            </p>
          </div>

          {/* Card 3: Savings Rate */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">Savings Rate</span>
              <Target size={18} className="text-[#1677F2]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#203451] my-1">
                {healthOverview.savingsRate !== null ? `${healthOverview.savingsRate.toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-xs text-[#718096] mt-1">
                Target guideline: 20% or higher
              </p>
            </div>
            <div className="text-[11px] text-[#718096] mt-2 flex items-center gap-1">
              <Info size={12} className="text-[#1677F2]" />
              <span>Percentage of total earnings retained.</span>
            </div>
          </div>

          {/* Card 4: Essential vs Discretionary */}
          <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#718096] uppercase tracking-wider">Spending Structure</span>
              <PieChartIcon size={18} className="text-[#1677F2]" />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-[#1677F2]">Essential: ₹{healthOverview.essentialSpending.toLocaleString('en-IN')}</span>
                <span className="text-amber-600">Discretionary: ₹{healthOverview.discretionarySpending.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-[#F2F7FF] h-2.5 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#1677F2] h-full"
                  style={{
                    width: `${
                      healthOverview.totalExpenses > 0
                        ? (healthOverview.essentialSpending / healthOverview.totalExpenses) * 100
                        : 50
                    }%`,
                  }}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{
                    width: `${
                      healthOverview.totalExpenses > 0
                        ? (healthOverview.discretionarySpending / healthOverview.totalExpenses) * 100
                        : 50
                    }%`,
                  }}
                />
              </div>
            </div>
            <p className="text-[11px] text-[#718096] mt-2">
              Avg daily expense: <strong>₹{healthOverview.avgDailyExpenses.toLocaleString('en-IN')}/day</strong>
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: CASH-FLOW FORECASTING */}
      <section className="bg-white p-6 rounded-2xl border border-[#DCE6F2] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2F7FF] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#203451] flex items-center gap-2">
              <TrendingUp size={20} className="text-[#1677F2]" />
              <span>Cash-Flow Forecast ({forecastHorizon.toUpperCase()})</span>
            </h2>
            <p className="text-xs text-[#718096] mt-0.5">
              Projected future income and expenses combining active recurring schedules and historical velocity.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E5F0FF] text-[#1677F2] self-start sm:self-auto">
            Confidence: {cashFlowForecast.confidence}
          </span>
        </div>

        {/* Forecast Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Est. Future Income</span>
            <div className="text-xl font-bold text-emerald-700 mt-1">
              +₹{cashFlowForecast.estimatedIncome.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-emerald-600 mt-1 block">
              Scheduled recurring deposits
            </span>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wide">Est. Future Expenses</span>
            <div className="text-xl font-bold text-rose-700 mt-1">
              -₹{cashFlowForecast.estimatedExpenses.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-rose-600 mt-1 flex justify-between">
              <span>Recurring: ₹{cashFlowForecast.expectedRecurringExpenses.toLocaleString('en-IN')}</span>
              <span>Unscheduled: ₹{cashFlowForecast.unscheduledEstimatedExpenses.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${
            cashFlowForecast.estimatedNetCashFlow >= 0
              ? 'bg-[#E5F0FF]/50 border-[#BCE0FD]'
              : 'bg-amber-50/60 border-amber-200'
          }`}>
            <span className="text-xs font-semibold text-[#203451] uppercase tracking-wide">Est. Net Cash Flow</span>
            <div className={`text-xl font-bold mt-1 ${
              cashFlowForecast.estimatedNetCashFlow >= 0 ? 'text-[#1677F2]' : 'text-amber-700'
            }`}>
              {cashFlowForecast.estimatedNetCashFlow >= 0 ? '+' : ''}₹{cashFlowForecast.estimatedNetCashFlow.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#718096] mt-1 block">
              Projected balance delta over horizon
            </span>
          </div>
        </div>

        {/* Forecast Time Series Chart (Interactive Visual Breakdown) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#718096]">
            <span>Historical Actuals vs Forecast Horizon</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1677F2]" /> Actual Expenses</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Forecast Net</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
            {cashFlowForecast.forecastPoints.map((pt, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                  pt.type === 'actual'
                    ? 'bg-white border-[#DCE6F2]'
                    : 'bg-[#F2F7FF]/80 border-dashed border-[#1677F2]/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#718096]">{pt.label}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    pt.type === 'actual' ? 'bg-[#F2F7FF] text-[#718096]' : 'bg-[#E5F0FF] text-[#1677F2]'
                  }`}>
                    {pt.type === 'actual' ? 'Actual' : 'Est'}
                  </span>
                </div>

                <div className="my-2 space-y-1">
                  {pt.type === 'actual' ? (
                    <>
                      <div className="text-xs font-bold text-rose-600">
                        ₹{(pt.actualExpenses || 0).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-emerald-600">
                        +₹{(pt.actualIncome || 0).toLocaleString('en-IN')}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-xs font-bold text-rose-600">
                        -₹{(pt.forecastExpenses || 0).toLocaleString('en-IN')}
                      </div>
                      <div className={`text-[10px] font-bold ${
                        (pt.forecastNet || 0) >= 0 ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                        Net: {(pt.forecastNet || 0) >= 0 ? '+' : ''}₹{(pt.forecastNet || 0).toLocaleString('en-IN')}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 & 4 GRID: SPENDING TRENDS & BUDGET FORECASTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 3: SPENDING TRENDS */}
        <section className="bg-white p-6 rounded-2xl border border-[#DCE6F2] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2F7FF] pb-3">
            <h2 className="text-base font-bold text-[#203451] flex items-center gap-2">
              <TrendingDown size={18} className="text-[#1677F2]" />
              <span>Spending Trends</span>
            </h2>
            <span className="text-xs text-[#718096] font-medium">{spendingTrends.currentPeriodLabel}</span>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-bold text-[#718096] uppercase tracking-wider">Top Category Changes</div>
            {spendingTrends.topCategories.slice(0, 4).map((cat) => (
              <div key={cat.category} className="flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div>
                  <span className="text-xs font-bold text-[#203451] block">{cat.category}</span>
                  <span className="text-[11px] text-[#718096]">
                    ₹{cat.currentAmount.toLocaleString('en-IN')} (vs ₹{cat.previousAmount.toLocaleString('en-IN')} last period)
                  </span>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    cat.trend === 'up'
                      ? 'bg-rose-50 text-rose-600'
                      : cat.trend === 'down'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {cat.trend === 'up' ? '▲' : cat.trend === 'down' ? '▼' : '•'}
                    {cat.changePercentage !== null ? `${Math.abs(cat.changePercentage)}%` : 'New'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Recurring vs Non-Recurring Distribution */}
          <div className="pt-2 border-t border-[#F2F7FF]">
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span>Recurring Fixed: ₹{spendingTrends.recurringVsNonRecurring.recurringAmount.toLocaleString('en-IN')} ({spendingTrends.recurringVsNonRecurring.recurringPercentage}%)</span>
              <span>Variable: ₹{spendingTrends.recurringVsNonRecurring.nonRecurringAmount.toLocaleString('en-IN')} ({spendingTrends.recurringVsNonRecurring.nonRecurringPercentage}%)</span>
            </div>
            <div className="w-full bg-[#F2F7FF] h-2 rounded-full overflow-hidden flex">
              <div className="bg-[#1677F2] h-full" style={{ width: `${spendingTrends.recurringVsNonRecurring.recurringPercentage}%` }} />
              <div className="bg-[#718096] h-full" style={{ width: `${spendingTrends.recurringVsNonRecurring.nonRecurringPercentage}%` }} />
            </div>
          </div>
        </section>

        {/* SECTION 4: BUDGET FORECASTS & EARLY WARNINGS */}
        <section className="bg-white p-6 rounded-2xl border border-[#DCE6F2] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2F7FF] pb-3">
            <h2 className="text-base font-bold text-[#203451] flex items-center gap-2">
              <Wallet size={18} className="text-[#1677F2]" />
              <span>Budget Forecasts & Early Warnings</span>
            </h2>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-xs font-semibold text-[#1677F2] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {budgetForecasts.length === 0 ? (
              <p className="text-xs text-[#718096] italic p-4 text-center">No active budgets configured for this period.</p>
            ) : (
              budgetForecasts.map((b) => (
                <div
                  key={b.budgetId}
                  className={`p-3.5 rounded-xl border transition-all ${
                    b.status === 'projected_overrun' || b.status === 'over_budget'
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-[#F8FAFC] border-[#E2E8F0]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#203451]">{b.budgetName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'over_budget'
                        ? 'bg-rose-100 text-rose-700'
                        : b.status === 'projected_overrun'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {b.status === 'projected_overrun'
                        ? '⚠️ Projected Overflow'
                        : b.status === 'over_budget'
                        ? '🚨 Over Budget'
                        : 'On Track'}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-[#718096] my-1">
                    <span>Spent: ₹{b.actualSpent.toLocaleString('en-IN')} / ₹{b.limit.toLocaleString('en-IN')}</span>
                    <span>Paced: <strong>₹{b.projectedEndSpending.toLocaleString('en-IN')}</strong></span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden my-1.5">
                    <div
                      className={`h-full transition-all ${
                        b.percentageUsed >= 100
                          ? 'bg-rose-500'
                          : b.status === 'projected_overrun'
                          ? 'bg-amber-500'
                          : 'bg-[#1677F2]'
                      }`}
                      style={{ width: `${Math.min(100, b.percentageUsed)}%` }}
                    />
                  </div>

                  {b.projectedOverage > 0 && (
                    <p className="text-[11px] text-rose-700 font-medium mt-1">
                      Estimated overage by month end: ₹{b.projectedOverage.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* SECTION 5: SAVINGS GOAL PROJECTIONS */}
      <section className="bg-white p-6 rounded-2xl border border-[#DCE6F2] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F2F7FF] pb-3">
          <h2 className="text-base font-bold text-[#203451] flex items-center gap-2">
            <Target size={18} className="text-[#1677F2]" />
            <span>Savings Goal Projections</span>
          </h2>
          <button
            onClick={() => onNavigate('goals')}
            className="text-xs font-semibold text-[#1677F2] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Goals</span>
            <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savingsProjections.map((g) => (
            <div key={g.goalId} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#203451]">{g.goalName}</span>
                <span className="text-xs font-bold text-[#1677F2]">{g.progressPercentage}%</span>
              </div>

              <div className="text-sm font-extrabold text-[#203451]">
                ₹{g.savedAmount.toLocaleString('en-IN')} <span className="text-xs font-normal text-[#718096]">/ ₹{g.targetAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
                <div className="bg-[#1677F2] h-full transition-all" style={{ width: `${g.progressPercentage}%` }} />
              </div>

              <div className="text-[11px] text-[#718096] pt-1 space-y-1">
                {g.requiredMonthlyContribution && (
                  <div className="flex justify-between">
                    <span>Required Monthly:</span>
                    <strong className="text-[#203451]">₹{g.requiredMonthlyContribution.toLocaleString('en-IN')}/mo</strong>
                  </div>
                )}
                {g.estimatedCompletionDate && (
                  <div className="flex justify-between">
                    <span>Est. Completion:</span>
                    <strong className="text-[#1677F2]">{g.estimatedCompletionDate}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: UNUSUAL SPENDING DETECTION */}
      {unusualSpending.length > 0 && (
        <section className="bg-amber-50/40 p-6 rounded-2xl border border-amber-200/80 space-y-4">
          <div className="flex items-center gap-2 border-b border-amber-200/60 pb-3">
            <AlertTriangle size={20} className="text-amber-600" />
            <h2 className="text-base font-bold text-amber-900">Unusual Spending Signals Detected</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unusualSpending.map((sig) => (
              <div key={sig.id} className="p-4 rounded-xl bg-white border border-amber-200 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#203451]">{sig.title}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    +{sig.percentageIncrease}% Spike
                  </span>
                </div>
                <p className="text-xs text-[#718096]">{sig.explanation}</p>
                <div className="text-[11px] text-[#718096] pt-1 flex justify-between">
                  <span>Logged: {sig.date}</span>
                  <span className="font-semibold text-amber-800">Review in Ledger</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 7: ACTIONABLE FINANCIAL RECOMMENDATIONS */}
      <section className="bg-white p-6 rounded-2xl border border-[#DCE6F2] shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F2F7FF] pb-3">
          <Lightbulb size={20} className="text-amber-500" />
          <h2 className="text-base font-bold text-[#203451]">Actionable Financial Recommendations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#1677F2] uppercase tracking-wider block mb-1">
                  {rec.type} Recommendation
                </span>
                <h3 className="text-sm font-bold text-[#203451]">{rec.title}</h3>
                <p className="text-xs text-[#718096] mt-1"><strong>Pattern:</strong> {rec.observedPattern}</p>
                <p className="text-xs text-[#203451] mt-1 font-medium bg-[#E5F0FF]/60 p-2 rounded-lg">
                  💡 {rec.suggestedAction}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-[#718096] italic">{rec.assumptions}</span>
                {rec.actionTarget && (
                  <button
                    onClick={() => onNavigate(rec.actionTarget!)}
                    className="text-xs font-bold text-[#1677F2] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Take Action</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8: DATA QUALITY AND FORECAST CONFIDENCE */}
      <section className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#DCE6F2] space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#1677F2]" />
          <h3 className="text-xs font-bold text-[#203451] uppercase tracking-wider">
            Data Sufficiency & Forecast Limitations Notice
          </h3>
        </div>

        <p className="text-xs text-[#718096]">
          {confidenceMeta.description} Financial projections are estimates derived from your saved historical ledger and active recurring schedules. They represent statistical projections, not guaranteed outcomes or personalized financial advice.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {confidenceMeta.factors.map((factor, idx) => (
            <span key={idx} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white border border-[#DCE6F2] text-[#203451]">
              ✓ {factor}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};
