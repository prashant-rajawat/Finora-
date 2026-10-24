import React, { useState } from 'react';
import { CategoryExpense } from '../types';

interface CategoryDonutChartProps {
  categories: CategoryExpense[];
  totalExpenses: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  categories,
  totalExpenses,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Default color palette matching reference design
  const colors = [
    '#1677F2', // Primary Blue (Food 32%)
    '#14B8A6', // Teal (Transport 20%)
    '#F59E0B', // Amber (Shopping 15%)
    '#8B5CF6', // Purple (Bills 12%)
    '#EF5360', // Rose (Entertainment 8%)
    '#0EA5E9', // Sky (Others 13%)
  ];

  // If no transactions or empty, provide standard fallback categories matching reference
  const displayItems = categories.length > 0
    ? categories
    : [
        { name: 'Food', amount: 9104, percentage: 32 },
        { name: 'Transport', amount: 5690, percentage: 20 },
        { name: 'Shopping', amount: 4268, percentage: 15 },
        { name: 'Bills', amount: 3414, percentage: 12 },
        { name: 'Entertainment', amount: 2276, percentage: 8 },
        { name: 'Others', amount: 3698, percentage: 13 },
      ];

  const effectiveTotal = totalExpenses > 0
    ? totalExpenses
    : displayItems.reduce((acc, curr) => acc + curr.amount, 0);

  // SVG parameters
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeOffset = 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
      <div className="mb-3">
        <h3 className="font-bold text-[#203451] text-base">Expenses by Category</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* SVG Donut */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            {/* Background ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#F8FAFC"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {displayItems.map((item, index) => {
              const strokeDasharray = (item.percentage / 100) * circumference;
              const strokeDashoffset = -cumulativeOffset;
              cumulativeOffset += strokeDasharray;

              const isHovered = hoveredIndex === index;
              const color = colors[index % colors.length];

              return (
                <circle
                  key={item.name}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${strokeDasharray} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* Center text in Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none text-center px-4">
            <span className="text-xs font-semibold text-[#718096]">
              {hoveredIndex !== null ? displayItems[hoveredIndex].name : 'Total Expenses'}
            </span>
            <span className="text-base font-bold text-[#203451] tabular-nums leading-tight">
              ₹
              {(hoveredIndex !== null
                ? displayItems[hoveredIndex].amount
                : effectiveTotal
              ).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            {hoveredIndex !== null && (
              <span className="text-[11px] font-semibold text-[#1677F2]">
                {displayItems[hoveredIndex].percentage}%
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {displayItems.map((item, index) => {
            const color = colors[index % colors.length];
            const isHovered = hoveredIndex === index;
            return (
              <div
                key={item.name}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isHovered ? 'bg-[#F2F7FF]' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-[#203451] font-medium truncate">{item.name}</span>
                </div>
                <span className="text-[#718096] font-semibold ml-2 tabular-nums">
                  {item.percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
