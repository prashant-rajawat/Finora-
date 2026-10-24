import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  amount: number;
  growth: string;
  icon: LucideIcon;
  variant: 'income' | 'expense' | 'balance';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  growth,
  icon: Icon,
  variant,
}) => {
  const styles = {
    income: {
      bgIcon: 'bg-emerald-50 text-[#16A66A]',
      growthText: 'text-[#16A66A] bg-emerald-50/70',
      dot: 'bg-[#16A66A]',
    },
    expense: {
      bgIcon: 'bg-rose-50 text-[#EF5360]',
      growthText: 'text-[#EF5360] bg-rose-50/70',
      dot: 'bg-[#EF5360]',
    },
    balance: {
      bgIcon: 'bg-[#E5F0FF] text-[#1677F2]',
      growthText: 'text-[#1677F2] bg-blue-50/70',
      dot: 'bg-[#1677F2]',
    },
  }[variant];

  const formattedAmount = `₹${Math.abs(amount).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${styles.bgIcon}`}>
          <Icon size={22} strokeWidth={2.2} />
        </div>
        <div>
          <span className="text-xs font-medium text-[#718096] block">{title}</span>
          <div className="text-2xl font-bold tracking-tight text-[#203451] tabular-nums">
            {amount < 0 ? `- ${formattedAmount}` : formattedAmount}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 pt-1">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles.growthText}`}>
          {growth}
        </span>
        <span className="text-[11px] text-[#94A3B8]">from last month</span>
      </div>
    </div>
  );
};
