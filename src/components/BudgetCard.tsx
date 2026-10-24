import React from 'react';
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { BudgetWithCalculations } from '../types';

interface BudgetCardProps {
  budget: BudgetWithCalculations;
  onEdit: (budget: BudgetWithCalculations) => void;
  onDelete: (id: string, name: string) => void;
  onViewDetails: (budget: BudgetWithCalculations) => void;
}

export const BudgetCard: React.FC<BudgetCardProps> = ({
  budget,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const isOver = budget.status === 'over_budget';
  const isNear = budget.status === 'near_limit';
  const isWarning = budget.status === 'warning';

  const statusConfig = {
    on_track: {
      label: 'On Track',
      badgeClass: 'bg-emerald-50 text-[#16A66A] border-emerald-200',
      progressClass: 'bg-[#16A66A]',
      icon: CheckCircle2,
    },
    warning: {
      label: 'Approaching Limit',
      badgeClass: 'bg-amber-50 text-amber-600 border-amber-200',
      progressClass: 'bg-amber-500',
      icon: AlertTriangle,
    },
    near_limit: {
      label: 'Near Limit',
      badgeClass: 'bg-orange-50 text-orange-600 border-orange-200',
      progressClass: 'bg-orange-500',
      icon: AlertTriangle,
    },
    over_budget: {
      label: 'Over Budget',
      badgeClass: 'bg-rose-50 text-[#EF5360] border-rose-200',
      progressClass: 'bg-[#EF5360]',
      icon: AlertCircle,
    },
  }[budget.status];

  const StatusIcon = statusConfig.icon;

  // Cap the visual bar width at 100%
  const visualBarWidth = Math.min(100, Math.max(0, budget.percentage));

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      {/* Top Header: Title, Category Badge, Status Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider block">
              {budget.type === 'overall' ? 'Overall Monthly Budget' : budget.category}
            </span>
            <h3 className="font-bold text-[#203451] text-base leading-snug">
              {budget.name}
            </h3>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${statusConfig.badgeClass}`}
          >
            <StatusIcon size={12} strokeWidth={2.5} />
            <span>{statusConfig.label}</span>
          </span>
        </div>

        {budget.notes && (
          <p className="text-xs text-[#718096] line-clamp-1 mb-3">
            {budget.notes}
          </p>
        )}

        {/* Progress Numbers */}
        <div className="flex items-baseline justify-between mt-3 mb-1.5">
          <div className="text-xs text-[#718096]">
            Spent <strong className="text-[#203451] font-bold text-sm tabular-nums">₹{budget.spent.toLocaleString('en-IN')}</strong> of ₹{budget.amount.toLocaleString('en-IN')}
          </div>
          <div className={`text-xs font-bold tabular-nums ${isOver ? 'text-[#EF5360]' : isNear ? 'text-orange-600' : 'text-[#1677F2]'}`}>
            {budget.percentage}%
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#F2F7FF] rounded-full h-2.5 overflow-hidden border border-[#DCE6F2]/60 mb-2">
          <div
            className={`h-full rounded-full transition-all duration-300 ${statusConfig.progressClass}`}
            style={{ width: `${visualBarWidth}%` }}
          />
        </div>

        {/* Sub-row: Remaining and Threshold indicator */}
        <div className="flex items-center justify-between text-[11px] text-[#718096] mb-4">
          <span>
            {budget.remaining >= 0 ? (
              <>Remaining: <strong className="text-[#16A66A] font-semibold tabular-nums">₹{budget.remaining.toLocaleString('en-IN')}</strong></>
            ) : (
              <>Exceeded by: <strong className="text-[#EF5360] font-semibold tabular-nums">₹{Math.abs(budget.remaining).toLocaleString('en-IN')}</strong></>
            )}
          </span>
          <span className="text-[10px] text-[#94A3B8]">
            Alert at {budget.alertThreshold}%
          </span>
        </div>
      </div>

      {/* Card Footer: View Details, Edit, Delete */}
      <div className="pt-3 border-t border-[#F2F7FF] flex items-center justify-between">
        <button
          onClick={() => onViewDetails(budget)}
          className="text-xs font-semibold text-[#1677F2] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>View Transactions ({budget.transactionCount})</span>
          <ArrowRight size={13} />
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1677F2] hover:bg-[#F2F7FF] transition-colors cursor-pointer"
            title="Edit Budget"
          >
            <Edit3 size={15} />
          </button>
          <button
            onClick={() => onDelete(budget.id, budget.name)}
            className="p-1.5 rounded-lg text-[#718096] hover:text-[#EF5360] hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete Budget"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
