import React from 'react';
import { GoalSummary } from '../../types';
import { Target, PiggyBank, Clock, CheckCircle2 } from 'lucide-react';

interface GoalSummaryCardsProps {
  summary: GoalSummary;
}

export const GoalSummaryCards: React.FC<GoalSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Target */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            Total Target
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#EBF3FF] text-[#1677F2] flex items-center justify-center">
            <Target size={20} strokeWidth={2.2} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-[#203451] tracking-tight">
            ₹{summary.totalTarget.toLocaleString('en-IN')}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#718096]">
            <span className="font-semibold text-[#203451]">{summary.activeCount}</span> active goal{summary.activeCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* 2. Total Saved */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            Total Saved
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-[#10B981] flex items-center justify-center">
            <PiggyBank size={20} strokeWidth={2.2} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-[#10B981] tracking-tight">
            ₹{summary.totalSaved.toLocaleString('en-IN')}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#718096]">
            <span className="font-semibold text-[#10B981]">{summary.overallProgress}%</span> overall progress
          </div>
        </div>
      </div>

      {/* 3. Total Remaining */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            Remaining To Goal
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
            <Clock size={20} strokeWidth={2.2} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-[#203451] tracking-tight">
            ₹{summary.totalRemaining.toLocaleString('en-IN')}
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#718096]">
            <span>Capital needed to reach active targets</span>
          </div>
        </div>
      </div>

      {/* 4. Goal Statuses */}
      <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            Goal Milestones
          </span>
          <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] text-[#8B5CF6] flex items-center justify-center">
            <CheckCircle2 size={20} strokeWidth={2.2} />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-extrabold text-[#203451] tracking-tight flex items-baseline gap-2">
            <span>{summary.completedCount}</span>
            <span className="text-xs font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md">
              Completed
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-[#718096]">
            <span>{summary.pausedCount} paused</span>
            <span>•</span>
            <span>{summary.archivedCount} archived</span>
          </div>
        </div>
      </div>
    </div>
  );
};
