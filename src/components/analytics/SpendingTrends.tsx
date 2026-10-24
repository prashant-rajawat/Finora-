import React from 'react';
import { AnalyticsSpendingTrends } from '../../types';
import { Compass, Flame, TrendingDown, TrendingUp, Minus, Award } from 'lucide-react';

interface SpendingTrendsProps {
  trends: AnalyticsSpendingTrends;
}

export const SpendingTrends: React.FC<SpendingTrendsProps> = ({ trends }) => {
  const { trajectory, trajectoryPercentage, trajectoryDescription, peakSpendDay, topCategory } =
    trends;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[#203451] text-base">Spending Trends & Trajectory</h3>
          <span className="w-6 h-6 rounded-lg bg-[#EBF3FF] text-[#1677F2] flex items-center justify-center">
            <Compass size={14} />
          </span>
        </div>
        <p className="text-xs text-[#718096]">
          Behavioural patterns and high-velocity outflow signals
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Trend 1: Trajectory */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EDF2F7] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
                Trajectory
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  trajectory === 'decreasing'
                    ? 'text-[#059669] bg-[#ECFDF5]'
                    : trajectory === 'increasing'
                    ? 'text-[#DC2626] bg-[#FEF2F2]'
                    : 'text-[#4A5568] bg-[#F1F5F9]'
                }`}
              >
                {trajectory === 'decreasing' && <TrendingDown size={12} strokeWidth={2.5} />}
                {trajectory === 'increasing' && <TrendingUp size={12} strokeWidth={2.5} />}
                {trajectory === 'stable' && <Minus size={12} strokeWidth={2.5} />}
                <span className="capitalize">{trajectory}</span>
              </span>
            </div>
            <div className="text-sm font-bold text-[#203451]">
              {trajectoryDescription}
            </div>
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-3">
            Calculated against baseline spending pace
          </div>
        </div>

        {/* Trend 2: Peak Spending Day */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EDF2F7] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
                Peak Outflow Day
              </span>
              <div className="w-6 h-6 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <Flame size={14} />
              </div>
            </div>
            {peakSpendDay ? (
              <>
                <div className="text-lg font-extrabold text-[#203451]">
                  ₹{peakSpendDay.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-xs font-semibold text-[#1677F2] mt-0.5">
                  {peakSpendDay.formattedDate}
                </div>
              </>
            ) : (
              <div className="text-sm font-medium text-[#718096]">
                No single spike day identified
              </div>
            )}
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-3">
            Highest cumulative expenditure date
          </div>
        </div>

        {/* Trend 3: Top Category */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#EDF2F7] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
                Primary Cost Center
              </span>
              <div className="w-6 h-6 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center">
                <Award size={14} />
              </div>
            </div>
            {topCategory ? (
              <>
                <div className="text-lg font-extrabold text-[#203451] truncate">
                  {topCategory.name}
                </div>
                <div className="text-xs font-semibold text-[#64748B] mt-0.5">
                  ₹{topCategory.amount.toLocaleString('en-IN')} ({topCategory.percentage}%)
                </div>
              </>
            ) : (
              <div className="text-sm font-medium text-[#718096]">
                No categories available
              </div>
            )}
          </div>
          <div className="text-[11px] text-[#94A3B8] mt-3">
            Accounts for the largest share of outflows
          </div>
        </div>
      </div>
    </div>
  );
};
