import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  RecurringSchedule,
  RecurringOccurrence,
  RecurringSummary,
  UpcomingOccurrenceProjected,
  RecurrenceFrequency,
  RecurringScheduleStatus,
  NavigationPage,
} from '../types';
import { api } from '../api';
import {
  CalendarClock,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Play,
  Pause,
  Trash2,
  Edit3,
  History,
  AlertCircle,
  Calendar,
  CreditCard,
  Building,
  Sparkles,
  ArrowRight,
  Info,
  RefreshCw,
} from 'lucide-react';

interface RecurringTransactionsPageProps {
  user: User;
  onNavigate: (page: NavigationPage) => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

const CATEGORY_OPTIONS = {
  income: ['Salary', 'Freelance', 'Investments', 'Rental Income', 'Business', 'Custom Income'],
  expense: [
    'Bills & Utilities',
    'Rent & Housing',
    'Entertainment',
    'Food & Dining',
    'Transport',
    'Shopping',
    'Health & Insurance',
    'Subscriptions',
    'EMI & Loans',
    'Investments',
    'Others',
  ],
};

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  biweekly: 'Every 2 Weeks',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semiannual: 'Every 6 Months',
  yearly: 'Yearly',
};

export const RecurringTransactionsPage: React.FC<RecurringTransactionsPageProps> = ({
  user,
  onNavigate,
  onShowToast,
}) => {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>([]);
  const [summary, setSummary] = useState<RecurringSummary | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingOccurrenceProjected[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'schedules' | 'upcoming'>('schedules');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<RecurringSchedule | null>(null);

  // History Drawer
  const [selectedScheduleHistory, setSelectedScheduleHistory] = useState<{
    schedule: RecurringSchedule;
    history: RecurringOccurrence[];
  } | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Confirmation modal
  const [deletingSchedule, setDeletingSchedule] = useState<RecurringSchedule | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: 'Bills & Utilities',
    frequency: 'monthly' as RecurrenceFrequency,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    maxOccurrences: '',
    paymentMethod: 'UPI / NetBanking',
    merchant: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [schedulesRes, summaryRes, upcomingRes] = await Promise.all([
        api.getRecurringSchedules({
          status: statusFilter,
          type: typeFilter,
          frequency: frequencyFilter,
          search: searchQuery,
        }),
        api.getRecurringSummary(),
        api.getUpcomingOccurrences(30),
      ]);

      setSchedules(schedulesRes);
      setSummary(summaryRes);
      setUpcoming(upcomingRes);
    } catch (err: any) {
      console.error('Failed to load recurring data:', err);
      onShowToast('error', err.message || 'Failed to load recurring transactions');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter, frequencyFilter, searchQuery, onShowToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Form Handlers
  const handleOpenCreateModal = () => {
    setEditingSchedule(null);
    setFormData({
      name: '',
      type: 'expense',
      amount: '',
      category: 'Bills & Utilities',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      maxOccurrences: '',
      paymentMethod: 'UPI / NetBanking',
      merchant: '',
      notes: '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (s: RecurringSchedule) => {
    setEditingSchedule(s);
    setFormData({
      name: s.name,
      type: s.type,
      amount: s.amount.toString(),
      category: s.category,
      frequency: s.frequency,
      startDate: s.startDate,
      endDate: s.endDate || '',
      maxOccurrences: s.maxOccurrences ? s.maxOccurrences.toString() : '',
      paymentMethod: s.paymentMethod || 'UPI / NetBanking',
      merchant: s.merchant || '',
      notes: s.notes || '',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Transaction name is required';
    const amt = parseFloat(formData.amount);
    if (isNaN(amt) || amt <= 0) errors.amount = 'Amount must be greater than 0';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (formData.endDate && formData.endDate < formData.startDate) {
      errors.endDate = 'End date cannot precede start date';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      if (editingSchedule) {
        await api.updateRecurringSchedule(editingSchedule.id, {
          name: formData.name,
          type: formData.type,
          amount: parseFloat(formData.amount),
          category: formData.category,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          maxOccurrences: formData.maxOccurrences ? parseInt(formData.maxOccurrences, 10) : undefined,
          paymentMethod: formData.paymentMethod,
          merchant: formData.merchant,
          notes: formData.notes,
        });
        onShowToast('success', `Recurring schedule "${formData.name}" updated successfully.`);
      } else {
        await api.createRecurringSchedule({
          name: formData.name,
          type: formData.type,
          amount: parseFloat(formData.amount),
          category: formData.category,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          maxOccurrences: formData.maxOccurrences ? parseInt(formData.maxOccurrences, 10) : undefined,
          paymentMethod: formData.paymentMethod,
          merchant: formData.merchant,
          notes: formData.notes,
        });
        onShowToast('success', `Recurring schedule "${formData.name}" created successfully!`);
      }
      setIsFormModalOpen(false);
      await loadData();
    } catch (err: any) {
      onShowToast('error', err.message || 'Failed to save recurring schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  // State Change Handlers
  const handleTogglePause = async (s: RecurringSchedule) => {
    try {
      if (s.status === 'active') {
        await api.pauseRecurringSchedule(s.id);
        onShowToast('info', `Schedule "${s.name}" is now paused.`);
      } else if (s.status === 'paused') {
        await api.resumeRecurringSchedule(s.id);
        onShowToast('success', `Schedule "${s.name}" resumed.`);
      }
      await loadData();
    } catch (err: any) {
      onShowToast('error', err.message || 'Action failed');
    }
  };

  const handleCancelSchedule = async (s: RecurringSchedule) => {
    try {
      await api.cancelRecurringSchedule(s.id);
      onShowToast('info', `Future occurrences for "${s.name}" cancelled.`);
      await loadData();
    } catch (err: any) {
      onShowToast('error', err.message || 'Cancel failed');
    }
  };

  const handleDeleteSchedule = async () => {
    if (!deletingSchedule) return;
    try {
      await api.deleteRecurringSchedule(deletingSchedule.id);
      onShowToast('info', `Schedule "${deletingSchedule.name}" removed.`);
      setDeletingSchedule(null);
      await loadData();
    } catch (err: any) {
      onShowToast('error', err.message || 'Delete failed');
    }
  };

  const handleViewHistory = async (s: RecurringSchedule) => {
    try {
      const data = await api.getRecurringScheduleById(s.id);
      setSelectedScheduleHistory(data);
      setIsHistoryOpen(true);
    } catch (err: any) {
      onShowToast('error', err.message || 'Failed to fetch history');
    }
  };

  const handleRunNow = async (s: RecurringSchedule) => {
    try {
      const result = await api.triggerScheduler(s.nextRunDate);
      if (result.generatedTransactionsCount > 0) {
        onShowToast('success', `Triggered schedule! Generated ${result.generatedTransactionsCount} transaction.`);
      } else {
        onShowToast('info', 'Schedule check complete (no due pending transactions).');
      }
      await loadData();
    } catch (err: any) {
      onShowToast('error', err.message || 'Execution failed');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#DCE6F2] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E5F0FF] text-[#1677F2]">
              <CalendarClock size={24} />
            </span>
            <h1 className="text-2xl font-bold text-[#203451]">Recurring Transactions</h1>
          </div>
          <p className="text-sm text-[#718096] mt-1">
            Manage regular income, bills, and automated scheduled expenses with precision.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-[#DCE6F2] text-[#718096] hover:text-[#203451] hover:bg-[#F2F7FF] transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1677F2] text-white font-semibold text-sm hover:bg-[#1260C4] shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Create Schedule</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Schedules */}
        <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#718096] uppercase tracking-wider">
              Active Schedules
            </span>
            <p className="text-2xl font-bold text-[#203451] mt-1">
              {summary ? summary.activeCount : 0}
              <span className="text-xs font-normal text-[#718096] ml-2">
                / {summary ? summary.totalSchedulesCount : 0} total
              </span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#E5F0FF] text-[#1677F2] flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>

        {/* Est. Monthly Income */}
        <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#718096] uppercase tracking-wider">
              Est. Monthly Income
            </span>
            <p className="text-2xl font-bold text-[#10B981] mt-1">
              ₹{summary ? summary.estMonthlyIncome.toLocaleString('en-IN') : '0'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#10B981] flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Est. Monthly Expense */}
        <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#718096] uppercase tracking-wider">
              Est. Monthly Outflow
            </span>
            <p className="text-2xl font-bold text-[#EF5360] mt-1">
              ₹{summary ? summary.estMonthlyExpense.toLocaleString('en-IN') : '0'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-[#EF5360] flex items-center justify-center">
            <TrendingDown size={22} />
          </div>
        </div>

        {/* Next Upcoming Payment */}
        <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-xs flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-xs font-medium text-[#718096] uppercase tracking-wider">
              Next Scheduled
            </span>
            {summary?.nextUpcomingPayment ? (
              <div className="mt-1">
                <p className="text-sm font-bold text-[#203451] truncate">
                  {summary.nextUpcomingPayment.name}
                </p>
                <p className="text-xs text-[#718096]">
                  ₹{summary.nextUpcomingPayment.amount.toLocaleString('en-IN')} on{' '}
                  <span className="font-semibold text-[#1677F2]">
                    {summary.nextUpcomingPayment.date}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm font-semibold text-[#718096] mt-1">No upcoming items</p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
        </div>
      </div>

      {/* Main Tabs and Filter Controls */}
      <div className="bg-white rounded-2xl border border-[#DCE6F2] p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F2F7FF] pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#F2F7FF] p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'schedules'
                  ? 'bg-white text-[#1677F2] shadow-xs'
                  : 'text-[#718096] hover:text-[#203451]'
              }`}
            >
              Recurring Schedules ({schedules.length})
            </button>

            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'upcoming'
                  ? 'bg-white text-[#1677F2] shadow-xs'
                  : 'text-[#718096] hover:text-[#203451]'
              }`}
            >
              Upcoming Calendar ({upcoming.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]" size={16} />
            <input
              type="text"
              placeholder="Search schedule, payee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#DCE6F2] bg-[#F8FAFC] text-sm text-[#203451] placeholder-[#718096] focus:outline-none focus:border-[#1677F2] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Filters bar */}
        {activeTab === 'schedules' && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-[#718096] font-medium mr-1">
              <Filter size={14} />
              <span>Filters:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#DCE6F2] bg-white text-xs font-medium text-[#203451] focus:outline-none focus:border-[#1677F2]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#DCE6F2] bg-white text-xs font-medium text-[#203451] focus:outline-none focus:border-[#1677F2]"
            >
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>

            {/* Frequency Filter */}
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#DCE6F2] bg-white text-xs font-medium text-[#203451] focus:outline-none focus:border-[#1677F2]"
            >
              <option value="all">All Frequencies</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="semiannual">6 Months</option>
              <option value="yearly">Yearly</option>
            </select>

            {(statusFilter !== 'all' || typeFilter !== 'all' || frequencyFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setFrequencyFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs text-[#1677F2] font-semibold hover:underline ml-auto cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Tab 1: Schedules Grid / Table */}
        {activeTab === 'schedules' && (
          <div>
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center text-[#718096]">
                <RefreshCw size={24} className="animate-spin text-[#1677F2] mb-2" />
                <span className="text-sm font-medium">Loading recurring schedules...</span>
              </div>
            ) : schedules.length === 0 ? (
              <div className="py-12 text-center bg-[#F8FAFC] rounded-2xl border border-dashed border-[#DCE6F2] p-8">
                <div className="w-12 h-12 rounded-full bg-[#E5F0FF] text-[#1677F2] flex items-center justify-center mx-auto mb-3">
                  <CalendarClock size={24} />
                </div>
                <h3 className="text-base font-bold text-[#203451]">No Recurring Schedules Found</h3>
                <p className="text-sm text-[#718096] max-w-sm mx-auto mt-1 mb-4">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'No schedules matched your filter options.'
                    : 'Automate your monthly bills, subscriptions, and salary credits with recurring schedules.'}
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 rounded-xl bg-[#1677F2] text-white text-sm font-semibold hover:bg-[#1260C4] transition-colors cursor-pointer"
                >
                  Create Your First Schedule
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {schedules.map((s) => {
                  const isExpense = s.type === 'expense';
                  return (
                    <div
                      key={s.id}
                      className="bg-white rounded-2xl border border-[#DCE6F2] p-5 hover:border-[#1677F2]/40 transition-all shadow-xs flex flex-col justify-between group"
                    >
                      <div>
                        {/* Header Badge */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                  isExpense ? 'bg-rose-50 text-[#EF5360]' : 'bg-emerald-50 text-[#10B981]'
                                }`}
                              >
                                {s.type}
                              </span>

                              <span className="px-2 py-0.5 rounded-md bg-[#F2F7FF] text-[#718096] text-[10px] font-semibold">
                                {FREQUENCY_LABELS[s.frequency]}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-[#203451] truncate" title={s.name}>
                              {s.name}
                            </h3>
                            <p className="text-xs text-[#718096] truncate">{s.category}</p>
                          </div>

                          {/* Status Pill */}
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 ${
                              s.status === 'active'
                                ? 'bg-emerald-50 text-[#10B981]'
                                : s.status === 'paused'
                                ? 'bg-amber-50 text-amber-600'
                                : s.status === 'completed'
                                ? 'bg-slate-100 text-slate-600'
                                : 'bg-rose-50 text-rose-600'
                            }`}
                          >
                            {s.status === 'active' && <CheckCircle2 size={12} />}
                            {s.status === 'paused' && <PauseCircle size={12} />}
                            {s.status === 'completed' && <Clock size={12} />}
                            {s.status === 'cancelled' && <XCircle size={12} />}
                            <span className="capitalize">{s.status}</span>
                          </span>
                        </div>

                        {/* Amount Display */}
                        <div className="my-4">
                          <span className="text-2xl font-bold text-[#203451]">
                            ₹{s.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-[#718096] ml-1">
                            / {FREQUENCY_LABELS[s.frequency].toLowerCase()}
                          </span>
                        </div>

                        {/* Next Scheduled Date info */}
                        <div className="bg-[#F8FAFC] rounded-xl p-3 text-xs space-y-1.5 border border-[#F2F7FF] mb-4">
                          <div className="flex justify-between items-center text-[#718096]">
                            <span>Next Run:</span>
                            <span className="font-semibold text-[#1677F2]">{s.nextRunDate}</span>
                          </div>
                          {s.lastRunDate && (
                            <div className="flex justify-between items-center text-[#718096]">
                              <span>Last Executed:</span>
                              <span className="font-medium text-[#203451]">{s.lastRunDate}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[#718096]">
                            <span>Completed Runs:</span>
                            <span className="font-medium text-[#203451]">
                              {s.completedOccurrences} {s.maxOccurrences ? `/ ${s.maxOccurrences}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-[#F2F7FF] flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleTogglePause(s)}
                            disabled={s.status === 'completed' || s.status === 'cancelled'}
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1677F2] hover:bg-[#E5F0FF] transition-colors cursor-pointer disabled:opacity-30"
                            title={s.status === 'active' ? 'Pause Schedule' : 'Resume Schedule'}
                          >
                            {s.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                          </button>

                          <button
                            onClick={() => handleRunNow(s)}
                            disabled={s.status !== 'active'}
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#10B981] hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-30"
                            title="Run / Test Execution Now"
                          >
                            <RefreshCw size={16} />
                          </button>

                          <button
                            onClick={() => handleViewHistory(s)}
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#203451] hover:bg-[#F2F7FF] transition-colors cursor-pointer"
                            title="View Execution History"
                          >
                            <History size={16} />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="p-1.5 rounded-lg text-[#718096] hover:text-[#1677F2] hover:bg-[#E5F0FF] transition-colors cursor-pointer"
                            title="Edit Schedule"
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => setDeletingSchedule(s)}
                          className="p-1.5 rounded-lg text-[#718096] hover:text-[#EF5360] hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Schedule"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Upcoming Calendar View */}
        {activeTab === 'upcoming' && (
          <div>
            <div className="mb-4 text-xs text-[#718096] flex items-center gap-1.5">
              <Info size={14} className="text-[#1677F2]" />
              <span>
                Projected scheduled payments for the next 30 days. Items marked as <strong>Scheduled</strong>{' '}
                are estimated forecasts and do not alter account balances until generated.
              </span>
            </div>

            {upcoming.length === 0 ? (
              <div className="py-12 text-center text-[#718096]">
                <p className="text-sm font-semibold">No active scheduled payments in the next 30 days.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((item, idx) => {
                  const isExpense = item.type === 'expense';
                  return (
                    <div
                      key={`upc_${idx}_${item.scheduleId}`}
                      className="bg-white p-4 rounded-xl border border-[#DCE6F2] hover:border-[#1677F2]/30 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isExpense
                              ? 'bg-rose-50 text-[#EF5360]'
                              : 'bg-emerald-50 text-[#10B981]'
                          }`}
                        >
                          {item.scheduledDate.slice(8, 10)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#203451]">{item.name}</h4>
                            <span className="px-2 py-0.5 rounded-md bg-[#E5F0FF] text-[#1677F2] text-[10px] font-bold">
                              Scheduled
                            </span>
                          </div>
                          <p className="text-xs text-[#718096]">
                            {item.category} • {FREQUENCY_LABELS[item.frequency]} • Due {item.scheduledDate}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-base font-bold ${
                            isExpense ? 'text-[#203451]' : 'text-[#10B981]'
                          }`}
                        >
                          {isExpense ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
                        </span>
                        <p className="text-[10px] text-[#718096]">
                          {item.paymentMethod || 'Scheduled'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Schedule */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203451]/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE6F2] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2F7FF]">
              <h2 className="text-lg font-bold text-[#203451]">
                {editingSchedule ? 'Edit Recurring Schedule' : 'Create Recurring Schedule'}
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-[#718096] hover:text-[#203451] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 pt-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-semibold text-[#718096] uppercase mb-1">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category: 'Bills & Utilities' })}
                    className={`py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                      formData.type === 'expense'
                        ? 'bg-rose-50 text-[#EF5360] border-2 border-[#EF5360]'
                        : 'bg-[#F8FAFC] text-[#718096] border border-[#DCE6F2]'
                    }`}
                  >
                    Recurring Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', category: 'Salary' })}
                    className={`py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                      formData.type === 'income'
                        ? 'bg-emerald-50 text-[#10B981] border-2 border-[#10B981]'
                        : 'bg-[#F8FAFC] text-[#718096] border border-[#DCE6F2]'
                    }`}
                  >
                    Recurring Income
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[#718096] mb-1">
                  Schedule Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apartment Rent, Broadband Bill, Monthly Salary"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCE6F2] text-sm text-[#203451] focus:outline-none focus:border-[#1677F2]"
                />
                {formErrors.name && <p className="text-xs text-rose-500 mt-1">{formErrors.name}</p>}
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 12000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE6F2] text-sm text-[#203451] focus:outline-none focus:border-[#1677F2]"
                  />
                  {formErrors.amount && <p className="text-xs text-rose-500 mt-1">{formErrors.amount}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE6F2] text-sm text-[#203451] focus:outline-none focus:border-[#1677F2]"
                  >
                    {CATEGORY_OPTIONS[formData.type].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Frequency & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1">
                    Recurrence Frequency *
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as RecurrenceFrequency })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE6F2] text-sm text-[#203451] focus:outline-none focus:border-[#1677F2]"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Every 2 Weeks</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="semiannual">Every 6 Months</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1">
                    First / Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE6F2] text-sm text-[#203451] focus:outline-none focus:border-[#1677F2]"
                  />
                  {formErrors.startDate && <p className="text-xs text-rose-500 mt-1">{formErrors.startDate}</p>}
                </div>
              </div>

              {/* Optional End Date & Max Occurrences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE6F2] text-sm text-[#203451] focus:outline-none focus:border-[#1677F2]"
                  />
                  {formErrors.endDate && <p className="text-xs text-rose-500 mt-1">{formErrors.endDate}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1">
                    Max Runs (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 12"
                    value={formData.maxOccurrences}
                    onChange={(e) => setFormData({ ...formData, maxOccurrences: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE6F2] text-sm text-[#203451] focus:outline-none focus:border-[#1677F2]"
                  />
                </div>
              </div>

              {/* Payment Method & Merchant */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE6F2] text-sm text-[#203451] focus:outline-none focus:border-[#1677F2]"
                  >
                    <option value="UPI / NetBanking">UPI / NetBanking</option>
                    <option value="Bank Auto-Debit">Bank Auto-Debit</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1">
                    Merchant / Payee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Airtel, Netflix, Landlord"
                    value={formData.merchant}
                    onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DCE6F2] text-sm text-[#203451] focus:outline-none focus:border-[#1677F2]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-[#718096] mb-1">Notes</label>
                <textarea
                  rows={2}
                  placeholder="Additional memo or schedule details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DCE6F2] text-sm text-[#203451] focus:outline-none focus:border-[#1677F2]"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F2F7FF]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DCE6F2] text-sm font-semibold text-[#718096] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#1677F2] text-white text-sm font-semibold hover:bg-[#1260C4] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingSchedule ? 'Save Changes' : 'Create Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Drawer Modal */}
      {isHistoryOpen && selectedScheduleHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203451]/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE6F2] max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2F7FF]">
              <div>
                <h3 className="text-base font-bold text-[#203451]">
                  Execution History
                </h3>
                <p className="text-xs text-[#718096]">
                  {selectedScheduleHistory.schedule.name} • ₹
                  {selectedScheduleHistory.schedule.amount.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="text-[#718096] hover:text-[#203451] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3">
              {selectedScheduleHistory.history.length === 0 ? (
                <div className="py-8 text-center text-[#718096] text-sm">
                  No execution occurrences logged yet.
                </div>
              ) : (
                selectedScheduleHistory.history.map((occ) => (
                  <div
                    key={occ.id}
                    className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#F2F7FF] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#203451]">{occ.scheduledDate}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${
                            occ.status === 'generated'
                              ? 'bg-emerald-50 text-[#10B981]'
                              : occ.status === 'skipped'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {occ.status}
                        </span>
                      </div>
                      <p className="text-[#718096] text-[11px] mt-0.5">
                        Processed: {new Date(occ.processedAt).toLocaleString()}
                      </p>
                    </div>

                    {occ.transactionId && (
                      <span className="text-[11px] font-mono text-[#1677F2]">
                        Tx: {occ.transactionId}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#F2F7FF] text-right">
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F2F7FF] text-sm font-semibold text-[#203451] hover:bg-[#E5F0FF] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203451]/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#DCE6F2] text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#EF5360] flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#203451]">Delete Schedule?</h3>
              <p className="text-xs text-[#718096] mt-1">
                Are you sure you want to delete &quot;{deletingSchedule.name}&quot;? Previously generated
                transactions will remain intact in your financial records.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setDeletingSchedule(null)}
                className="flex-1 py-2 rounded-xl border border-[#DCE6F2] text-xs font-semibold text-[#718096] hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSchedule}
                className="flex-1 py-2 rounded-xl bg-[#EF5360] text-white text-xs font-semibold hover:bg-rose-600 cursor-pointer"
              >
                Delete Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
