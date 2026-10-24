import React, { useState } from 'react';
import {
  Wallet,
  BarChart3,
  Target,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Bell,
  Download,
  Check,
} from 'lucide-react';
import { NavigationPage } from '../types';

interface ComingSoonViewProps {
  page: 'budgets' | 'analytics' | 'goals' | 'reports';
  onBackToDashboard: () => void;
  onExportCsv?: () => Promise<void>;
}

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  page,
  onBackToDashboard,
  onExportCsv,
}) => {
  const [notified, setNotified] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const config = {
    budgets: {
      title: 'Budgets',
      badge: 'Coming Soon',
      subtitle: 'Set spending limits, track your monthly progress and get smart alerts.',
      icon: Wallet,
      iconBg: 'from-amber-400/20 to-blue-500/20 text-amber-500',
      bullets: [
        'Create monthly budgets',
        'Track category-wise spending',
        'Get notified when you reach limits',
      ],
    },
    analytics: {
      title: 'Advanced Analytics',
      badge: 'Coming Soon',
      subtitle: 'Get detailed insights into your spending patterns and financial trends.',
      icon: BarChart3,
      iconBg: 'from-blue-400/20 to-indigo-500/20 text-[#1677F2]',
      bullets: [
        'Category-wise breakdown',
        'Monthly & yearly comparisons',
        'Visual charts and reports',
      ],
    },
    goals: {
      title: 'Savings Goals',
      badge: 'Coming Soon',
      subtitle: 'Set your financial goals and track your progress towards a better future.',
      icon: Target,
      iconBg: 'from-rose-400/20 to-pink-500/20 text-[#EF5360]',
      bullets: [
        'Create savings goals',
        'Track progress visually',
        'Stay motivated with milestones',
      ],
    },
    reports: {
      title: 'Reports & Export',
      badge: 'Coming Soon',
      subtitle: 'Download detailed reports of your financial data in multiple formats.',
      icon: FileText,
      iconBg: 'from-sky-400/20 to-blue-500/20 text-[#0EA5E9]',
      bullets: [
        'Export to PDF, CSV, Excel',
        'Custom date range reports',
        'Tax-friendly summaries',
      ],
    },
  }[page];

  const Icon = config.icon;

  const handleNotifyMe = () => {
    setNotified(true);
    setTimeout(() => setNotified(false), 4000);
  };

  const handleExport = async () => {
    if (!onExportCsv) return;
    try {
      setIsExporting(true);
      await onExportCsv();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col items-center text-center">
      {/* Visual illustration icon with subtle glow */}
      <div className="relative mb-6">
        <div
          className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${config.iconBg} flex items-center justify-center shadow-lg border border-white/60`}
        >
          <Icon size={48} strokeWidth={1.8} />
        </div>
      </div>

      {/* Title & Badge */}
      <h1 className="text-2xl md:text-3xl font-extrabold text-[#203451] tracking-tight mb-2">
        {config.title}
      </h1>
      <span className="inline-block text-xs font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60 mb-3">
        {config.badge}
      </span>

      {/* Subtitle */}
      <p className="text-sm text-[#718096] max-w-md mb-8">
        {config.subtitle}
      </p>

      {/* Bullets */}
      <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#DCE6F2] shadow-xs mb-8 text-left space-y-3.5">
        {config.bullets.map((b) => (
          <div key={b} className="flex items-center gap-3">
            <CheckCircle2 size={18} className="text-[#1677F2] shrink-0" strokeWidth={2.2} />
            <span className="text-xs font-medium text-[#203451]">{b}</span>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs justify-center">
        {page === 'reports' && onExportCsv && (
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Download size={15} />
            <span>{isExporting ? 'Exporting...' : 'Export CSV Now'}</span>
          </button>
        )}

        <button
          onClick={handleNotifyMe}
          disabled={notified}
          className={`w-full py-2.5 px-5 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 ${
            notified
              ? 'bg-emerald-500 text-white'
              : 'bg-[#1677F2] hover:bg-[#1260C4] text-white'
          }`}
        >
          {notified ? (
            <>
              <Check size={15} />
              <span>You're on the priority list!</span>
            </>
          ) : (
            <>
              <Bell size={15} />
              <span>Notify Me</span>
            </>
          )}
        </button>
      </div>

      {/* Back to Dashboard Link */}
      <button
        onClick={onBackToDashboard}
        className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1677F2] hover:underline cursor-pointer"
      >
        <ArrowLeft size={14} />
        <span>Back to Dashboard</span>
      </button>
    </div>
  );
};
