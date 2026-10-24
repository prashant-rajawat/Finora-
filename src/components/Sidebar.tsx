import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CalendarClock,
  Wallet,
  BarChart3,
  Target,
  FileText,
  Settings,
  LogOut,
  X,
} from 'lucide-react';
import { FinoraLogo } from './FinoraLogo';
import { NavigationPage } from '../types';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard' as NavigationPage, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as NavigationPage, label: 'Transactions', icon: ArrowLeftRight },
    { id: 'recurring' as NavigationPage, label: 'Recurring', icon: CalendarClock },
    { id: 'budgets' as NavigationPage, label: 'Budgets', icon: Wallet },
    { id: 'analytics' as NavigationPage, label: 'Analytics', icon: BarChart3 },
    { id: 'goals' as NavigationPage, label: 'Goals', icon: Target },
    { id: 'reports' as NavigationPage, label: 'Reports', icon: FileText },
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings },
  ];

  const handleItemClick = (pageId: NavigationPage) => {
    onNavigate(pageId);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-[#DCE6F2] w-64 select-none">
      {/* Brand logo header */}
      <div className="p-6 flex items-center justify-between border-b border-[#F2F7FF]">
        <button
          onClick={() => handleItemClick('dashboard')}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity focus:outline-none"
        >
          <FinoraLogo size="md" />
        </button>
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="md:hidden text-[#718096] hover:text-[#203451] p-1.5 rounded-lg hover:bg-[#F2F7FF] transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#E5F0FF] text-[#1677F2] font-semibold shadow-xs'
                  : 'text-[#718096] hover:text-[#203451] hover:bg-[#F8FAFC]'
              }`}
            >
              <Icon
                size={18}
                className={isActive ? 'text-[#1677F2]' : 'text-[#718096]'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <span className="truncate">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1677F2]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom User / Quick Action */}
      <div className="p-4 border-t border-[#F2F7FF]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#718096] hover:text-[#EF5360] hover:bg-red-50/70 transition-colors"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen z-20">
        {content}
      </aside>

      {/* Mobile Sidebar Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#203451]/30 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 max-w-[80vw] h-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
