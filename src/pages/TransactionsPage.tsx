import React, { useState } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Edit3,
  Trash2,
  Calendar,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';

interface TransactionsPageProps {
  transactions: Transaction[];
  isLoading: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => Promise<void>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedType: string;
  onSelectType: (t: string) => void;
  selectedMonth: string;
  onSelectMonth: (m: string) => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  isLoading,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteTransaction,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedType,
  onSelectType,
  selectedMonth,
  onSelectMonth,
}) => {
  const [deleteIdConfirm, setDeleteIdConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = [
    'All Categories',
    'Food & Dining',
    'Transport',
    'Shopping',
    'Utilities',
    'Bills & Utilities',
    'Entertainment',
    'Salary',
    'Freelance',
    'Healthcare',
    'Others',
  ];

  const types = ['All Types', 'Expense', 'Income'];

  const months = [
    { label: 'October 2026', value: '2026-10' },
    { label: 'September 2026', value: '2026-09' },
    { label: 'August 2026', value: '2026-08' },
    { label: 'All Months', value: 'all' },
  ];

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await onDeleteTransaction(id);
      setDeleteIdConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Add Transaction button matching Panel 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#203451]">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-0.5">
            View and manage your income and expenses
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1677F2] hover:bg-[#1260C4] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filter Bar matching Panel 5 */}
      <div className="bg-white rounded-2xl p-4 border border-[#DCE6F2] shadow-xs flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-xs text-[#203451] placeholder-[#94A3B8] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative min-w-[150px]">
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-xs text-[#203451] font-medium appearance-none focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] pointer-events-none"
          />
        </div>

        {/* Type Dropdown */}
        <div className="relative min-w-[120px]">
          <select
            value={selectedType}
            onChange={(e) => onSelectType(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-xs text-[#203451] font-medium appearance-none focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all cursor-pointer"
          >
            {types.map((t) => (
              <option key={t} value={t.toLowerCase()}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] pointer-events-none"
          />
        </div>

        {/* Date / Month Dropdown */}
        <div className="relative min-w-[140px]">
          <select
            value={selectedMonth}
            onChange={(e) => onSelectMonth(e.target.value)}
            className="w-full pl-3 pr-8 py-2 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-xs text-[#203451] font-medium appearance-none focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all cursor-pointer"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] pointer-events-none"
          />
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-white rounded-2xl border border-[#DCE6F2] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#DCE6F2] text-[11px] font-bold text-[#718096] uppercase tracking-wider">
                <th className="py-3.5 px-5">Date</th>
                <th className="py-3.5 px-5">Description</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Type</th>
                <th className="py-3.5 px-5 text-right">Amount</th>
                <th className="py-3.5 px-5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F7FF] text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#718096]">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <p className="font-semibold text-sm text-[#203451]">No transactions found</p>
                      <p className="text-xs text-[#718096]">
                        Try adjusting your filters or click "+ Add Transaction" to record a new entry.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-5 text-[#718096] font-medium whitespace-nowrap">
                        {tx.date}
                      </td>

                      {/* Description with category icon */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                              isIncome
                                ? 'bg-emerald-50 text-[#16A66A]'
                                : 'bg-rose-50 text-[#EF5360]'
                            }`}
                          >
                            {isIncome ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                          </div>
                          <span className="font-semibold text-[#203451]">
                            {tx.description || tx.category}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-5 text-[#718096]">
                        {tx.category}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isIncome
                              ? 'bg-emerald-50 text-[#16A66A]'
                              : 'bg-rose-50 text-[#EF5360]'
                          }`}
                        >
                          {isIncome ? 'Income' : 'Expense'}
                        </span>
                      </td>

                      {/* Amount in INR */}
                      <td
                        className={`py-3.5 px-5 text-right font-bold tabular-nums whitespace-nowrap ${
                          isIncome ? 'text-[#16A66A]' : 'text-[#EF5360]'
                        }`}
                      >
                        {isIncome ? '+ ' : '- '}₹
                        {tx.amount.toLocaleString('en-IN', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onOpenEditModal(tx)}
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1677F2] hover:bg-[#F2F7FF] transition-colors"
                            title="Edit"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteIdConfirm(tx.id)}
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#EF5360] hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer info */}
        <div className="px-5 py-3 bg-[#F8FAFC] border-t border-[#DCE6F2] flex items-center justify-between text-xs text-[#718096]">
          <span>
            Showing <strong className="text-[#203451]">{transactions.length}</strong> records
          </span>
          <span className="text-[11px] text-[#94A3B8]">
            Indian Rupee (₹) Ledger
          </span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteIdConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203451]/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DCE6F2] shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#EF5360] flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-bold text-[#203451] mb-1">
              Delete Transaction?
            </h3>
            <p className="text-xs text-[#718096] mb-6">
              This action cannot be undone. The amount will be removed from your balance and calculations.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteIdConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#203451] rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteIdConfirm)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-[#EF5360] hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
