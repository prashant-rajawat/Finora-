import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: {
    id?: string;
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    description: string;
  }) => Promise<void>;
  initialData?: Transaction | null;
}

const CATEGORIES_BY_TYPE = {
  expense: [
    'Food & Dining',
    'Transport',
    'Shopping',
    'Utilities',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Personal Care',
    'Others',
  ],
  income: [
    'Salary',
    'Freelance',
    'Business',
    'Investments',
    'Rental Income',
    'Gift',
    'Others',
  ],
};

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      setCategory(initialData.category);
      setDate(initialData.date);
      setDescription(initialData.description || '');
    } else {
      setType('expense');
      setAmount('');
      setCategory('');
      // Default to current date or October 2026 to align with demo
      const today = new Date().toISOString().slice(0, 10);
      setDate(today.startsWith('2026') ? today : '2026-10-15');
      setDescription('');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (!category.trim()) {
      setError('Please select a category.');
      return;
    }

    if (!date) {
      setError('Please choose a valid date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        id: initialData?.id,
        type,
        amount: numAmount,
        category,
        date,
        description,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = CATEGORIES_BY_TYPE[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203451]/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-[#DCE6F2] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F2F7FF] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#203451]">
            {initialData ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#718096] hover:text-[#203451] hover:bg-[#F2F7FF] transition-colors focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-[#EF5360] rounded-xl text-xs font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* Segmented Type Toggle */}
          <div className="grid grid-cols-2 p-1 bg-[#F2F7FF] rounded-2xl border border-[#DCE6F2]">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (!CATEGORIES_BY_TYPE.expense.includes(category)) setCategory('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-[#EF5360] text-white shadow-sm'
                  : 'text-[#718096] hover:text-[#203451]'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                if (!CATEGORIES_BY_TYPE.income.includes(category)) setCategory('');
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-[#16A66A] text-white shadow-sm'
                  : 'text-[#718096] hover:text-[#203451]'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#203451]">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm font-semibold text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all tabular-nums"
              />
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all"
            >
              <option value="" disabled>Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all"
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Grocery shopping"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              className="flex-1 py-2.5 px-4 bg-white border border-[#DCE6F2] text-[#718096] hover:text-[#203451] hover:bg-slate-50 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 bg-[#1677F2] hover:bg-[#1260C4] text-white font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Transaction</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
