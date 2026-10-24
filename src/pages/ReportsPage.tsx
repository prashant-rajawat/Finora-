import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import { User, AnalyticsData, BudgetWithCalculations, GoalWithCalculations, GoalSummary, Transaction } from '../types';
import {
  FileText,
  Download,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportsPageProps {
  user: User;
  onNavigate: (page: any) => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

type ReportType = 'transactions' | 'income_expense' | 'categories' | 'budgets' | 'goals';
type DatePreset = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year' | 'custom';

export function ReportsPage({ user, onNavigate, onShowToast }: ReportsPageProps) {
  const [reportType, setReportType] = useState<ReportType>('transactions');
  const [datePreset, setDatePreset] = useState<DatePreset>('this_month');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-31');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<{
    analytics: AnalyticsData | null;
    transactions: Transaction[];
    budgets: BudgetWithCalculations[];
    goalsSummary: GoalSummary | null;
    goals: GoalWithCalculations[];
  }>({
    analytics: null,
    transactions: [],
    budgets: [],
    goalsSummary: null,
    goals: [],
  });

  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Sync dates with preset
  useEffect(() => {
    if (datePreset === 'this_month') {
      setStartDate('2026-10-01');
      setEndDate('2026-10-31');
    } else if (datePreset === 'last_month') {
      setStartDate('2026-09-01');
      setEndDate('2026-09-30');
    } else if (datePreset === 'last_3_months') {
      setStartDate('2026-08-01');
      setEndDate('2026-10-31');
    } else if (datePreset === 'last_6_months') {
      setStartDate('2026-05-01');
      setEndDate('2026-10-31');
    } else if (datePreset === 'this_year') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  }, [datePreset]);

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getReportSummary({
        period: datePreset === 'custom' ? 'custom' : datePreset,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setReportData({
        analytics: data.analytics,
        transactions: data.transactions || [],
        budgets: data.budgets || [],
        goalsSummary: data.goalsSummary,
        goals: data.goals || [],
      });
    } catch (err: any) {
      console.error('Failed to load report data:', err);
      onShowToast('error', err.message || 'Failed to retrieve report data.');
    } finally {
      setIsLoading(false);
    }
  }, [datePreset, startDate, endDate, onShowToast]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleCsvExport = async () => {
    try {
      setIsExportingCsv(true);
      await api.downloadReportCsv(reportType, startDate, endDate, selectedCategory);
      onShowToast('success', 'CSV report downloaded successfully.');
    } catch (err: any) {
      onShowToast('error', err.message || 'Failed to export CSV report.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handlePdfExport = () => {
    try {
      setIsExportingPdf(true);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Brand Header
      doc.setFillColor(22, 119, 242); // #1677F2
      doc.rect(0, 0, pageWidth, 24, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('FINORA FINANCIAL REPORT', 14, 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated for: ${user.fullName} (${user.email})`, pageWidth - 14, 12, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - 14, 18, { align: 'right' });

      // Report Info
      doc.setTextColor(32, 52, 81); // #203451
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      const titleMap: Record<ReportType, string> = {
        transactions: 'Transaction Ledger & Activity Report',
        income_expense: 'Income & Expense Cash Flow Report',
        categories: 'Category Spending Analysis Report',
        budgets: 'Budget Performance & Utilization Report',
        goals: 'Savings Goals & Progress Report',
      };
      doc.text(titleMap[reportType], 14, 34);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Period: ${startDate} to ${endDate}`, 14, 42);

      let startY = 50;

      // Summary KPIs table
      if (reportData.analytics && reportData.analytics.summary) {
        const { totalIncome, totalExpenses, netCashFlow, savingsRate } = reportData.analytics.summary;
        (doc as any).autoTable({
          startY: 48,
          head: [['Total Income', 'Total Expenses', 'Net Cash Flow', 'Savings Rate']],
          body: [
            [
              `₹${totalIncome.toLocaleString('en-IN')}`,
              `₹${totalExpenses.toLocaleString('en-IN')}`,
              `₹${netCashFlow.toLocaleString('en-IN')}`,
              savingsRate !== null ? `${savingsRate}%` : 'N/A',
            ],
          ],
          theme: 'grid',
          headStyles: { fillColor: [22, 119, 242], textColor: [255, 255, 255], fontStyle: 'bold' },
          bodyStyles: { textColor: [32, 52, 81], fontStyle: 'bold' },
        });
        startY = (doc as any).lastAutoTable.finalY + 10;
      }

      // Detailed Table based on report type
      if (reportType === 'transactions') {
        const txs = reportData.transactions || [];
        const tableBody = txs.map((t: any) => [
          t.date,
          t.type.toUpperCase(),
          t.category,
          t.paymentMethod || 'UPI',
          `₹${t.amount.toLocaleString('en-IN')}`,
          t.description || '',
        ]);

        (doc as any).autoTable({
          startY,
          head: [['Date', 'Type', 'Category', 'Method', 'Amount (INR)', 'Description']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [32, 52, 81] },
        });
      } else if (reportType === 'income_expense' && reportData.analytics) {
        const cats = reportData.analytics.categoryBreakdown || [];
        const tableBody = cats.map((c: any) => [
          c.category,
          'Expense',
          `₹${c.amount.toLocaleString('en-IN')}`,
          `${c.percentage}%`,
          c.transactionCount,
        ]);

        (doc as any).autoTable({
          startY,
          head: [['Category', 'Type', 'Amount (INR)', '% of Total', 'Transactions']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [32, 52, 81] },
        });
      } else if (reportType === 'categories' && reportData.analytics) {
        const cats = reportData.analytics.categoryBreakdown || [];
        const tableBody = cats.map((c: any) => [
          c.category,
          `₹${c.amount.toLocaleString('en-IN')}`,
          `${c.percentage}%`,
          c.transactionCount,
        ]);

        (doc as any).autoTable({
          startY,
          head: [['Expense Category', 'Total Spent (INR)', 'Share (%)', 'Transactions']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [32, 52, 81] },
        });
      } else if (reportType === 'budgets') {
        const buds = reportData.budgets || [];
        const tableBody = buds.map((b) => [
          b.name,
          b.type,
          b.category || 'Overall',
          `₹${b.amount.toLocaleString('en-IN')}`,
          `₹${b.spent.toLocaleString('en-IN')}`,
          `₹${b.remaining.toLocaleString('en-IN')}`,
          `${b.percentage}%`,
          b.status.replace('_', ' ').toUpperCase(),
        ]);

        (doc as any).autoTable({
          startY,
          head: [['Budget Name', 'Scope', 'Category', 'Allocated', 'Spent', 'Remaining', 'Used', 'Status']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [32, 52, 81] },
        });
      } else if (reportType === 'goals') {
        const goals = reportData.goals || [];
        const tableBody = goals.map((g) => [
          g.name,
          g.category,
          `₹${g.targetAmount.toLocaleString('en-IN')}`,
          `₹${g.savedAmount.toLocaleString('en-IN')}`,
          `₹${g.remainingAmount.toLocaleString('en-IN')}`,
          `${g.progressPercentage}%`,
          g.status.toUpperCase(),
          g.targetDate || 'No deadline',
        ]);

        (doc as any).autoTable({
          startY,
          head: [['Goal Name', 'Category', 'Target', 'Saved', 'Remaining', 'Progress', 'Status', 'Deadline']],
          body: tableBody,
          theme: 'striped',
          headStyles: { fillColor: [32, 52, 81] },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(113, 128, 150);
        doc.text(
          `Generated by Finora Personal Finance Tracker — Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      doc.save(`finora-${reportType}-report-${startDate}.pdf`);
      onShowToast('success', 'PDF report downloaded successfully.');
    } catch (err: any) {
      console.error('PDF export error:', err);
      onShowToast('error', err.message || 'Failed to generate PDF report.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const analytics = reportData.analytics;
  const summary = analytics?.summary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#DCE6F2] shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#203451] flex items-center gap-2.5">
            <FileText className="text-[#1677F2]" size={28} />
            Financial Reports
          </h1>
          <p className="text-sm text-[#718096] mt-1">
            Understand your finances with clear, data-driven reports and secure exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCsvExport}
            disabled={isExportingCsv}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F2F7FF] text-[#1677F2] font-semibold text-sm rounded-xl border border-[#DCE6F2] hover:bg-[#E2EEFF] transition-colors cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            <span>{isExportingCsv ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handlePdfExport}
            disabled={isExportingPdf}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1677F2] text-white font-semibold text-sm rounded-xl hover:bg-[#125ec2] shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Download size={16} />
            <span>{isExportingPdf ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-sm">
        {/* Report Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#718096] mb-1.5 uppercase tracking-wider">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="w-full px-3.5 py-2.5 bg-[#F2F7FF] border border-[#DCE6F2] rounded-xl text-sm font-medium text-[#203451] focus:outline-none focus:ring-2 focus:ring-[#1677F2]/30"
          >
            <option value="transactions">Transaction Activity Report</option>
            <option value="income_expense">Income & Expense Cash Flow</option>
            <option value="categories">Category Spending Report</option>
            <option value="budgets">Budget Performance Report</option>
            <option value="goals">Savings Goals Report</option>
          </select>
        </div>

        {/* Date Preset Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#718096] mb-1.5 uppercase tracking-wider">
            Reporting Period
          </label>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value as DatePreset)}
            className="w-full px-3.5 py-2.5 bg-[#F2F7FF] border border-[#DCE6F2] rounded-xl text-sm font-medium text-[#203451] focus:outline-none focus:ring-2 focus:ring-[#1677F2]/30"
          >
            <option value="this_month">This Month (October 2026)</option>
            <option value="last_month">Last Month (September 2026)</option>
            <option value="last_3_months">Last 3 Months (Aug - Oct)</option>
            <option value="last_6_months">Last 6 Months (May - Oct)</option>
            <option value="this_year">This Year (2026)</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>

        {/* Custom Dates or Quick Search */}
        {datePreset === 'custom' ? (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#718096] mb-1.5 uppercase tracking-wider">Start</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F2F7FF] border border-[#DCE6F2] rounded-xl text-xs font-medium text-[#203451]"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-[#718096] mb-1.5 uppercase tracking-wider">End</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#F2F7FF] border border-[#DCE6F2] rounded-xl text-xs font-medium text-[#203451]"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5 uppercase tracking-wider">
              Search Filter
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-3 text-[#718096]" size={16} />
              <input
                type="text"
                placeholder="Filter description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F2F7FF] border border-[#DCE6F2] rounded-xl text-sm font-medium text-[#203451] focus:outline-none focus:ring-2 focus:ring-[#1677F2]/30"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Total Income</span>
              <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <ArrowUpRight size={18} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#203451] mt-2">
              ₹{summary.totalIncome.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">Verified inflows</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Total Expenses</span>
              <span className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <ArrowDownRight size={18} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#203451] mt-2">
              ₹{summary.totalExpenses.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-rose-600 font-medium mt-1">Verified outflows</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Net Cash Flow</span>
              <span className="p-2 bg-[#F2F7FF] text-[#1677F2] rounded-xl">
                <Wallet size={18} />
              </span>
            </div>
            <div className={`text-2xl font-bold mt-2 ${summary.netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {summary.netCashFlow >= 0 ? '+' : ''}₹{summary.netCashFlow.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-[#718096] font-medium mt-1">Income minus expenses</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#DCE6F2] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">Savings Rate</span>
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <TrendingUp size={18} />
              </span>
            </div>
            <div className="text-2xl font-bold text-[#203451] mt-2">
              {summary.savingsRate !== null ? `${summary.savingsRate}%` : 'N/A'}
            </div>
            <p className="text-xs text-[#718096] font-medium mt-1">Percentage of income saved</p>
          </div>
        </div>
      )}

      {/* Main Report Preview Content */}
      <div className="bg-white rounded-2xl border border-[#DCE6F2] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#DCE6F2] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#203451] capitalize">
              {reportType.replace('_', ' ')} Report Preview
            </h2>
            <p className="text-xs text-[#718096] mt-0.5">
              Showing verified dataset for period: {startDate} to {endDate}
            </p>
          </div>
          <span className="px-3 py-1 bg-[#F2F7FF] text-[#1677F2] text-xs font-semibold rounded-full border border-[#DCE6F2]">
            Live Authorized Data
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[#718096] animate-pulse">
            Generating financial report preview...
          </div>
        ) : reportType === 'transactions' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2F7FF] text-[#718096] text-xs uppercase tracking-wider border-b border-[#DCE6F2]">
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Description</th>
                  <th className="py-3 px-6 font-semibold">Category</th>
                  <th className="py-3 px-6 font-semibold">Type</th>
                  <th className="py-3 px-6 font-semibold">Payment</th>
                  <th className="py-3 px-6 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6F2] text-sm text-[#203451]">
                {(reportData.transactions || [])
                  .filter((t: any) => !searchQuery || t.description.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 px-6 text-xs text-[#718096] font-medium">{tx.date}</td>
                      <td className="py-4 px-6 font-semibold">{tx.description || 'Untitled Transaction'}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-[#F2F7FF] text-[#1677F2] text-xs font-medium rounded-lg">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-[#718096]">{tx.paymentMethod || 'UPI'}</td>
                      <td className={`py-4 px-6 text-right font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-[#203451]'}`}>
                        {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : reportType === 'income_expense' || reportType === 'categories' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2F7FF] text-[#718096] text-xs uppercase tracking-wider border-b border-[#DCE6F2]">
                  <th className="py-3 px-6 font-semibold">Category</th>
                  <th className="py-3 px-6 font-semibold">Transactions Count</th>
                  <th className="py-3 px-6 font-semibold">Share of Expenses</th>
                  <th className="py-3 px-6 font-semibold text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6F2] text-sm text-[#203451]">
                {(analytics?.categoryBreakdown || []).map((cat: any, idx: number) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC]">
                    <td className="py-4 px-6 font-semibold flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#1677F2' }} />
                      {cat.category}
                    </td>
                    <td className="py-4 px-6 text-[#718096]">{cat.transactionCount}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#DCE6F2] h-2 rounded-full overflow-hidden max-w-[120px]">
                          <div className="bg-[#1677F2] h-full rounded-full" style={{ width: `${cat.percentage}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[#718096]">{cat.percentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-[#203451]">
                      ₹{cat.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : reportType === 'budgets' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2F7FF] text-[#718096] text-xs uppercase tracking-wider border-b border-[#DCE6F2]">
                  <th className="py-3 px-6 font-semibold">Budget Name</th>
                  <th className="py-3 px-6 font-semibold">Scope</th>
                  <th className="py-3 px-6 font-semibold">Allocated</th>
                  <th className="py-3 px-6 font-semibold">Spent</th>
                  <th className="py-3 px-6 font-semibold">Remaining</th>
                  <th className="py-3 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6F2] text-sm text-[#203451]">
                {reportData.budgets.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-4 px-6 font-semibold">{b.name}</td>
                    <td className="py-4 px-6 text-xs text-[#718096] capitalize">{b.type} ({b.category || 'All'})</td>
                    <td className="py-4 px-6 font-bold">₹{b.amount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-rose-600 font-medium">₹{b.spent.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-emerald-600 font-medium">₹{b.remaining.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase ${
                        b.status === 'over_budget' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2F7FF] text-[#718096] text-xs uppercase tracking-wider border-b border-[#DCE6F2]">
                  <th className="py-3 px-6 font-semibold">Goal Name</th>
                  <th className="py-3 px-6 font-semibold">Category</th>
                  <th className="py-3 px-6 font-semibold">Target</th>
                  <th className="py-3 px-6 font-semibold">Saved</th>
                  <th className="py-3 px-6 font-semibold">Progress</th>
                  <th className="py-3 px-6 font-semibold">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE6F2] text-sm text-[#203451]">
                {reportData.goals.map((g) => (
                  <tr key={g.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-4 px-6 font-semibold flex items-center gap-2">
                      <ShieldCheck size={16} className="text-[#1677F2]" />
                      {g.name}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#718096]">{g.category}</td>
                    <td className="py-4 px-6 font-bold">₹{g.targetAmount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6 text-emerald-600 font-medium">₹{g.savedAmount.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#DCE6F2] h-2 rounded-full overflow-hidden max-w-[100px]">
                          <div className="bg-[#1677F2] h-full rounded-full" style={{ width: `${Math.min(100, g.progressPercentage)}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[#718096]">{g.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#718096]">{g.targetDate || 'No deadline'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
