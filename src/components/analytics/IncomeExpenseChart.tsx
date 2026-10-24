import React, { useState } from 'react';
import { AnalyticsTimeSeriesPoint } from '../../types';
import { BarChart3, TrendingUp, TrendingDown, Eye } from 'lucide-react';

interface IncomeExpenseChartProps {
  timeSeries: AnalyticsTimeSeriesPoint[];
  isLoading?: boolean;
}

type SeriesMode = 'both' | 'income' | 'expenses';

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({
  timeSeries,
  isLoading = false,
}) => {
  const [mode, setMode] = useState<SeriesMode>('both');
  const [hoveredPoint, setHoveredPoint] = useState<AnalyticsTimeSeriesPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Compute maximum value for scaling
  const maxVal = Math.max(
    1000,
    ...timeSeries.map((p) => {
      if (mode === 'income') return p.income;
      if (mode === 'expenses') return p.expenses;
      return Math.max(p.income, p.expenses);
    })
  );

  // Round up max to nice round number
  const roundFactor = Math.pow(10, Math.floor(Math.log10(maxVal)));
  const yMax = Math.ceil(maxVal / roundFactor) * roundFactor;

  // Y-axis ticks (4 ticks)
  const yTicks = [0, yMax * 0.33, yMax * 0.66, yMax];

  // Helper to format currency on ticks
  const formatYTick = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${Math.round(val)}`;
  };

  const pointCount = timeSeries.length;
  const step = pointCount > 1 ? chartWidth / pointCount : chartWidth;
  const barWidth = Math.max(3, Math.min(18, (step * 0.7) / (mode === 'both' ? 2 : 1)));

  // Label downsampling for dense charts (e.g. 31 days)
  const labelInterval = pointCount > 20 ? 4 : pointCount > 10 ? 2 : 1;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
      {/* Chart Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#203451] text-base">Cash Flow Over Time</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#64748B]">
              {timeSeries.length} intervals
            </span>
          </div>
          <p className="text-xs text-[#718096] mt-0.5">
            Compare earnings and expenditures across selected intervals
          </p>
        </div>

        {/* Series Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F8FC] rounded-xl border border-[#E2E8F0] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('both')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'both'
                ? 'bg-white text-[#1677F2] shadow-xs'
                : 'text-[#64748B] hover:text-[#203451]'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setMode('income')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'income'
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#203451]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" />
            <span>Income</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('expenses')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              mode === 'expenses'
                ? 'bg-[#EF5360] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#203451]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#EF5360] inline-block" />
            <span>Expenses</span>
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-x-auto select-none">
        {timeSeries.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
            <BarChart3 className="text-[#94A3B8] mb-2" size={32} />
            <p className="text-sm font-semibold text-[#4A5568]">No transaction records found</p>
            <p className="text-xs text-[#718096]">
              Transactions in this date range will be visualized automatically.
            </p>
          </div>
        ) : (
          <div className="min-w-[620px]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto overflow-visible"
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Y-axis gridlines & labels */}
              {yTicks.map((tickVal, idx) => {
                const yPos = paddingTop + chartHeight - (tickVal / yMax) * chartHeight;
                return (
                  <g key={`ytick_${idx}`}>
                    <line
                      x1={paddingLeft}
                      y1={yPos}
                      x2={svgWidth - paddingRight}
                      y2={yPos}
                      stroke="#EDF2F7"
                      strokeWidth={1}
                      strokeDasharray={idx === 0 ? undefined : '3 3'}
                    />
                    <text
                      x={paddingLeft - 8}
                      y={yPos + 4}
                      textAnchor="end"
                      fill="#94A3B8"
                      fontSize="10"
                      fontWeight="500"
                    >
                      {formatYTick(tickVal)}
                    </text>
                  </g>
                );
              })}

              {/* Data Bars */}
              {timeSeries.map((point, index) => {
                const centerX = paddingLeft + (index + 0.5) * step;

                const incomeHeight = Math.max(0, (point.income / yMax) * chartHeight);
                const expenseHeight = Math.max(0, (point.expenses / yMax) * chartHeight);

                const incomeY = paddingTop + chartHeight - incomeHeight;
                const expenseY = paddingTop + chartHeight - expenseHeight;

                const isHovered = hoveredPoint?.key === point.key;

                return (
                  <g
                    key={point.key}
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={(e) => {
                      setHoveredPoint(point);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                    }}
                  >
                    {/* Hover column background overlay */}
                    {isHovered && (
                      <rect
                        x={paddingLeft + index * step}
                        y={paddingTop}
                        width={step}
                        height={chartHeight}
                        fill="#F1F5F9"
                        opacity={0.6}
                        rx={4}
                      />
                    )}

                    {/* Mode: Both (Two side-by-side bars) */}
                    {mode === 'both' && (
                      <>
                        {/* Income Bar (Green) */}
                        <rect
                          x={centerX - barWidth - 1}
                          y={incomeY}
                          width={barWidth}
                          height={incomeHeight}
                          fill="#10B981"
                          rx={3}
                          opacity={isHovered ? 1 : 0.85}
                        />
                        {/* Expense Bar (Rose) */}
                        <rect
                          x={centerX + 1}
                          y={expenseY}
                          width={barWidth}
                          height={expenseHeight}
                          fill="#EF5360"
                          rx={3}
                          opacity={isHovered ? 1 : 0.85}
                        />
                      </>
                    )}

                    {/* Mode: Income Only */}
                    {mode === 'income' && (
                      <rect
                        x={centerX - barWidth / 2}
                        y={incomeY}
                        width={barWidth}
                        height={incomeHeight}
                        fill="#10B981"
                        rx={3}
                        opacity={isHovered ? 1 : 0.85}
                      />
                    )}

                    {/* Mode: Expenses Only */}
                    {mode === 'expenses' && (
                      <rect
                        x={centerX - barWidth / 2}
                        y={expenseY}
                        width={barWidth}
                        height={expenseHeight}
                        fill="#EF5360"
                        rx={3}
                        opacity={isHovered ? 1 : 0.85}
                      />
                    )}

                    {/* X-axis Label */}
                    {(index % labelInterval === 0 || index === pointCount - 1) && (
                      <text
                        x={centerX}
                        y={paddingTop + chartHeight + 18}
                        textAnchor="middle"
                        fill={isHovered ? '#1677F2' : '#718096'}
                        fontSize="10"
                        fontWeight={isHovered ? 'bold' : 'normal'}
                      >
                        {point.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Hover Tooltip Box */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-[#1E293B] text-white px-3.5 py-2.5 rounded-xl shadow-lg text-xs pointer-events-none transition-all z-20 border border-slate-700">
            <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 mb-1.5 flex items-center justify-between gap-3">
              <span>{hoveredPoint.label} ({hoveredPoint.date})</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  Income:
                </span>
                <span className="font-bold text-[#34D399]">
                  ₹{hoveredPoint.income.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#EF5360]" />
                  Expenses:
                </span>
                <span className="font-bold text-[#F87171]">
                  ₹{hoveredPoint.expenses.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-700/60">
                <span className="text-slate-400">Net Flow:</span>
                <span
                  className={`font-bold ${
                    hoveredPoint.net >= 0 ? 'text-[#34D399]' : 'text-[#F87171]'
                  }`}
                >
                  {hoveredPoint.net >= 0 ? '+' : ''}₹{hoveredPoint.net.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart Footer Legend */}
      <div className="mt-4 pt-3 border-t border-[#EDF2F7] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#10B981]" />
            <span className="text-[#4A5568] font-medium">Income Inflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#EF5360]" />
            <span className="text-[#4A5568] font-medium">Expense Outflow</span>
          </div>
        </div>
        <div className="text-[#718096] text-[11px]">
          Hover over bars for exact amounts and period net cash flows
        </div>
      </div>
    </div>
  );
};
