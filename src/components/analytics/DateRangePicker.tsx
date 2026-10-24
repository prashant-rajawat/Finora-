import React, { useState } from 'react';
import { AnalyticsPeriodPreset } from '../../types';
import { Calendar, ChevronRight, Filter } from 'lucide-react';

interface DateRangePickerProps {
  currentPreset: AnalyticsPeriodPreset;
  startDate: string;
  endDate: string;
  periodLabel: string;
  onSelectPreset: (preset: AnalyticsPeriodPreset) => void;
  onApplyCustomRange: (start: string, end: string) => void;
  isLoading?: boolean;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  currentPreset,
  startDate,
  endDate,
  periodLabel,
  onSelectPreset,
  onApplyCustomRange,
  isLoading = false,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(currentPreset === 'custom');
  const [customStart, setCustomStart] = useState(startDate || '2026-10-01');
  const [customEnd, setCustomEnd] = useState(endDate || '2026-10-31');
  const [validationError, setValidationError] = useState<string | null>(null);

  const presets: Array<{ key: AnalyticsPeriodPreset; label: string }> = [
    { key: 'this_month', label: 'This Month' },
    { key: 'last_month', label: 'Last Month' },
    { key: 'last_3_months', label: 'Last 3 Months' },
    { key: 'last_6_months', label: 'Last 6 Months' },
    { key: 'this_year', label: 'This Year' },
    { key: 'custom', label: 'Custom Range' },
  ];

  const handlePresetClick = (preset: AnalyticsPeriodPreset) => {
    if (preset === 'custom') {
      setIsCustomOpen(true);
      onSelectPreset('custom');
    } else {
      setIsCustomOpen(false);
      setValidationError(null);
      onSelectPreset(preset);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) {
      setValidationError('Please specify both start and end dates.');
      return;
    }
    if (customStart > customEnd) {
      setValidationError('Start date must be earlier than end date.');
      return;
    }
    setValidationError(null);
    onApplyCustomRange(customStart, customEnd);
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#DCE6F2] shadow-xs space-y-4">
      {/* Top Header & Preset Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EBF3FF] text-[#1677F2] flex items-center justify-center shrink-0">
            <Calendar size={18} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
              Selected Timeframe
            </div>
            <div className="text-sm font-bold text-[#203451] flex items-center gap-1.5">
              <span>{periodLabel}</span>
              {isLoading && (
                <span className="inline-block w-2 h-2 rounded-full bg-[#1677F2] animate-ping" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F5F8FC] rounded-xl border border-[#E2E8F0]">
          {presets.map((preset) => {
            const isActive = currentPreset === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => handlePresetClick(preset.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#1677F2] text-white shadow-xs'
                    : 'text-[#4A5568] hover:text-[#203451] hover:bg-white/80'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Expandable Custom Date Range Selector */}
      {isCustomOpen && (
        <form
          onSubmit={handleApplyCustom}
          className="pt-3 border-t border-[#EDF2F7] flex flex-wrap items-end gap-3 text-xs"
        >
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[#4A5568] font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#203451] focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[#4A5568] font-medium mb-1">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-[#203451] focus:outline-none focus:ring-2 focus:ring-[#1677F2]/20 focus:border-[#1677F2]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1677F2] hover:bg-[#1264CD] text-white font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Apply Range</span>
            <ChevronRight size={14} />
          </button>

          {validationError && (
            <p className="w-full text-xs text-[#EF5360] font-medium mt-1">
              {validationError}
            </p>
          )}
        </form>
      )}
    </div>
  );
};
