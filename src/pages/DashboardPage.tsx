import React, { useState } from 'react';
import {
  Wallet,
  TrendingDown,
  ShieldCheck,
  Plus,
  Minus,
  Layers,
  FileText,
  Target,
  ArrowRight,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { MonthlyChart } from '../components/MonthlyChart';
import { CategoryDonutChart } from '../components/CategoryDonutChart';
import { DashboardSummary, User, NavigationPage, TransactionType } from '../types';

interface DashboardPageProps {
  user: User;
  summary: DashboardSummary | null;
  isLoading: boolean;
  onNavigate: (page: NavigationPage) => void;
  onOpenAddTransaction: (presetType?: TransactionType) => void;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  summary,
  isLoading,
  onNavigate,
  onOpenAddTransaction,
  selectedMonth,
  onSelectMonth,
}) => {
  const [showMonthMenu, setShowMonthMenu] = useState(false);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user.fullName.split(' ')[0] || 'User';

  const monthOptions = [
    { label: 'October 2026', value: '2026-10' },
    { label: 'September 2026', value: '2026-09' },
    { label: 'August 2026', value: '2026-08' },
    { label: 'All Time', value: 'all' },
  ];

  const currentMonthLabel =
    monthOptions.find((m) => m.value === selectedMonth)?.label || 'October 2026';

  const hasTransactions = (summary?.transactionCount ?? 0) > 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Dashboard Top Greeting & Month Filter matching Panel 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#203451] flex items-center gap-2">
            <span>{getGreeting()}, {firstName}!</span>
            <span className="text-2xl select-none">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-0.5">
            Here's your financial overview for this {selectedMonth === 'all' ? 'year' : 'month'}.
          </p>
        </div>

        {/* Month Selector Dropdown */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowMonthMenu(!showMonthMenu)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#DCE6F2] rounded-xl text-xs font-semibold text-[#203451] hover:bg-[#F8FAFC] transition-colors shadow-2xs cursor-pointer"
          >
            <span>{currentMonthLabel}</span>
            <ChevronDown size={14} className="text-[#718096]" />
          </button>

          {showMonthMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-[#DCE6F2] rounded-2xl shadow-xl py-1.5 z-30">
              {monthOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onSelectMonth(opt.value);
                    setShowMonthMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    selectedMonth === opt.value
                      ? 'bg-[#E5F0FF] text-[#1677F2] font-semibold'
                      : 'text-[#203451] hover:bg-[#F2F7FF]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && !summary && (
        <div className="space-y-6 animate-pulse">
          <div className="grid sm:grid-cols-3 gap-5">
            <div className="h-28 bg-white/70 rounded-2xl border border-[#DCE6F2]" />
            <div className="h-28 bg-white/70 rounded-2xl border border-[#DCE6F2]" />
            <div className="h-28 bg-white/70 rounded-2xl border border-[#DCE6F2]" />
          </div>
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 h-72 bg-white/70 rounded-2xl border border-[#DCE6F2]" />
            <div className="lg:col-span-5 h-72 bg-white/70 rounded-2xl border border-[#DCE6F2]" />
          </div>
        </div>
      )}

      {/* Populated or Clean Onboarding State */}
      {(!isLoading || summary) && (
        <>
          {/* 3 Metric Cards matching Panel 4 */}
          <div className="grid sm:grid-cols-3 gap-5">
            <StatCard
              title="Total Income"
              amount={summary?.totalIncome ?? 0}
              growth={summary?.incomeGrowth ?? '+12%'}
              icon={Wallet}
              variant="income"
            />
            <StatCard
              title="Total Expenses"
              amount={summary?.totalExpenses ?? 0}
              growth={summary?.expenseGrowth ?? '+8%'}
              icon={TrendingDown}
              variant="expense"
            />
            <StatCard
              title="Balance"
              amount={summary?.balance ?? 0}
              growth={summary?.balanceGrowth ?? '+14%'}
              icon={ShieldCheck}
              variant="balance"
            />
          </div>

          {/* If completely empty account, show friendly onboarding prompt alongside empty structure */}
          {!hasTransactions && (
            <div className="bg-white rounded-3xl p-8 border border-[#DCE6F2] shadow-xs text-center max-w-xl mx-auto my-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1677F2] flex items-center justify-center mx-auto">
                <Sparkles size={28} />
              </div>
              <h3 className="text-lg font-bold text-[#203451]">Welcome to Finora!</h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                Your financial overview will appear here once transaction tracking is available. Record your first income or expense entry to see your dashboard come to life.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => onOpenAddTransaction('income')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Add First Income</span>
                </button>
                <button
                  onClick={() => onOpenAddTransaction('expense')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EF5360] hover:bg-rose-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Minus size={15} />
                  <span>Add First Expense</span>
                </button>
              </div>
            </div>
          )}

          {/* Middle Row: Monthly Overview & Expenses by Category */}
          <div className="grid lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <MonthlyChart data={summary?.monthlyOverview || []} />
            </div>
            <div className="lg:col-span-5">
              <CategoryDonutChart
                categories={summary?.expensesByCategory || []}
                totalExpenses={summary?.totalExpenses ?? 0}
              />
            </div>
          </div>

          {/* Bottom Row: Recent Transactions & Quick Actions */}
          <div className="grid lg:grid-cols-12 gap-5">
            {/* Recent Transactions matching Panel 4 */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#203451] text-base">Recent Transactions</h3>
                <button
                  onClick={() => onNavigate('transactions')}
                  className="text-xs font-semibold text-[#1677F2] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Transactions List */}
              <div className="divide-y divide-[#F8FAFC] space-y-1">
                {(summary?.recentTransactions && summary.recentTransactions.length > 0) ? (
                  summary.recentTransactions.slice(0, 5).map((tx) => {
                    const isIncome = tx.type === 'income';
                    return (
                      <div
                        key={tx.id}
                        className="py-3 flex items-center justify-between hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isIncome
                                ? 'bg-emerald-50 text-[#16A66A]'
                                : 'bg-rose-50 text-[#EF5360]'
                            }`}
                          >
                            {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#203451]">
                              {tx.description || tx.merchant || tx.category}
                            </div>
                            <div className="text-[11px] text-[#718096]">
                              {tx.category} · {tx.date} {tx.paymentMethod ? `· ${tx.paymentMethod}` : ''}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`text-xs font-bold tabular-nums ${
                            isIncome ? 'text-[#16A66A]' : 'text-[#EF5360]'
                          }`}
                        >
                          {isIncome ? '+' : '-'} ₹
                          {tx.amount.toLocaleString('en-IN', {
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-xs text-[#94A3B8]">
                    No transactions recorded for this period.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions matching Panel 4 with direct Add Income / Add Expense */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-[#203451] text-base">Quick Actions</h3>
                <span className="text-[11px] text-[#718096]">Financial Shortcuts</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {/* 1. Add Transaction */}
                <button
                  onClick={() => onOpenAddTransaction()}
                  className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-[#E5F0FF] border border-[#DCE6F2] hover:border-[#1677F2]/40 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1677F2] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Plus size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold text-[#203451]">Add Transaction</span>
                </button>

                {/* 2. Set Budget */}
                <button
                  onClick={() => onNavigate('budgets')}
                  className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-emerald-50 border border-[#DCE6F2] hover:border-emerald-300 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Layers size={20} strokeWidth={2.2} />
                  </div>
                  <span className="text-xs font-bold text-[#203451]">Set Budget</span>
                </button>

                {/* 3. View Reports */}
                <button
                  onClick={() => onNavigate('reports')}
                  className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-amber-50 border border-[#DCE6F2] hover:border-amber-300 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <FileText size={20} strokeWidth={2.2} />
                  </div>
                  <span className="text-xs font-bold text-[#203451]">View Reports</span>
                </button>

                {/* 4. Manage Goals */}
                <button
                  onClick={() => onNavigate('goals')}
                  className="p-4 rounded-2xl bg-[#F8FAFC] hover:bg-purple-50 border border-[#DCE6F2] hover:border-purple-300 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    <Target size={20} strokeWidth={2.2} />
                  </div>
                  <span className="text-xs font-bold text-[#203451]">Manage Goals</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
