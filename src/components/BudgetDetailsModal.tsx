import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Trash2,
  Calendar,
  AlertTriangle,
  ArrowDownLeft,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { BudgetWithCalculations, Transaction } from '../types';
import { api } from '../api';

interface BudgetDetailsModalProps {
  isOpen: boolean;
  budgetId: string | null;
  onClose: () => void;
  onEdit: (budget: BudgetWithCalculations) => void;
  onDelete: (id: string, name: string) => void;
}

export const BudgetDetailsModal: React.FC<BudgetDetailsModalProps> = ({
  isOpen,
  budgetId,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [budget, setBudget] = useState<BudgetWithCalculations | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !budgetId) {
      setBudget(null);
      setTransactions([]);
      return;
    }

    async function fetchDetails() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getBudgetDetails(budgetId!);
        setBudget(data.budget);
        setTransactions(data.transactions || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load budget details.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchDetails();
  }, [isOpen, budgetId]);

  if (!isOpen) return null;

  const visualBarWidth = budget ? Math.min(100, Math.max(0, budget.percentage)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203451]/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-[#DCE6F2] shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#F2F7FF] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider block">
              {budget?.type === 'overall' ? 'Overall Monthly Budget' : budget?.category} · {budget?.period}
            </span>
            <h2 className="text-lg font-bold text-[#203451]">
              {budget ? budget.name : 'Budget Details'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#718096] hover:text-[#203451] hover:bg-[#F2F7FF] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-[#718096]">
              <Loader2 size={24} className="animate-spin text-[#1677F2]" />
              <span className="text-xs">Loading budget records...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-[#EF5360] rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {budget && !isLoading && (
            <>
              {/* KPI Strip */}
              <div className="grid grid-cols-3 gap-3 bg-[#F8FAFC] p-4 rounded-2xl border border-[#DCE6F2]">
                <div>
                  <span className="text-[11px] text-[#718096] block">Allocated Limit</span>
                  <span className="text-base font-bold text-[#203451] tabular-nums">
                    ₹{budget.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#718096] block">Eligible Spent</span>
                  <span className="text-base font-bold text-[#EF5360] tabular-nums">
                    ₹{budget.spent.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#718096] block">Remaining</span>
                  <span
                    className={`text-base font-bold tabular-nums ${
                      budget.remaining >= 0 ? 'text-[#16A66A]' : 'text-[#EF5360]'
                    }`}
                  >
                    {budget.remaining >= 0 ? '' : '- '}₹{Math.abs(budget.remaining).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Progress Bar & Alert threshold info */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-[#718096]">Budget Utilization</span>
                  <span className={budget.status === 'over_budget' ? 'text-[#EF5360]' : 'text-[#1677F2]'}>
                    {budget.percentage}% used
                  </span>
                </div>
                <div className="w-full bg-[#F2F7FF] rounded-full h-3 overflow-hidden border border-[#DCE6F2]/70">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      budget.status === 'over_budget'
                        ? 'bg-[#EF5360]'
                        : budget.status === 'near_limit'
                        ? 'bg-orange-500'
                        : budget.status === 'warning'
                        ? 'bg-amber-500'
                        : 'bg-[#16A66A]'
                    }`}
                    style={{ width: `${visualBarWidth}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#94A3B8] mt-1.5">
                  Notification trigger set at {budget.alertThreshold}% of allocation.
                  {budget.notes ? ` Notes: "${budget.notes}"` : ''}
                </p>
              </div>

              {/* Matched Transactions Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#203451] text-sm">
                    Matching Expense Transactions ({transactions.length})
                  </h3>
                  <span className="text-[11px] text-[#718096]">
                    Counted towards this budget
                  </span>
                </div>

                {transactions.length === 0 ? (
                  <div className="bg-[#F8FAFC] border border-[#DCE6F2] rounded-2xl p-6 text-center text-xs text-[#94A3B8]">
                    No expense transactions recorded for {budget.category || 'this budget'} in {budget.period}.
                  </div>
                ) : (
                  <div className="bg-white border border-[#DCE6F2] rounded-2xl divide-y divide-[#F2F7FF] overflow-hidden">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#EF5360] flex items-center justify-center shrink-0">
                            <ArrowDownLeft size={15} />
                          </div>
                          <div>
                            <span className="font-semibold text-[#203451] block">
                              {tx.description || tx.merchant || tx.category}
                            </span>
                            <span className="text-[10px] text-[#94A3B8]">
                              {tx.date} {tx.paymentMethod ? `· ${tx.paymentMethod}` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="font-bold text-[#EF5360] tabular-nums text-right">
                          - ₹{tx.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        {budget && (
          <div className="px-6 py-4 border-t border-[#F2F7FF] bg-[#F8FAFC] flex items-center justify-between shrink-0">
            <button
              onClick={() => {
                onClose();
                onDelete(budget.id, budget.name);
              }}
              className="text-xs font-semibold text-[#EF5360] hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Delete Budget</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-[#DCE6F2] text-[#718096] hover:text-[#203451] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  onEdit(budget);
                }}
                className="px-4 py-2 bg-[#1677F2] hover:bg-[#1260C4] text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={14} />
                <span>Edit Budget</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
