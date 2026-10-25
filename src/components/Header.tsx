import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Info, ChevronDown, Menu, User as UserIcon, Settings as SettingsIcon, LogOut, ExternalLink, ArrowRight } from 'lucide-react';
import { User, NavigationPage, BudgetAlert, AppNotification } from '../types';
import { api } from '../api';

interface HeaderProps {
  user: User;
  onNavigate: (page: NavigationPage) => void;
  onLogout: () => void;
  onOpenMobileMenu: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  budgetAlerts?: BudgetAlert[];
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onNavigate,
  onLogout,
  onOpenMobileMenu,
  searchQuery = '',
  onSearchChange,
  budgetAlerts = [],
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [realNotifications, setRealNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchHeaderNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setRealNotifications(res.notifications.slice(0, 5));
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error('Failed to fetch header notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHeaderNotifications();
    }
  }, [user]);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const handleMarkAllReadHeader = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setUnreadCount(0);
      setRealNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationItemClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      try {
        await api.markNotificationAsRead(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {
        // ignore
      }
    }
    setShowNotifications(false);
    if (notif.actionTarget) {
      onNavigate(notif.actionTarget);
    } else {
      onNavigate('notifications');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#DCE6F2] px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile menu toggle & Global search */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden text-[#718096] hover:text-[#203451] p-1.5 rounded-lg hover:bg-[#F2F7FF] focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="relative w-full">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096] pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search transactions, categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] placeholder-[#94A3B8] focus:outline-none focus:border-[#1677F2] focus:bg-white transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Right: Notification, Help, and User Profile */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Notifications Button */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                fetchHeaderNotifications();
              }}
              className="relative p-2 rounded-xl text-[#718096] hover:text-[#203451] hover:bg-[#F2F7FF] transition-colors focus:outline-none cursor-pointer"
              title="Notifications Center"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#EF5360] text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 md:w-88 bg-white border border-[#DCE6F2] rounded-2xl shadow-xl py-3 z-30">
                <div className="px-4 py-2 border-b border-[#F2F7FF] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#203451]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[#EF5360] text-[10px] font-bold">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllReadHeader}
                      className="text-xs text-[#1677F2] font-semibold cursor-pointer hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#F8FAFC] max-h-72 overflow-y-auto">
                  {realNotifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#718096]">
                      No notifications yet. You are all caught up!
                    </div>
                  ) : (
                    realNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationItemClick(notif)}
                        className={`p-3.5 transition-colors cursor-pointer text-left ${
                          !notif.isRead
                            ? 'bg-[#F2F7FF]/70 hover:bg-[#E5F0FF]/80 border-l-3 border-[#1677F2]'
                            : 'hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${!notif.isRead ? 'text-[#1677F2]' : 'text-[#203451]'}`}>
                            {notif.title}
                          </span>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1677F2] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-[#718096] line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 px-4 border-t border-[#F2F7FF] text-center">
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('notifications');
                    }}
                    className="w-full py-1.5 text-xs font-bold text-[#1677F2] hover:underline flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Notification Center</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Info Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-2 rounded-xl text-[#718096] hover:text-[#203451] hover:bg-[#F2F7FF] transition-colors focus:outline-none"
            title="Help & Shortcuts"
          >
            <Info size={19} />
          </button>

          {/* User Profile dropdown */}
          <div className="relative pl-1 md:pl-2" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-[#F2F7FF] transition-colors focus:outline-none group text-left"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1677F2] to-[#34D399] text-white font-semibold text-sm flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-semibold text-[#203451] leading-tight">
                  {user.fullName}
                </div>
                <div className="text-[11px] text-[#718096] leading-tight">
                  Personal Account
                </div>
              </div>
              <ChevronDown
                size={14}
                className="text-[#718096] group-hover:text-[#203451] transition-transform duration-200 hidden sm:block"
              />
            </button>

            {/* Profile Menu Dropdown */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#DCE6F2] rounded-2xl shadow-xl py-2 z-30">
                <div className="px-4 py-2 border-b border-[#F2F7FF] mb-1">
                  <p className="text-xs font-semibold text-[#203451] truncate">{user.fullName}</p>
                  <p className="text-[11px] text-[#718096] truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#203451] hover:bg-[#F2F7FF] transition-colors"
                >
                  <UserIcon size={15} className="text-[#718096]" />
                  <span>Profile & Preferences</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onNavigate('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#203451] hover:bg-[#F2F7FF] transition-colors"
                >
                  <SettingsIcon size={15} className="text-[#718096]" />
                  <span>Settings</span>
                </button>

                <div className="my-1 border-t border-[#F2F7FF]" />

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#EF5360] hover:bg-red-50/70 transition-colors"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203451]/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#DCE6F2] shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2F7FF] mb-4">
              <h3 className="font-bold text-[#203451] text-base">Finora Guide & Shortcuts</h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-[#718096] hover:text-[#203451] text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#718096]">
              <p>
                <strong className="text-[#203451]">Currency:</strong> All calculations are tracked accurately in Indian Rupees (₹) with real-time balance aggregation.
              </p>
              <p>
                <strong className="text-[#203451]">Transactions:</strong> Click "+ Add Transaction" on the Dashboard or Transactions tab to add income or expenses.
              </p>
              <p>
                <strong className="text-[#203451]">Data Isolation:</strong> All records are securely saved to your personal account on the backend.
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-[#1677F2] text-white rounded-xl text-xs font-semibold hover:bg-[#1260C4] transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
