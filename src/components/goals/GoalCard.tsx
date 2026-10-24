import React, { useState } from 'react';
import { GoalWithCalculations, GoalStatus } from '../../types';
import {
  ShieldCheck,
  Laptop,
  Plane,
  Home,
  Car,
  GraduationCap,
  Heart,
  Sparkles,
  Target,
  Plus,
  Eye,
  MoreVertical,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Archive,
  Trash2,
  Calendar,
  AlertCircle,
  Flame,
} from 'lucide-react';

interface GoalCardProps {
  goal: GoalWithCalculations;
  onOpenContribute: (goal: GoalWithCalculations) => void;
  onOpenDetails: (goal: GoalWithCalculations) => void;
  onOpenEdit: (goal: GoalWithCalculations) => void;
  onToggleStatus: (goal: GoalWithCalculations, newStatus: GoalStatus) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onOpenContribute,
  onOpenDetails,
  onOpenEdit,
  onToggleStatus,
  onDeleteGoal,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Helper to render dynamic icon
  const renderIcon = (iconName?: string) => {
    const props = { size: 22, strokeWidth: 2.2 };
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

  const isCompleted = goal.status === 'completed' || goal.savedAmount >= goal.targetAmount;
  const isPaused = goal.status === 'paused';
  const isArchived = goal.status === 'archived';

  const statusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#059669]">
          <CheckCircle2 size={12} strokeWidth={2.5} />
          <span>Completed</span>
        </span>
      );
    }
    if (isPaused) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FFFBEB] text-[#D97706]">
          <PauseCircle size={12} strokeWidth={2.5} />
          <span>Paused</span>
        </span>
      );
    }
    if (isArchived) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#64748B]">
          <Archive size={12} strokeWidth={2.5} />
          <span>Archived</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#EBF3FF] text-[#1677F2]">
        <span>Active</span>
      </span>
    );
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between shadow-xs relative ${
        isCompleted
          ? 'border-[#A7F3D0] hover:border-[#34D399]'
          : isPaused
          ? 'border-[#FDE68A] opacity-90'
          : isArchived
          ? 'border-[#E2E8F0] opacity-75'
          : 'border-[#DCE6F2] hover:border-[#1677F2]/40'
      }`}
    >
      <div>
        {/* Top Header: Icon, Titles, Badges & Action Menu */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs text-white"
              style={{ backgroundColor: goal.color || '#1677F2' }}
            >
              {renderIcon(goal.icon)}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-[#203451] text-base leading-snug truncate">
                {goal.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md border border-[#EDF2F7]">
                  {goal.category}
                </span>
                {statusBadge()}
              </div>
            </div>
          </div>

          {/* Context Options Menu */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#203451] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              aria-label="Goal Options"
            >
              <MoreVertical size={17} />
            </button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-lg border border-[#DCE6F2] py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenDetails(goal);
                    }}
                    className="w-full px-3.5 py-2 text-left text-[#203451] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Eye size={14} className="text-[#1677F2]" />
                    <span>View Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenEdit(goal);
                    }}
                    className="w-full px-3.5 py-2 text-left text-[#203451] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <span>Edit Goal</span>
                  </button>
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onToggleStatus(goal, isPaused ? 'active' : 'paused');
                      }}
                      className="w-full px-3.5 py-2 text-left text-[#203451] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer font-medium"
                    >
                      {isPaused ? (
                        <>
                          <PlayCircle size={14} className="text-[#10B981]" />
                          <span>Resume Tracking</span>
                        </>
                      ) : (
                        <>
                          <PauseCircle size={14} className="text-[#D97706]" />
                          <span>Pause Goal</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onToggleStatus(goal, isArchived ? 'active' : 'archived');
                    }}
                    className="w-full px-3.5 py-2 text-left text-[#203451] hover:bg-[#F8FAFC] flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Archive size={14} className="text-[#64748B]" />
                    <span>{isArchived ? 'Unarchive Goal' : 'Archive Goal'}</span>
                  </button>
                  <div className="border-t border-[#EDF2F7] my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onDeleteGoal(goal.id);
                    }}
                    className="w-full px-3.5 py-2 text-left text-[#EF5360] hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <Trash2 size={14} />
                    <span>Delete Goal</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Financial Numbers */}
        <div className="space-y-1 mb-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-[#203451] tracking-tight">
              ₹{goal.savedAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-[#718096]">
              of ₹{goal.targetAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-[#718096]">
            <span>
              {isCompleted ? (
                <span className="text-[#059669] font-bold">Target Achieved!</span>
              ) : (
                <>₹{goal.remainingAmount.toLocaleString('en-IN')} remaining</>
              )}
            </span>
            <span className="font-bold text-[#203451]">
              {goal.progressPercentage}%
            </span>
          </div>
        </div>

        {/* Progress Bar with capped 100% and visual indicators */}
        <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isCompleted
                ? 'bg-[#10B981]'
                : goal.progressPercentage >= 80
                ? 'bg-[#1677F2]'
                : goal.progressPercentage >= 40
                ? 'bg-[#0EA5E9]'
                : 'bg-[#6366F1]'
            }`}
            style={{ width: `${Math.min(100, goal.progressPercentage)}%` }}
          />
        </div>

        {/* Goal Description Note if available */}
        {goal.description && (
          <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed mb-4">
            {goal.description}
          </p>
        )}

        {/* Target Deadline & Pacing Info */}
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#EDF2F7] flex items-center justify-between gap-2 text-xs mb-4">
          <div className="flex items-center gap-1.5 text-[#4A5568]">
            <Calendar size={13} className="text-[#718096]" />
            <span>
              {goal.targetDate ? `Target: ${goal.targetDate}` : 'No deadline'}
            </span>
          </div>

          {goal.targetDate && (
            <div>
              {goal.isOverdue && !isCompleted ? (
                <span className="text-[11px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded-md flex items-center gap-1">
                  <AlertCircle size={11} /> Overdue
                </span>
              ) : goal.daysRemaining !== null ? (
                <span className="text-[11px] font-semibold text-[#1677F2] bg-[#EBF3FF] px-2 py-0.5 rounded-md">
                  {goal.daysRemaining > 0 ? `${goal.daysRemaining} days left` : 'Due today'}
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Required Monthly Contribution Estimate Pill */}
        {goal.projections.monthlyNeeded !== null && goal.projections.monthlyNeeded > 0 && !isCompleted && (
          <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mb-4">
            <Flame size={12} className="text-[#F59E0B]" />
            <span>
              Pacing:{' '}
              <strong className="text-[#203451]">
                ₹{goal.projections.monthlyNeeded.toLocaleString('en-IN')}/mo
              </strong>{' '}
              recommended
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-[#EDF2F7] flex items-center gap-2">
        <button
          type="button"
          onClick={() => onOpenContribute(goal)}
          disabled={isArchived}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
            isArchived
              ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              : 'bg-[#1677F2] hover:bg-[#1264CD] text-white active:scale-98'
          }`}
        >
          <Plus size={14} strokeWidth={2.4} />
          <span>Add Contribution</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenDetails(goal)}
          className="py-2 px-3 rounded-xl text-xs font-bold text-[#4A5568] hover:text-[#1677F2] hover:bg-[#F8FAFC] border border-[#DCE6F2] transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>Details</span>
        </button>
      </div>
    </div>
  );
};
