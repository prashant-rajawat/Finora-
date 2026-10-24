import React, { useState, useEffect } from 'react';
import { GoalWithCalculations } from '../../types';
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
  Calendar,
  HelpCircle,
} from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    category: string;
    targetAmount: number;
    initialAmount?: number;
    targetDate?: string;
    description?: string;
    color?: string;
    icon?: string;
    frequencyPreference?: 'weekly' | 'bi-weekly' | 'monthly' | 'one-time';
  }) => Promise<void>;
  initialData?: GoalWithCalculations | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Emergency Fund');
  const [customCategory, setCustomCategory] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1677F2');
  const [icon, setIcon] = useState('Target');
  const [frequencyPreference, setFrequencyPreference] = useState<
    'weekly' | 'bi-weekly' | 'monthly' | 'one-time'
  >('monthly');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Emergency Fund',
    'Tech & Gadgets',
    'Travel',
    'Education',
    'Real Estate',
    'Vehicle',
    'Life Event',
    'Retirement',
    'Custom',
  ];

  const icons = [
    { name: 'Target', component: Target, label: 'Target' },
    { name: 'ShieldCheck', component: ShieldCheck, label: 'Safety' },
    { name: 'Laptop', component: Laptop, label: 'Tech' },
    { name: 'Plane', component: Plane, label: 'Travel' },
    { name: 'Home', component: Home, label: 'Home' },
    { name: 'Car', component: Car, label: 'Vehicle' },
    { name: 'GraduationCap', component: GraduationCap, label: 'Education' },
    { name: 'Heart', component: Heart, label: 'Health' },
    { name: 'Sparkles', component: Sparkles, label: 'Dream' },
  ];

  const colors = [
    '#1677F2', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EF5360', // Rose
    '#0EA5E9', // Sky
    '#6366F1', // Indigo
  ];

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      if (categories.includes(initialData.category)) {
        setCategory(initialData.category);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(initialData.category || '');
      }
      setTargetAmount(initialData.targetAmount?.toString() || '');
      setInitialAmount('');
      setTargetDate(initialData.targetDate || '');
      setDescription(initialData.description || '');
      setColor(initialData.color || '#1677F2');
      setIcon(initialData.icon || 'Target');
      setFrequencyPreference(initialData.frequencyPreference || 'monthly');
    } else {
      // Default empty form
      setName('');
      setCategory('Emergency Fund');
      setCustomCategory('');
      setTargetAmount('');
      setInitialAmount('');
      setTargetDate('');
      setDescription('');
      setColor('#1677F2');
      setIcon('Target');
      setFrequencyPreference('monthly');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = 'Goal name is required.';
    } else if (name.trim().length > 80) {
      errs.name = 'Goal name must be 80 characters or fewer.';
    }

    if (category === 'Custom' && !customCategory.trim()) {
      errs.category = 'Please enter your custom category name.';
    }

    const tAmt = Number(targetAmount);
    if (!targetAmount || isNaN(tAmt) || tAmt <= 0) {
      errs.targetAmount = 'Please enter a valid target amount greater than 0.';
    }

    if (!isEditing && initialAmount) {
      const iAmt = Number(initialAmount);
      if (isNaN(iAmt) || iAmt < 0) {
        errs.initialAmount = 'Starting amount must be 0 or a positive number.';
      }
    }

    if (targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      errs.targetDate = 'Please select a valid date.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const effectiveCategory = category === 'Custom' ? customCategory.trim() : category;

      await onSave({
        name: name.trim(),
        category: effectiveCategory,
        targetAmount: Number(targetAmount),
        initialAmount: !isEditing && initialAmount ? Number(initialAmount) : undefined,
        targetDate: targetDate || undefined,
        description: description.trim() || undefined,
        color,
        icon,
        frequencyPreference,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save goal:', err);
      setErrors({ form: err.message || 'Failed to save goal. Please check inputs.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-[#DCE6F2] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="px-6 py-5 border-b border-[#EDF2F7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
              style={{ backgroundColor: color }}
            >
              <Target size={20} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#203451]">
                {isEditing ? 'Edit Savings Goal' : 'Create New Savings Goal'}
              </h2>
              <p className="text-xs text-[#718096]">
                Define your financial milestone and target timeline
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {errors.form && (
            <div className="p-3 text-xs text-[#EF5360] bg-[#FEF2F2] border border-[#FECACA] rounded-xl font-medium">
              {errors.form}
            </div>
          )}

          {/* Goal Name */}
          <div>
            <label className="block text-xs font-bold text-[#203451] mb-1">
              Goal Name <span className="text-[#EF5360]">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Emergency Fund, New Laptop, Vacation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.name
                  ? 'border-[#EF5360] focus:ring-[#EF5360]/20'
                  : 'border-[#CBD5E1] focus:ring-[#1677F2]/20 focus:border-[#1677F2]'
              }`}
            />
            {errors.name && <p className="text-xs text-[#EF5360] mt-1 font-medium">{errors.name}</p>}
          </div>

          {/* Category & Custom Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#203451] mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {category === 'Custom' ? (
              <div>
                <label className="block text-xs font-bold text-[#203451] mb-1">
                  Custom Category Name <span className="text-[#EF5360]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wedding Fund"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.category
                      ? 'border-[#EF5360] focus:ring-[#EF5360]/20'
                      : 'border-[#CBD5E1] focus:ring-[#1677F2]/20 focus:border-[#1677F2]'
                  }`}
                />
                {errors.category && (
                  <p className="text-xs text-[#EF5360] mt-1 font-medium">{errors.category}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#203451] mb-1">
                  Contribution Pacing
                </label>
                <select
                  value={frequencyPreference}
                  onChange={(e) => setFrequencyPreference(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
                >
                  <option value="monthly">Monthly Pacing</option>
                  <option value="weekly">Weekly Pacing</option>
                  <option value="bi-weekly">Bi-Weekly Pacing</option>
                  <option value="one-time">One-Time Savings</option>
                </select>
              </div>
            )}
          </div>

          {/* Target Amount & Initial Starting Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#203451] mb-1">
                Target Amount (₹) <span className="text-[#EF5360]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#718096]">₹</span>
                <input
                  type="number"
                  placeholder="50000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  min="1"
                  step="any"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-sm text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 ${
                    errors.targetAmount
                      ? 'border-[#EF5360] focus:ring-[#EF5360]/20'
                      : 'border-[#CBD5E1] focus:ring-[#1677F2]/20 focus:border-[#1677F2]'
                  }`}
                />
              </div>
              {errors.targetAmount && (
                <p className="text-xs text-[#EF5360] mt-1 font-medium">{errors.targetAmount}</p>
              )}
            </div>

            {!isEditing ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#203451]">
                    Starting Amount (₹)
                  </label>
                  <span
                    title="If you already have money saved for this goal, enter it here. It will be recorded as your initial contribution."
                    className="cursor-help text-[#94A3B8]"
                  >
                    <HelpCircle size={13} />
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-[#718096]">₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    min="0"
                    step="any"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
                  />
                </div>
                {errors.initialAmount && (
                  <p className="text-xs text-[#EF5360] mt-1 font-medium">{errors.initialAmount}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#203451] mb-1">
                  Current Saved (₹)
                </label>
                <div className="px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] text-sm font-bold text-[#10B981]">
                  ₹{initialData?.savedAmount.toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-xs font-bold text-[#203451] mb-1">
              Target Deadline (Optional)
            </label>
            <div className="relative">
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
              />
            </div>
            {errors.targetDate && (
              <p className="text-xs text-[#EF5360] mt-1 font-medium">{errors.targetDate}</p>
            )}
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-bold text-[#203451] mb-2">
              Goal Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {icons.map((item) => {
                const IconComp = item.component;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1677F2] text-white ring-2 ring-[#1677F2]/30 scale-105'
                        : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                    }`}
                    title={item.label}
                  >
                    <IconComp size={18} strokeWidth={2.2} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-bold text-[#203451] mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2.5">
              {colors.map((c) => {
                const isSelected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                      isSelected ? 'ring-3 ring-offset-2 ring-[#1677F2] scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[#203451] mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              placeholder="Why are you saving for this goal? Add any useful details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-[#CBD5E1] text-sm text-[#203451] bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#EDF2F7] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs font-bold text-[#4A5568] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#1677F2] hover:bg-[#1264CD] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Goal' : 'Create Goal'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
