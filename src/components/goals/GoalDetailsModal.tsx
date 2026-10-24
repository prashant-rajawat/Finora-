import React, { useState } from 'react';
import { GoalWithCalculations, GoalStatus } from '../../types';
import {
  X,
  Target,
  ShieldCheck,
  Laptop,
  Plane,
  Home,
  Car,
  GraduationCap,
  Heart,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Archive,
  History,
  TrendingUp,
} from 'lucide-react';

interface GoalDetailsModalProps {
  isOpen: boolean;
  goal: GoalWithCalculations | null;
  onClose: () => void;
  onOpenContribute: (goal: GoalWithCalculations) => void;
  onOpenEdit: (goal: GoalWithCalculations) => void;
  onToggleStatus: (goal: GoalWithCalculations, newStatus: GoalStatus) => void;
  onDeleteContribution: (goalId: string, contribId: string) => Promise<void>;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({
  isOpen,
  goal,
  onClose,
  onOpenContribute,
  onOpenEdit,
  onToggleStatus,
  onDeleteContribution,
  onDeleteGoal,
}) => {
  const [deletingContribId, setDeletingContribId] = useState<string | null>(null);
  const [confirmDeleteGoal, setConfirmDeleteGoal] = useState(false);

  if (!isOpen || !goal) return null;

  const isCompleted = goal.status === 'completed' || goal.savedAmount >= goal.targetAmount;
  const isPaused = goal.status === 'paused';
  const isArchived = goal.status === 'archived';

  const renderIcon = (iconName?: string) => {
    const props = { size: 24, strokeWidth: 2.2 };
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck {...props} />;
      case 'Laptop':
        return <Laptop {...props} />;
      case 'Plane':
        return <Plane {...props} />;
      case 'Home':
        return <Home {...props} />;
      case 'Car':
        return <Car {...props} />;
      case 'GraduationCap':
        return <GraduationCap {...props} />;
      case 'Heart':
        return <Heart {...props} />;
      case 'Sparkles':
        return <Sparkles {...props} />;
      case 'Target':
      default:
        return <Target {...props} />;
    }
  };

  const handleDeleteContrib = async (contribId: string) => {
    if (window.confirm('Are you sure you want to delete this contribution record? Goal progress will be automatically updated.')) {
      try {
        setDeletingContribId(contribId);
        await onDeleteContribution(goal.id, contribId);
      } catch (err) {
        console.error('Failed to delete contribution:', err);
      } finally {
        setDeletingContribId(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-[#DCE6F2] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EDF2F7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
              style={{ backgroundColor: goal.color || '#1677F2' }}
            >
              {renderIcon(goal.icon)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-[#203451]">{goal.name}</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F8FAFC] text-[#64748B] border border-[#EDF2F7]">
                  {goal.category}
                </span>
              </div>
              <p className="text-xs text-[#718096] mt-0.5">
                Created on {goal.createdAt.split('T')[0]} • Status:{' '}
                <span className="font-semibold capitalize text-[#203451]">{goal.status}</span>
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

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Celebration Banner if Goal Completed */}
          {isCompleted && (
            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-3 text-xs text-[#065F46]">
              <div className="w-9 h-9 rounded-xl bg-[#10B981] text-white flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} strokeWidth={2.4} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#065F46]">Milestone Achieved!</h4>
                <p className="text-xs text-[#047857] mt-0.5">
                  Congratulations! You have reached your target of ₹{goal.targetAmount.toLocaleString('en-IN')}.
                </p>
              </div>
            </div>
          )}

          {/* Progress Overview Section */}
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#EDF2F7] space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-semibold text-[#718096]">Saved Progress</span>
                <div className="text-2xl font-extrabold text-[#203451]">
                  ₹{goal.savedAmount.toLocaleString('en-IN')}{' '}
                  <span className="text-sm font-semibold text-[#718096]">
                    / ₹{goal.targetAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-[#1677F2]">
                  {goal.progressPercentage}%
                </span>
                <div className="text-xs text-[#718096]">
                  {isCompleted ? 'Target met' : `₹${goal.remainingAmount.toLocaleString('en-IN')} left`}
                </div>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-[#10B981]' : 'bg-[#1677F2]'
                }`}
                style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
              />
            </div>

            {/* Meta Row: Deadline & Days Remaining */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#94A3B8]" />
                Target Date:{' '}
                <strong className="text-[#203451]">
                  {goal.targetDate || 'No deadline specified'}
                </strong>
              </span>

              {goal.daysRemaining !== null && (
                <span
                  className={`font-semibold px-2 py-0.5 rounded-md ${
                    goal.isOverdue && !isCompleted
                      ? 'bg-[#FEF2F2] text-[#DC2626]'
                      : 'bg-[#EBF3FF] text-[#1677F2]'
                  }`}
                >
                  {goal.isOverdue && !isCompleted
                    ? `Overdue by ${Math.abs(goal.daysRemaining)} days`
                    : goal.daysRemaining > 0
                    ? `${goal.daysRemaining} days remaining`
                    : 'Due today'}
                </span>
              )}
            </div>
          </div>

          {/* Savings Projection Calculator (Section K) */}
          <div className="p-4 rounded-2xl bg-[#EFF6FF]/60 border border-[#BFDBFE] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#1677F2]" />
                <h4 className="text-xs font-bold text-[#203451] uppercase tracking-wider">
                  Savings Projection Calculator
                </h4>
              </div>
              <span className="text-[11px] text-[#64748B]">
                Linear pacing model
              </span>
            </div>

            {goal.projections.monthlyNeeded !== null && goal.projections.monthlyNeeded > 0 && !isCompleted ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-white border border-[#DBEAFE]">
                  <span className="text-[11px] font-semibold text-[#64748B]">Monthly Target</span>
                  <div className="text-base font-extrabold text-[#1677F2]">
                    ₹{goal.projections.monthlyNeeded.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-[#64748B]">/mo</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#DBEAFE]">
                  <span className="text-[11px] font-semibold text-[#64748B]">Weekly Pacing</span>
                  <div className="text-base font-extrabold text-[#203451]">
                    ₹{goal.projections.weeklyNeeded?.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-[#64748B]">/wk</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#DBEAFE]">
                  <span className="text-[11px] font-semibold text-[#64748B]">Daily Allocation</span>
                  <div className="text-base font-extrabold text-[#203451]">
                    ₹{goal.projections.dailyNeeded?.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-[#64748B]">/day</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#4A5568] bg-white p-3 rounded-xl border border-[#DBEAFE]">
                {goal.projections.statusText}
              </p>
            )}

            <p className="text-[11px] text-[#718096] italic leading-relaxed">
              * Estimate calculates required contributions evenly over the remaining timeline. Does not factor in external investment yields.
            </p>
          </div>

          {/* Goal Description if present */}
          {goal.description && (
            <div>
              <h4 className="text-xs font-bold text-[#718096] uppercase tracking-wider mb-1">
                Description & Notes
              </h4>
              <p className="text-xs text-[#334155] leading-relaxed bg-[#F8FAFC] p-3 rounded-xl border border-[#EDF2F7]">
                {goal.description}
              </p>
            </div>
          )}

          {/* Contribution History Table (Section F) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={16} className="text-[#1677F2]" />
                <h4 className="text-xs font-bold text-[#203451] uppercase tracking-wider">
                  Contribution History ({goal.contributions.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onOpenContribute(goal)}
                className="text-xs font-bold text-[#1677F2] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Record</span>
              </button>
            </div>

            {goal.contributions.length === 0 ? (
              <div className="p-6 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1] text-xs text-[#718096]">
                No contributions logged yet. Record your first deposit to start building momentum.
              </div>
            ) : (
              <div className="border border-[#EDF2F7] rounded-2xl overflow-hidden">
                <div className="max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#EDF2F7] text-[#64748B] font-semibold sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Source</th>
                        <th className="py-2.5 px-3">Note</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF2F7]">
                      {goal.contributions.map((c) => (
                        <tr key={c.id} className="hover:bg-[#F8FAFC]/60 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-[#203451] whitespace-nowrap">
                            {c.date}
                          </td>
                          <td className="py-2.5 px-3 font-extrabold text-[#10B981] whitespace-nowrap">
                            +₹{c.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2.5 px-3 text-[#64748B] whitespace-nowrap">
                            {c.source || 'Direct'}
                          </td>
                          <td className="py-2.5 px-3 text-[#4A5568] truncate max-w-[140px]">
                            {c.note || '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteContrib(c.id)}
                              disabled={deletingContribId === c.id}
                              className="text-[#94A3B8] hover:text-[#EF5360] p-1 rounded-md transition-colors cursor-pointer"
                              title="Delete contribution"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 border-t border-[#EDF2F7] bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {!isCompleted && (
              <button
                type="button"
                onClick={() => onToggleStatus(goal, isPaused ? 'active' : 'paused')}
                className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#4A5568] hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isPaused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleStatus(goal, isArchived ? 'active' : 'archived')}
              className="px-3 py-1.5 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#4A5568] hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Archive size={14} />
              <span>{isArchived ? 'Unarchive' : 'Archive'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this goal and its contributions?')) {
                  onDeleteGoal(goal.id);
                  onClose();
                }
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#EF5360] hover:bg-red-50 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEdit(goal);
              }}
              className="px-4 py-2 rounded-xl border border-[#DCE6F2] bg-white text-xs font-bold text-[#203451] hover:bg-[#F1F5F9] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Edit2 size={14} />
              <span>Edit Goal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenContribute(goal);
              }}
              className="px-4 py-2 bg-[#1677F2] hover:bg-[#1264CD] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} strokeWidth={2.4} />
              <span>Contribute</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
