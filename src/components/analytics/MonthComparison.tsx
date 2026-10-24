import React from 'react';
import { AnalyticsPeriodComparison } from '../../types';
import { ArrowLeftRight, ArrowUpRight, ArrowDownRight, Minus, CheckCircle2, AlertCircle } from 'lucide-react';

interface MonthComparisonProps {
  comparison: AnalyticsPeriodComparison;
}

export const MonthComparison: React.FC<MonthComparisonProps> = ({ comparison }) => {
  const { current, previous, deltas, currentPeriodLabel, previousPeriodLabel } = comparison;

  const formatDelta = (
    delta: { amount: number; percentage: number | null; direction: 'up' | 'down' | 'flat'; isFavorable: boolean },
    unit = '%'
  ) => {
    if (delta.percentage === null && delta.amount === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#718096] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
          <Minus size={11} /> 0%
        </span>
      );
    }

    const isGood = delta.isFavorable;
    const isUp = delta.direction === 'up';
    const text = delta.percentage !== null
      ? `${isUp ? '+' : ''}${delta.percentage}${unit}`
      : `${isUp ? '+' : ''}₹${Math.abs(delta.amount).toLocaleString('en-IN')}`;

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${
          isGood
            ? 'text-[#059669] bg-[#ECFDF5]'
            : 'text-[#DC2626] bg-[#FEF2F2]'
        }`}
      >
        {isUp ? <ArrowUpRight size={13} strokeWidth={2.5} /> : <ArrowDownRight size={13} strokeWidth={2.5} />}
        <span>{text}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#203451] text-base">Period-over-Period Performance</h3>
            <span className="w-6 h-6 rounded-lg bg-[#EBF3FF] text-[#1677F2] flex items-center justify-center">
              <ArrowLeftRight size={14} />
            </span>
          </div>
          <p className="text-xs text-[#718096]">
            Evaluating progress against the immediately preceding period
          </p>
        </div>
        <div className="text-xs text-[#718096] bg-[#F8FAFC] px-3 py-1.5 rounded-xl border border-[#EDF2F7]">
          <span className="font-semibold text-[#203451]">Baseline:</span> {previousPeriodLabel}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Income */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EDF2F7] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#718096]">Income</span>
            {formatDelta(deltas.income)}
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-extrabold text-[#203451]">
              ₹{current.income.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#718096] mt-0.5">
              Prior: ₹{previous.income.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Metric 2: Expenses */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EDF2F7] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#718096]">Expenses</span>
            {formatDelta(deltas.expenses)}
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-extrabold text-[#203451]">
              ₹{current.expenses.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#718096] mt-0.5">
              Prior: ₹{previous.expenses.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Metric 3: Net Cash Flow */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EDF2F7] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#718096]">Net Cash Flow</span>
            {formatDelta(deltas.net)}
          </div>
          <div className="mt-2.5">
            <div
              className={`text-lg font-extrabold ${
                current.net >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'
              }`}
            >
              {current.net >= 0 ? '+' : ''}₹{current.net.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-[#718096] mt-0.5">
              Prior: {previous.net >= 0 ? '+' : ''}₹{previous.net.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Metric 4: Savings Rate */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#EDF2F7] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#718096]">Savings Rate</span>
            {deltas.savingsRateDiff !== null ? (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-md ${
                  deltas.savingsRateDiff >= 0
                    ? 'text-[#059669] bg-[#ECFDF5]'
                    : 'text-[#DC2626] bg-[#FEF2F2]'
                }`}
              >
                {deltas.savingsRateDiff >= 0 ? (
                  <ArrowUpRight size={13} strokeWidth={2.5} />
                ) : (
                  <ArrowDownRight size={13} strokeWidth={2.5} />
                )}
                <span>
                  {deltas.savingsRateDiff >= 0 ? '+' : ''}
                  {deltas.savingsRateDiff}%
                </span>
              </span>
            ) : (
              <span className="text-[11px] text-[#94A3B8]">N/A</span>
            )}
          </div>
          <div className="mt-2.5">
            <div className="text-lg font-extrabold text-[#203451]">
              {current.savingsRate !== null ? `${current.savingsRate}%` : 'N/A'}
            </div>
            <div className="text-[11px] text-[#718096] mt-0.5">
              Prior:{' '}
              {previous.savingsRate !== null ? `${previous.savingsRate}%` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
