import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import {
  User,
  GoalWithCalculations,
  GoalSummary,
  GoalFilterType,
  GoalSortType,
  GoalStatus,
  NavigationPage,
} from '../types';
import { GoalSummaryCards } from '../components/goals/GoalSummaryCards';
import { GoalCard } from '../components/goals/GoalCard';
import { GoalModal } from '../components/goals/GoalModal';
import { ContributionModal } from '../components/goals/ContributionModal';
import { GoalDetailsModal } from '../components/goals/GoalDetailsModal';
import {
  Target,
  Plus,
  Filter,
  ArrowUpDown,
  Search,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface GoalsPageProps {
  user: User | null;
  onNavigate: (page: NavigationPage) => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({
  user,
  onNavigate,
  onShowToast,
}) => {
  const [goals, setGoals] = useState<GoalWithCalculations[]>([]);
  const [summary, setSummary] = useState<GoalSummary | null>(null);
  const [filter, setFilter] = useState<GoalFilterType>('all');
  const [sort, setSort] = useState<GoalSortType>('deadline');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithCalculations | null>(null);

  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [contributeTargetGoal, setContributeTargetGoal] = useState<GoalWithCalculations | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsGoal, setDetailsGoal] = useState<GoalWithCalculations | null>(null);

  const loadGoalsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [goalsList, summaryData] = await Promise.all([
        api.getGoals({ filter, sort }),
        api.getGoalSummary(),
      ]);
      setGoals(goalsList);
      setSummary(summaryData);

      // Keep details goal in sync if open
      if (detailsGoal) {
        const refreshed = goalsList.find((g) => g.id === detailsGoal.id);
        if (refreshed) setDetailsGoal(refreshed);
      }
    } catch (err: any) {
      console.error('Failed to load savings goals:', err);
      setError(err.message || 'Unable to load savings goals.');
    } finally {
      setIsLoading(false);
    }
  }, [filter, sort]);

  useEffect(() => {
    loadGoalsData();
  }, [loadGoalsData]);

  // Handlers
  const handleCreateOrUpdateGoal = async (data: {
    name: string;
    category: string;
    targetAmount: number;
    initialAmount?: number;
    targetDate?: string;
    description?: string;
    color?: string;
    icon?: string;
    frequencyPreference?: 'weekly' | 'bi-weekly' | 'monthly' | 'one-time';
  }) => {
    if (editingGoal) {
      const updated = await api.updateGoal(editingGoal.id, data);
      onShowToast('success', `Goal "${updated.name}" updated successfully.`);
    } else {
      const created = await api.createGoal(data);
      onShowToast('success', `Goal "${created.name}" created successfully!`);
    }
    await loadGoalsData();
    setEditingGoal(null);
  };

  const handleRecordContribution = async (
    goalId: string,
    data: { amount: number; date?: string; note?: string; source?: string }
  ) => {
    const res = await api.addContribution(goalId, data);
    onShowToast('success', `Contributed ₹${data.amount.toLocaleString('en-IN')} toward ${res.goal.name}.`);
    await loadGoalsData();
    // Update details goal state if open
    if (detailsGoal && detailsGoal.id === goalId) {
      setDetailsGoal(res.goal);
    }
  };

  const handleDeleteContribution = async (goalId: string, contribId: string) => {
    const updatedGoal = await api.deleteContribution(goalId, contribId);
    onShowToast('info', 'Contribution removed and progress recalculated.');
    await loadGoalsData();
    if (detailsGoal && detailsGoal.id === goalId) {
      setDetailsGoal(updatedGoal);
    }
  };

  const handleToggleStatus = async (goal: GoalWithCalculations, newStatus: GoalStatus) => {
    try {
      const updated = await api.updateGoal(goal.id, { status: newStatus });
      onShowToast('info', `Goal marked as ${newStatus}.`);
      await loadGoalsData();
      if (detailsGoal && detailsGoal.id === goal.id) {
        setDetailsGoal(updated);
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Failed to update goal status.');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await api.deleteGoal(goalId);
      onShowToast('info', 'Goal deleted successfully.');
      await loadGoalsData();
      if (detailsGoal && detailsGoal.id === goalId) {
        setIsDetailsModalOpen(false);
        setDetailsGoal(null);
      }
    } catch (err: any) {
      onShowToast('error', err.message || 'Failed to delete goal.');
    }
  };

  // Client-side search filter
  const filteredGoals = goals.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q) ||
      (g.description && g.description.toLowerCase().includes(q))
    );
  });

  const filterTabs: Array<{ key: GoalFilterType; label: string }> = [
    { key: 'all', label: 'All Goals' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'paused', label: 'Paused' },
    { key: 'archived', label: 'Archived' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Heading & Main Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#203451] tracking-tight">
              Savings Goals
            </h1>
            <span className="w-8 h-8 rounded-xl bg-[#EBF3FF] text-[#1677F2] flex items-center justify-center shrink-0">
              <Target size={18} />
            </span>
          </div>
          <p className="text-sm text-[#718096] mt-1">
            Turn your financial plans into achievable milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadGoalsData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-[#DCE6F2] bg-white text-[#4A5568] hover:text-[#1677F2] hover:bg-[#F8FAFC] transition-colors cursor-pointer shadow-xs"
            title="Refresh goals"
          >
            <RefreshCw size={17} className={isLoading ? 'animate-spin text-[#1677F2]' : ''} />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            className="px-4 py-2.5 bg-[#1677F2] hover:bg-[#1264CD] text-white font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer text-sm"
          >
            <Plus size={18} strokeWidth={2.4} />
            <span>Create Goal</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && <GoalSummaryCards summary={summary} />}

      {/* Error state alert */}
      {error && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between gap-3 text-sm text-[#DC2626]">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadGoalsData}
            className="text-xs font-bold underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter, Sort, and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#DCE6F2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F5F8FC] rounded-xl border border-[#E2E8F0]">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1677F2] text-white shadow-xs'
                    : 'text-[#4A5568] hover:text-[#203451] hover:bg-white/80'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[180px]">
            <Search size={14} className="absolute left-3 top-2.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown size={14} className="text-[#718096]" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as GoalSortType)}
              className="px-2.5 py-1.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#203451] bg-white focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
            >
              <option value="deadline">Closest Deadline</option>
              <option value="progress_desc">Highest Progress %</option>
              <option value="progress_asc">Lowest Progress %</option>
              <option value="target_desc">Highest Target Amount</option>
              <option value="target_asc">Lowest Target Amount</option>
              <option value="created_desc">Recently Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* Goals Grid / List */}
      {isLoading && goals.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-white rounded-2xl p-5 border border-[#DCE6F2] animate-pulse"
            />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        /* Empty State with Onboarding Guidance */
        <div className="bg-white rounded-3xl p-10 border border-[#DCE6F2] shadow-xs text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#EBF3FF] text-[#1677F2] flex items-center justify-center mx-auto shadow-2xs">
            <Target size={32} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#203451]">
              {searchQuery
                ? 'No matching savings goals found'
                : filter !== 'all'
                ? `No ${filter} goals found`
                : 'No savings goals created yet'}
            </h3>
            <p className="text-xs text-[#718096] mt-1.5 max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? 'Try tweaking your search keywords or clearing active filters.'
                : 'Start turning your financial ambitions into achievable milestones. Define your target amount, set a deadline, and log contributions.'}
            </p>
          </div>

          <div>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-xs font-bold text-[#203451] rounded-xl transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingGoal(null);
                  setIsGoalModalOpen(true);
                }}
                className="px-5 py-2.5 bg-[#1677F2] hover:bg-[#1264CD] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 mx-auto"
              >
                <Plus size={16} strokeWidth={2.4} />
                <span>Create Your First Goal</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onOpenContribute={(g) => {
                setContributeTargetGoal(g);
                setIsContributeModalOpen(true);
              }}
              onOpenDetails={(g) => {
                setDetailsGoal(g);
                setIsDetailsModalOpen(true);
              }}
              onOpenEdit={(g) => {
                setEditingGoal(g);
                setIsGoalModalOpen(true);
              }}
              onToggleStatus={handleToggleStatus}
              onDeleteGoal={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleCreateOrUpdateGoal}
        initialData={editingGoal}
      />

      <ContributionModal
        isOpen={isContributeModalOpen}
        goal={contributeTargetGoal}
        onClose={() => {
          setIsContributeModalOpen(false);
          setContributeTargetGoal(null);
        }}
        onSave={handleRecordContribution}
      />

      <GoalDetailsModal
        isOpen={isDetailsModalOpen}
        goal={detailsGoal}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsGoal(null);
        }}
        onOpenContribute={(g) => {
          setContributeTargetGoal(g);
          setIsContributeModalOpen(true);
        }}
        onOpenEdit={(g) => {
          setEditingGoal(g);
          setIsGoalModalOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
        onDeleteContribution={handleDeleteContribution}
        onDeleteGoal={handleDeleteGoal}
      />
    </div>
  );
};
