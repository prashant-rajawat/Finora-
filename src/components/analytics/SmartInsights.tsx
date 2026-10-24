import React from 'react';
import { SmartInsight, NavigationPage } from '../../types';
import { Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, Info, ArrowRight } from 'lucide-react';

interface SmartInsightsProps {
  insights: SmartInsight[];
  onNavigate?: (page: NavigationPage) => void;
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({ insights, onNavigate }) => {
  const getIcon = (type: SmartInsight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 size={16} className="text-[#10B981] shrink-0" />;
      case 'warning':
        return <AlertTriangle size={16} className="text-[#D97706] shrink-0" />;
      case 'danger':
        return <AlertOctagon size={16} className="text-[#EF5360] shrink-0" />;
      case 'info':
      default:
        return <Info size={16} className="text-[#1677F2] shrink-0" />;
    }
  };

  const getContainerStyle = (type: SmartInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'bg-[#ECFDF5]/60 border-[#A7F3D0] hover:border-[#6EE7B7]';
      case 'warning':
        return 'bg-[#FFFBEB]/60 border-[#FDE68A] hover:border-[#FCD34D]';
      case 'danger':
        return 'bg-[#FEF2F2]/60 border-[#FECACA] hover:border-[#FCA5A5]';
      case 'info':
      default:
        return 'bg-[#EFF6FF]/60 border-[#BFDBFE] hover:border-[#93C5FD]';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#DCE6F2] shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#203451] text-base">Smart Financial Insights</h3>
            <span className="w-6 h-6 rounded-lg bg-[#EBF3FF] text-[#1677F2] flex items-center justify-center">
              <Sparkles size={14} />
            </span>
          </div>
          <p className="text-xs text-[#718096]">
            Deterministic rule-based recommendations derived from your live ledger
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F8FAFC] text-[#64748B] border border-[#EDF2F7]">
          {insights.length} insight{insights.length !== 1 ? 's' : ''}
        </span>
      </div>

      {insights.length === 0 ? (
        <div className="p-6 text-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
          <Sparkles className="mx-auto text-[#94A3B8] mb-2" size={28} />
          <p className="text-sm font-semibold text-[#4A5568]">No active insights</p>
          <p className="text-xs text-[#718096]">
            Keep recording your daily transactions to generate automated patterns and warnings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${getContainerStyle(
                item.type
              )}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {getIcon(item.type)}
                    <h4 className="text-xs font-bold text-[#203451]">{item.title}</h4>
                  </div>
                  {item.metric && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white/90 text-[#203451] border border-black/5 shadow-2xs shrink-0">
                      {item.metric}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4A5568] leading-relaxed pl-6">
                  {item.description}
                </p>
              </div>

              {item.actionText && item.actionTarget && onNavigate && (
                <div className="pl-6 pt-1">
                  <button
                    type="button"
                    onClick={() => onNavigate(item.actionTarget!)}
                    className="text-xs font-bold text-[#1677F2] hover:text-[#1264CD] flex items-center gap-1 cursor-pointer"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
