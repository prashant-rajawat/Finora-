import React, { useState, useEffect } from 'react';
import { X, Loader2, DollarSign, Tag, Calendar, Bell, FileText } from 'lucide-react';
import { Budget, BudgetType } from '../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    type: BudgetType;
    category?: string;
    amount: number;
    period: string;
    notes?: string;
    alertThreshold?: number;
  }) => Promise<void>;
  initialData?: Budget | null;
  defaultPeriod?: string;
}

const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Utilities',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Personal Care',
  'Investments',
  'Others',
];

const MONTHS = [
  { label: 'October 2026', value: '2026-10' },
  { label: 'September 2026', value: '2026-09' },
  { label: 'August 2026', value: '2026-08' },
  { label: 'November 2026', value: '2026-11' },
  { label: 'December 2026', value: '2026-12' },
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultPeriod = '2026-10',
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<BudgetType>('category');
  const [category, setCategory] = useState('Food & Dining');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState(defaultPeriod === 'all' ? '2026-10' : defaultPeriod);
  const [alertThreshold, setAlertThreshold] = useState('90');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setCategory(initialData.category || 'Food & Dining');
      setAmount(initialData.amount.toString());
      setPeriod(initialData.period === 'all' ? '2026-10' : initialData.period);
      setAlertThreshold((initialData.alertThreshold || 90).toString());
      setNotes(initialData.notes || '');
    } else {
      setName('Food & Dining Budget');
      setType('category');
      setCategory('Food & Dining');
      setAmount('');
      setPeriod(defaultPeriod === 'all' ? '2026-10' : defaultPeriod);
      setAlertThreshold('90');
      setNotes('');
    }
    setError(null);
  }, [initialData, isOpen, defaultPeriod]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: BudgetType) => {
    setType(newType);
    if (newType === 'overall' && !initialData) {
      setName('Overall Monthly Budget');
    } else if (newType === 'category' && !initialData) {
      setName(`${category} Budget`);
    }
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (type === 'category' && !initialData) {
      setName(`${newCat} Budget`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    if (!name.trim()) {
      setError('Please provide a budget name.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
      setError('Please enter a valid budget amount greater than ₹0.');
      return;
    }

    if (type === 'category' && !category.trim()) {
      setError('Please select a category for this budget.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        id: initialData?.id,
        name: name.trim(),
        type,
        category: type === 'category' ? category.trim() : undefined,
        amount: Math.round(numAmount * 100) / 100,
        period: period.trim(),
        notes: notes.trim(),
        alertThreshold: parseInt(alertThreshold, 10) || 90,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save budget.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203451]/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-[#DCE6F2] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F2F7FF] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#203451]">
              {initialData ? 'Edit Budget' : 'Create Budget'}
            </h2>
            <p className="text-[11px] text-[#718096]">
              Set spending limits and smart alert thresholds
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#718096] hover:text-[#203451] hover:bg-[#F2F7FF] transition-colors focus:outline-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 text-[#EF5360] rounded-xl text-xs font-medium border border-rose-200">
              {error}
            </div>
          )}

          {/* Budget Type Segmented Control */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5">
              Budget Type
            </label>
            <div className="grid grid-cols-2 p-1 bg-[#F2F7FF] rounded-2xl border border-[#DCE6F2]">
              <button
                type="button"
                onClick={() => handleTypeChange('category')}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'category'
                    ? 'bg-[#1677F2] text-white shadow-sm'
                    : 'text-[#718096] hover:text-[#203451]'
                }`}
              >
                Category Budget
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('overall')}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  type === 'overall'
                    ? 'bg-[#1677F2] text-white shadow-sm'
                    : 'text-[#718096] hover:text-[#203451]'
                }`}
              >
                Overall Monthly
              </button>
            </div>
          </div>

          {/* Budget Name */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5">
              Budget Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Food & Dining Budget"
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm font-semibold text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all"
            />
          </div>

          {/* Category Select (only for Category Budget) */}
          {type === 'category' && (
            <div>
              <label className="block text-xs font-semibold text-[#718096] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5">
              Budget Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#203451]">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm font-bold text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all tabular-nums"
              />
            </div>
          </div>

          {/* Period & Alert Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#718096] mb-1.5 flex items-center gap-1">
                <Calendar size={12} />
                <span>Period</span>
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-xs text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none cursor-pointer"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#718096] mb-1.5 flex items-center gap-1">
                <Bell size={12} />
                <span>Alert Threshold</span>
              </label>
              <select
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-xs text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none cursor-pointer"
              >
                <option value="50">50% of budget</option>
                <option value="75">75% of budget</option>
                <option value="80">80% of budget</option>
                <option value="90">90% of budget (Recommended)</option>
                <option value="100">100% (When exceeded)</option>
              </select>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5 flex items-center gap-1">
              <FileText size={12} />
              <span>Notes / Purpose (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly restaurant and grocery cap"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={120}
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] placeholder-[#94A3B8] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-white border border-[#DCE6F2] text-[#718096] hover:text-[#203451] hover:bg-slate-50 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-[#1677F2] hover:bg-[#1260C4] text-white font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{initialData ? 'Update Budget' : 'Create Budget'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
