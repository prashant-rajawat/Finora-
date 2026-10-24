import React, { useState } from 'react';
import { AnalyticsCategoryItem } from '../../types';
import { PieChart, ArrowRight, Tag } from 'lucide-react';

interface CategoryBreakdownProps {
  categories: AnalyticsCategoryItem[];
  totalExpenses: number;
  onDrillDownCategory?: (category: string) => void;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categories,
  totalExpenses,
  onDrillDownCategory,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG parameters
  const size = 190;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  const activeCategory = hoveredIndex !== null ? categories[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-[#203451] text-base">Expense Category Breakdown</h3>
          <p className="text-xs text-[#718096]">
            Distribution of all expenditures across spending categories
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#718096]">Total Spending</span>
          <div className="text-sm font-extrabold text-[#203451]">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
          <PieChart className="text-[#94A3B8] mb-2" size={32} />
          <p className="text-sm font-semibold text-[#4A5568]">No expenses recorded</p>
          <p className="text-xs text-[#718096]">
            Record your expenses to view your category spending distribution.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart visualization */}
          <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                {/* Background Ring */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth={strokeWidth}
                />

                {/* Slices */}
                {categories.map((item, index) => {
                  const strokeDasharray = (item.percentage / 100) * circumference;
                  const strokeDashoffset = -cumulativeOffset;
                  cumulativeOffset += strokeDasharray;

                  const isHovered = hoveredIndex === index;

                  return (
                    <circle
                      key={item.category}
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={`${strokeDasharray} ${circumference}`}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => onDrillDownCategory && onDrillDownCategory(item.category)}
                    />
                  );
                })}
              </svg>

              {/* Center Overlay Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center px-4">
                {activeCategory ? (
                  <>
                    <span className="text-[11px] font-bold text-[#718096] truncate max-w-[120px]">
                      {activeCategory.category}
                    </span>
                    <span className="text-base font-extrabold text-[#203451] tracking-tight">
                      ₹{activeCategory.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-semibold text-[#1677F2]">
                      {activeCategory.percentage}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider">
                      Categories
                    </span>
                    <span className="text-base font-extrabold text-[#203451]">
                      {categories.length}
                    </span>
                    <span className="text-[10px] text-[#94A3B8]">Active</span>
                  </>
                )}
              </div>
            </div>
            <p className="text-[11px] text-[#718096] mt-2">Hover over arcs for category metrics</p>
          </div>

          {/* Ranked Category List */}
          <div className="md:col-span-7 space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {categories.map((item, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <div
                  key={item.category}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onDrillDownCategory && onDrillDownCategory(item.category)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isHovered
                      ? 'bg-[#F8FAFC] border-[#1677F2] shadow-xs'
                      : 'bg-white border-[#EDF2F7] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#203451] truncate flex items-center gap-1.5">
                        <span>{item.category}</span>
                        <span className="text-[10px] text-[#94A3B8] font-normal">
                          ({item.transactionCount} tx{item.transactionCount !== 1 ? 's' : ''})
                        </span>
                      </div>
                      {/* Mini Progress Bar */}
                      <div className="w-24 sm:w-32 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, item.percentage)}%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <div className="text-xs font-extrabold text-[#203451]">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] font-semibold text-[#64748B]">
                        {item.percentage}%
                      </div>
                    </div>
                    {onDrillDownCategory && (
                      <span className="text-[#94A3B8] hover:text-[#1677F2]">
                        <ArrowRight size={14} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
