import React, { useState } from 'react';
import { GoalWithCalculations } from '../../types';
import { X, Plus, PiggyBank, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface ContributionModalProps {
  isOpen: boolean;
  goal: GoalWithCalculations | null;
  onClose: () => void;
  onSave: (goalId: string, data: {
    amount: number;
    date?: string;
    note?: string;
    source?: string;
  }) => Promise<void>;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  goal,
  onClose,
  onSave,
}) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('Savings Account');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !goal) return null;

  const currentSaved = goal.savedAmount;
  const target = goal.targetAmount;
  const currentRemaining = goal.remainingAmount;

  const enteredAmount = Number(amount) > 0 ? Number(amount) : 0;
  const simulatedNewSaved = currentSaved + enteredAmount;
  const simulatedNewRemaining = Math.max(0, target - simulatedNewSaved);
  const simulatedNewPercentage = target > 0
    ? Math.round((simulatedNewSaved / target) * 1000) / 10
    : 0;

  const sources = [
    'Savings Account',
    'Bank Transfer',
    'UPI',
    'Monthly Salary',
    'Freelance Income',
    'Cash Deposit',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!amount || isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid contribution amount greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave(goal.id, {
        amount: parsed,
        date: date || undefined,
        note: note.trim() || undefined,
        source: source || undefined,
      });
      // Reset form
      setAmount('');
      setNote('');
      onClose();
    } catch (err: any) {
      console.error('Failed to record contribution:', err);
      setError(err.message || 'Failed to record contribution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-[#DCE6F2] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EDF2F7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-[#10B981] flex items-center justify-center shrink-0">
              <PiggyBank size={20} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#203451]">
                Add Contribution
              </h2>
              <p className="text-xs text-[#718096] truncate max-w-[240px]">
                {goal.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#718096] hover:text-[#203451] hover:bg-[#F2F7FF] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-[#EF5360] bg-[#FEF2F2] border border-[#FECACA] rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Current Goal Status Snapshot */}
          <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-[#EDF2F7] flex items-center justify-between text-xs">
            <div>
              <span className="text-[#718096]">Current Saved</span>
              <div className="font-extrabold text-[#203451] text-sm">
                ₹{currentSaved.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[#718096]">Target Goal</span>
              <div className="font-extrabold text-[#203451] text-sm">
                ₹{target.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Contribution Amount */}
          <div>
            <label className="block text-xs font-bold text-[#203451] mb-1">
              Contribution Amount (₹) <span className="text-[#EF5360]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#718096]">₹</span>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="any"
                autoFocus
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-base font-bold text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
              />
            </div>
          </div>

          {/* Interactive Live Impact Simulation Box */}
          {enteredAmount > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#EBF3FF]/70 border border-[#BFDBFE] space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-[#1677F2]">
                <span className="flex items-center gap-1">
                  <Sparkles size={13} /> Impact on Goal
                </span>
                <span>+{enteredAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#64748B]">New Saved Total</span>
                  <div className="font-bold text-[#203451]">
                    ₹{simulatedNewSaved.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-[#64748B]">New Remaining</span>
                  <div className="font-bold text-[#203451]">
                    ₹{simulatedNewRemaining.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Live Simulated Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#1677F2]">
                  <span>Progress</span>
                  <span>{simulatedNewPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      simulatedNewPercentage >= 100 ? 'bg-[#10B981]' : 'bg-[#1677F2]'
                    }`}
                    style={{ width: `${Math.min(100, simulatedNewPercentage)}%` }}
                  />
                </div>
              </div>

              {simulatedNewSaved >= target && (
                <div className="text-[11px] font-bold text-[#059669] flex items-center gap-1 pt-1">
                  <CheckCircle2 size={13} />
                  <span>This contribution will fulfill this savings goal!</span>
                </div>
              )}
            </div>
          )}

          {/* Date & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#203451] mb-1">
                Contribution Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#203451] mb-1">
                Funding Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
              >
                {sources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold text-[#203451] mb-1">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. October savings transfer"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#EDF2F7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#4A5568] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !amount || Number(amount) <= 0}
              className="px-5 py-2.5 bg-[#1677F2] hover:bg-[#1264CD] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Plus size={15} strokeWidth={2.4} />
                  <span>Record Contribution</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
