import React from 'react';
import { TopExpenseItem } from '../../types';
import { ArrowUpRight, ShoppingBag, Calendar, Tag } from 'lucide-react';

interface TopExpensesListProps {
  expenses: TopExpenseItem[];
  onViewTransactions?: (searchTerm?: string) => void;
}

export const TopExpensesList: React.FC<TopExpensesListProps> = ({
  expenses,
  onViewTransactions,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#203451] text-base">Top Expenses in Period</h3>
            <span className="w-6 h-6 rounded-lg bg-[#EBF3FF] text-[#1677F2] flex items-center justify-center">
              <ShoppingBag size={14} />
            </span>
          </div>
          <p className="text-xs text-[#718096]">
            Largest individual outflows recorded during this timeframe
          </p>
        </div>

        {onViewTransactions && (
          <button
            type="button"
            onClick={() => onViewTransactions()}
            className="text-xs font-semibold text-[#1677F2] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All Transactions</span>
            <ArrowUpRight size={14} />
          </button>
        )}
      </div>

      {expenses.length === 0 ? (
        <div className="p-6 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
          <ShoppingBag className="mx-auto text-[#94A3B8] mb-2" size={28} />
          <p className="text-sm font-semibold text-[#4A5568]">No expenses logged</p>
          <p className="text-xs text-[#718096]">
            Your largest transactions will be automatically highlighted here.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {expenses.map((item, idx) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-[#EDF2F7] hover:border-[#CBD5E1] transition-all bg-white flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-[#F1F5F9] text-[#64748B] text-xs font-bold flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#203451] truncate">
                    {item.description}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-[#718096] mt-0.5">
                    <span className="flex items-center gap-1">
                      <Tag size={11} />
                      <span>{item.category}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      <span>{item.date}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-extrabold text-[#EF5360]">
                  -₹{item.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] font-semibold text-[#64748B]">
                  {item.percentageOfTotal}% of period
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
