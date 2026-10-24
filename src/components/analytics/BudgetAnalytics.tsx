import React from 'react';
import { AnalyticsBudgetPerformance } from '../../types';
import { Wallet, AlertTriangle, CheckCircle2, AlertOctagon, ChevronRight } from 'lucide-react';

interface BudgetAnalyticsProps {
  performance: AnalyticsBudgetPerformance;
  onNavigateToBudgets?: () => void;
}

export const BudgetAnalytics: React.FC<BudgetAnalyticsProps> = ({
  performance,
  onNavigateToBudgets,
}) => {
  const {
    totalAllocated,
    totalSpent,
    utilizationPercentage,
    overBudgetCount,
    warningCount,
    onTrackCount,
    budgetCount,
    budgets,
  } = performance;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#203451] text-base">Budget Compliance & Health</h3>
            <span className="w-6 h-6 rounded-lg bg-[#EBF3FF] text-[#1677F2] flex items-center justify-center">
              <Wallet size={14} />
            </span>
          </div>
          <p className="text-xs text-[#718096]">
            Monitored against active allocation thresholds
          </p>
        </div>

        {onNavigateToBudgets && (
          <button
            type="button"
            onClick={onNavigateToBudgets}
            className="text-xs font-semibold text-[#1677F2] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Budgets</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {budgetCount === 0 ? (
        <div className="p-6 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
          <Wallet className="mx-auto text-[#94A3B8] mb-2" size={28} />
          <p className="text-sm font-semibold text-[#4A5568]">No active budgets defined</p>
          <p className="text-xs text-[#718096] mb-3">
            Set up category or monthly spending limits to unlock real-time budget analytics.
          </p>
          {onNavigateToBudgets && (
            <button
              type="button"
              onClick={onNavigateToBudgets}
              className="px-3.5 py-1.5 bg-[#1677F2] text-white text-xs font-semibold rounded-lg hover:bg-[#1264CD] transition-colors cursor-pointer"
            >
              Create First Budget
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Aggregated Health Bar */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EDF2F7]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#203451]">Overall Allocation Used</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    overBudgetCount > 0
                      ? 'text-[#DC2626] bg-[#FEF2F2]'
                      : warningCount > 0
                      ? 'text-[#D97706] bg-[#FFFBEB]'
                      : 'text-[#059669] bg-[#ECFDF5]'
                  }`}
                >
                  {utilizationPercentage}%
                </span>
              </div>
              <div className="text-xs text-[#718096]">
                <span className="font-extrabold text-[#203451]">
                  ₹{totalSpent.toLocaleString('en-IN')}
                </span>{' '}
                /{' '}
                <span>₹{totalAllocated.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  overBudgetCount > 0
                    ? 'bg-[#EF5360]'
                    : warningCount > 0
                    ? 'bg-[#F59E0B]'
                    : 'bg-[#10B981]'
                }`}
                style={{ width: `${Math.min(100, utilizationPercentage)}%` }}
              />
            </div>

            {/* Quick Status Badges */}
            <div className="flex items-center gap-4 mt-3 text-xs text-[#718096]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="font-semibold text-[#203451]">{onTrackCount}</span> On Track
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="font-semibold text-[#203451]">{warningCount}</span> Near Limit
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF5360]" />
                <span className="font-semibold text-[#203451]">{overBudgetCount}</span> Over Budget
              </span>
            </div>
          </div>

          {/* Individual Budgets List */}
          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {budgets.map((b) => {
              const isOver = b.status === 'over_budget';
              const isWarn = b.status === 'warning' || b.status === 'near_limit';
              return (
                <div
                  key={b.id}
                  className="p-3 rounded-xl border border-[#EDF2F7] hover:border-[#CBD5E1] transition-all bg-white flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#203451]">{b.name}</span>
                      <span className="text-[10px] text-[#94A3B8] capitalize">({b.type})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#203451]">
                        ₹{b.spent.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-[#718096]">
                        {' '}
                        / ₹{b.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOver ? 'bg-[#EF5360]' : isWarn ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                        }`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isOver
                          ? 'text-[#DC2626] bg-[#FEF2F2]'
                          : isWarn
                          ? 'text-[#D97706] bg-[#FFFBEB]'
                          : 'text-[#059669] bg-[#ECFDF5]'
                      }`}
                    >
                      {b.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
