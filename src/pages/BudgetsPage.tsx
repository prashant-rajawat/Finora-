import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  ChevronDown,
  AlertTriangle,
  TrendingDown,
  ShieldCheck,
  Sparkles,
  PieChart,
  Trash2,
  CheckCircle2,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { BudgetWithCalculations, BudgetSummary, BudgetAlert } from '../types';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetModal } from '../components/BudgetModal';
import { BudgetDetailsModal } from '../components/BudgetDetailsModal';

interface BudgetsPageProps {
  summary: BudgetSummary | null;
  budgets: BudgetWithCalculations[];
  isLoading: boolean;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onCreateBudget: (data: any) => Promise<void>;
  onUpdateBudget: (id: string, data: any) => Promise<void>;
  onDeleteBudget: (id: string) => Promise<void>;
  onNavigateToTransactions?: () => void;
}

const PERIOD_OPTIONS = [
  { label: 'October 2026', value: '2026-10' },
  { label: 'September 2026', value: '2026-09' },
  { label: 'August 2026', value: '2026-08' },
  { label: 'All Months', value: 'all' },
];

export const BudgetsPage: React.FC<BudgetsPageProps> = ({
  summary,
  budgets,
  isLoading,
  selectedPeriod,
  onPeriodChange,
  onCreateBudget,
  onUpdateBudget,
  onDeleteBudget,
  onNavigateToTransactions,
}) => {
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithCalculations | null>(null);

  // Detail Modal
  const [detailBudgetId, setDetailBudgetId] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dismissed alerts in session
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const currentPeriodLabel =
    PERIOD_OPTIONS.find((p) => p.value === selectedPeriod)?.label || 'October 2026';

  const handleOpenCreate = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BudgetWithCalculations) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (data: any) => {
    if (data.id) {
      await onUpdateBudget(data.id, data);
    } else {
      await onCreateBudget(data);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setIsDeleting(true);
      await onDeleteBudget(deleteConfirm.id);
      setDeleteConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const activeAlerts = (summary?.alerts || []).filter(
    (a) => !dismissedAlerts.includes(a.id)
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Page Header: Title, Description, Period Filter, and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#203451]">
            Budgets
          </h1>
          <p className="text-xs sm:text-sm text-[#718096] mt-0.5">
            Plan, monitor, and enforce spending limits across categories to grow your savings.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Period Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-[#DCE6F2] rounded-xl text-xs font-semibold text-[#203451] hover:bg-[#F8FAFC] transition-colors shadow-2xs cursor-pointer"
            >
              <span>{currentPeriodLabel}</span>
              <ChevronDown size={14} className="text-[#718096]" />
            </button>

            {showPeriodMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-[#DCE6F2] rounded-2xl shadow-xl py-1.5 z-30">
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onPeriodChange(opt.value);
                      setShowPeriodMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                      selectedPeriod === opt.value
                        ? 'bg-[#E5F0FF] text-[#1677F2] font-semibold'
                        : 'text-[#203451] hover:bg-[#F2F7FF]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create Budget Action Button */}
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1677F2] hover:bg-[#1260C4] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Create Budget</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards matching Finora card style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Budget */}
        <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#E5F0FF] text-[#1677F2] flex items-center justify-center shrink-0">
              <Wallet size={20} />
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#718096] block">Total Budget</span>
              <div className="text-xl font-bold tracking-tight text-[#203451] tabular-nums">
                ₹{(summary?.totalBudget ?? 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#94A3B8]">
            Allocated spending ceiling
          </span>
        </div>

        {/* Total Eligible Spent */}
        <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#EF5360] flex items-center justify-center shrink-0">
              <TrendingDown size={20} />
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#718096] block">Eligible Spent</span>
              <div className="text-xl font-bold tracking-tight text-[#203451] tabular-nums">
                ₹{(summary?.totalSpent ?? 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#94A3B8]">
            Actual recorded expenses
          </span>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                (summary?.remaining ?? 0) >= 0
                  ? 'bg-emerald-50 text-[#16A66A]'
                  : 'bg-rose-50 text-[#EF5360]'
              }`}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#718096] block">Remaining</span>
              <div
                className={`text-xl font-bold tracking-tight tabular-nums ${
                  (summary?.remaining ?? 0) >= 0 ? 'text-[#16A66A]' : 'text-[#EF5360]'
                }`}
              >
                {(summary?.remaining ?? 0) >= 0 ? '' : '- '}₹{Math.abs(summary?.remaining ?? 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#94A3B8]">
            {(summary?.remaining ?? 0) >= 0 ? 'Available surplus' : 'Deficit / over budget'}
          </span>
        </div>

        {/* Over Limit Count */}
        <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                (summary?.overBudgetCount ?? 0) > 0
                  ? 'bg-rose-50 text-[#EF5360]'
                  : 'bg-emerald-50 text-[#16A66A]'
              }`}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#718096] block">Over Limit</span>
              <div className="text-xl font-bold tracking-tight text-[#203451] tabular-nums">
                {summary?.overBudgetCount ?? 0}
              </div>
            </div>
          </div>
          <span className="text-[11px] text-[#94A3B8]">
            {(summary?.overBudgetCount ?? 0) === 0 ? 'All budgets within limit' : 'Budgets exceeding 100%'}
          </span>
        </div>
      </div>

      {/* In-App Alert Banners */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2.5">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-xs animate-in slide-in-from-top-2 duration-150 ${
                alert.level === 'danger'
                  ? 'bg-rose-50/90 border-rose-200 text-rose-900'
                  : 'bg-amber-50/90 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle size={18} className={alert.level === 'danger' ? 'text-[#EF5360]' : 'text-amber-600'} />
                <span className="font-semibold">{alert.message}</span>
              </div>
              <button
                onClick={() => setDismissedAlerts((prev) => [...prev, alert.id])}
                className="text-[11px] text-[#718096] hover:text-[#203451] font-semibold underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Budget Grid & Category Progress Overview */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          <div className="h-44 bg-white/70 rounded-2xl border border-[#DCE6F2]" />
          <div className="h-44 bg-white/70 rounded-2xl border border-[#DCE6F2]" />
          <div className="h-44 bg-white/70 rounded-2xl border border-[#DCE6F2]" />
        </div>
      ) : budgets.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#DCE6F2] shadow-xs text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#E5F0FF] text-[#1677F2] flex items-center justify-center mx-auto shadow-sm">
            <Wallet size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#203451]">
              No budgets set for {currentPeriodLabel}
            </h3>
            <p className="text-xs text-[#718096] mt-1 leading-relaxed max-w-sm mx-auto">
              Set spending limits for groceries, dining, shopping, or your overall monthly expenses to stay in control of your financial goals.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#1677F2] hover:bg-[#1260C4] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Create Your First Budget</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Budget Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#203451]">
                Active Budgets ({budgets.length})
              </h2>
              <span className="text-xs text-[#718096]">
                Real-time calculations from transaction records
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {budgets.map((b) => (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  onEdit={handleOpenEdit}
                  onDelete={(id, name) => setDeleteConfirm({ id, name })}
                  onViewDetails={(bgt) => setDetailBudgetId(bgt.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        initialData={editingBudget}
        defaultPeriod={selectedPeriod}
      />

      {/* Details & Matched Transactions Modal */}
      <BudgetDetailsModal
        isOpen={detailBudgetId !== null}
        budgetId={detailBudgetId}
        onClose={() => setDetailBudgetId(null)}
        onEdit={handleOpenEdit}
        onDelete={(id, name) => setDeleteConfirm({ id, name })}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203451]/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DCE6F2] shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#EF5360] flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-bold text-[#203451] mb-1">
              Delete "{deleteConfirm.name}"?
            </h3>
            <p className="text-xs text-[#718096] mb-6 leading-relaxed">
              This deletes only the budget limit. Your recorded transactions and receipts will <strong>remain intact</strong>.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-[#203451] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-[#EF5360] hover:bg-rose-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete Budget'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
