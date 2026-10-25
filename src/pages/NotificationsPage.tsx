import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  AppNotification,
  NotificationCategory,
  NavigationPage,
} from '../types';
import { api } from '../api';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  AlertTriangle,
  CalendarClock,
  Target,
  BarChart3,
  ShieldCheck,
  Info,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface NotificationsPageProps {
  user: User;
  onNavigate: (page: NavigationPage) => void;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Categories',
  budget_alert: 'Budget Alerts',
  recurring_reminder: 'Recurring Payments',
  recurring_failure: 'Processing Failures',
  goal_milestone: 'Savings Goal Milestones',
  goal_deadline: 'Goal Deadlines',
  weekly_summary: 'Weekly Digests',
  monthly_summary: 'Monthly Digests',
  security_alert: 'Security Updates',
  system_info: 'System & Platform',
};

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  user,
  onNavigate,
  onShowToast,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getNotifications({
        unreadOnly: filterTab === 'unread',
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        search: searchQuery || undefined,
      });

      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
      if (onUnreadCountChange) {
        onUnreadCountChange(res.unreadCount);
      }
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      onShowToast('error', err.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [filterTab, selectedCategory, searchQuery, onShowToast, onUnreadCountChange]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      const newUnread = Math.max(0, unreadCount - 1);
      setUnreadCount(newUnread);
      if (onUnreadCountChange) onUnreadCountChange(newUnread);
    } catch (err: any) {
      onShowToast('error', 'Failed to mark as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (onUnreadCountChange) onUnreadCountChange(0);
      onShowToast('success', 'All notifications marked as read.');
    } catch (err: any) {
      onShowToast('error', 'Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.deleteNotification(id);
      const targetNotif = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (targetNotif && !targetNotif.isRead) {
        const newUnread = Math.max(0, unreadCount - 1);
        setUnreadCount(newUnread);
        if (onUnreadCountChange) onUnreadCountChange(newUnread);
      }
      onShowToast('info', 'Notification dismissed.');
    } catch (err: any) {
      onShowToast('error', 'Failed to dismiss notification');
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.isRead) {
      handleMarkAsRead(notif.id);
    }

    if (notif.actionTarget) {
      onNavigate(notif.actionTarget);
    }
  };

  const handleTriggerDetection = async () => {
    try {
      const res = await api.triggerEventDetection();
      if (res.createdCount > 0) {
        onShowToast('success', `Detected ${res.createdCount} new financial alert(s).`);
      } else {
        onShowToast('info', 'All financial alerts are up to date.');
      }
      await loadNotifications();
    } catch (err: any) {
      onShowToast('error', 'Failed to trigger event detection');
    }
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'budget_alert':
        return <AlertTriangle size={18} className="text-amber-600" />;
      case 'recurring_reminder':
        return <CalendarClock size={18} className="text-[#1677F2]" />;
      case 'recurring_failure':
        return <AlertTriangle size={18} className="text-[#EF5360]" />;
      case 'goal_milestone':
      case 'goal_deadline':
        return <Target size={18} className="text-[#10B981]" />;
      case 'weekly_summary':
      case 'monthly_summary':
        return <BarChart3 size={18} className="text-purple-600" />;
      case 'security_alert':
        return <ShieldCheck size={18} className="text-[#1677F2]" />;
      case 'system_info':
      default:
        return <Info size={18} className="text-slate-600" />;
    }
  };

  const getCategoryColor = (category: NotificationCategory) => {
    switch (category) {
      case 'budget_alert':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'recurring_reminder':
        return 'bg-[#E5F0FF] text-[#1677F2] border-blue-200';
      case 'recurring_failure':
        return 'bg-rose-50 text-[#EF5360] border-rose-200';
      case 'goal_milestone':
      case 'goal_deadline':
        return 'bg-emerald-50 text-[#10B981] border-emerald-200';
      case 'weekly_summary':
      case 'monthly_summary':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'security_alert':
        return 'bg-blue-50 text-[#1677F2] border-blue-200';
      case 'system_info':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} mins ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#DCE6F2] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#E5F0FF] text-[#1677F2] relative">
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#EF5360] text-white font-bold text-[10px] ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#203451] flex items-center gap-2">
              <span>Notifications & Financial Alerts</span>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-[#EF5360] text-xs font-bold">
                  {unreadCount} unread
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-[#718096] mt-0.5">
              Stay updated with budget warnings, upcoming payment reminders, and milestone achievements.
            </p>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTriggerDetection}
            className="p-2.5 rounded-xl border border-[#DCE6F2] text-[#718096] hover:text-[#203451] hover:bg-[#F2F7FF] transition-colors cursor-pointer"
            title="Scan & Refresh Alerts"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F2F7FF] text-[#1677F2] hover:bg-[#E5F0FF] font-semibold text-xs transition-colors cursor-pointer"
            >
              <CheckCheck size={16} />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#DCE6F2] p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F2F7FF] pb-4">
          {/* Main Tabs */}
          <div className="flex items-center gap-1 bg-[#F2F7FF] p-1 rounded-xl w-fit">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white text-[#1677F2] shadow-xs'
                  : 'text-[#718096] hover:text-[#203451]'
              }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTab === 'unread'
                  ? 'bg-white text-[#1677F2] shadow-xs'
                  : 'text-[#718096] hover:text-[#203451]'
              }`}
            >
              <span>Unread Only</span>
              {unreadCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#EF5360]" />
              )}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]" size={15} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#DCE6F2] bg-[#F8FAFC] text-xs text-[#203451] placeholder-[#718096] focus:outline-none focus:border-[#1677F2] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-[#718096] font-medium flex items-center gap-1 mr-1 shrink-0">
            <Filter size={13} />
            <span>Category:</span>
          </span>

          {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all cursor-pointer ${
                selectedCategory === catKey
                  ? 'bg-[#1677F2] text-white font-semibold'
                  : 'bg-[#F8FAFC] text-[#718096] border border-[#DCE6F2] hover:bg-[#F2F7FF] hover:text-[#203451]'
              }`}
            >
              {catLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white p-12 rounded-2xl border border-[#DCE6F2] text-center text-[#718096]">
            <RefreshCw size={24} className="animate-spin text-[#1677F2] mx-auto mb-2" />
            <p className="text-sm font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#DCE6F2] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#E5F0FF] text-[#1677F2] flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-base font-bold text-[#203451]">All Caught Up!</h3>
            <p className="text-xs text-[#718096] max-w-sm mx-auto">
              {filterTab === 'unread'
                ? 'You have no unread notifications. Great job keeping your finances in order!'
                : 'No notifications found matching your current filter criteria.'}
            </p>
            {filterTab === 'unread' && (
              <button
                onClick={() => setFilterTab('all')}
                className="px-4 py-2 rounded-xl bg-[#F2F7FF] text-[#1677F2] text-xs font-semibold hover:bg-[#E5F0FF] transition-colors cursor-pointer"
              >
                View All Notifications
              </button>
            )}
          </div>
        ) : (
          notifications.map((notif) => {
            const icon = getCategoryIcon(notif.category);
            const badgeClass = getCategoryColor(notif.category);

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer group flex items-start gap-3 sm:gap-4 ${
                  !notif.isRead
                    ? 'bg-[#F2F7FF]/80 border-[#1677F2]/30 shadow-2xs hover:bg-[#E5F0FF]/60'
                    : 'bg-white border-[#DCE6F2] hover:bg-slate-50/80'
                }`}
              >
                {/* Category Icon Surface */}
                <div
                  className={`p-2.5 rounded-xl border shrink-0 flex items-center justify-center mt-0.5 ${badgeClass}`}
                >
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        className={`text-sm font-bold ${
                          !notif.isRead ? 'text-[#1677F2]' : 'text-[#203451]'
                        }`}
                      >
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#1677F2] shrink-0" title="Unread" />
                      )}
                    </div>

                    <span className="text-[11px] text-[#94A3B8] shrink-0 font-medium">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-[#718096] leading-relaxed mb-3">
                    {notif.message}
                  </p>

                  {/* Actions & Target link */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">
                      {CATEGORY_LABELS[notif.category] || notif.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Mark Read Toggle */}
                      {!notif.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notif.id, e)}
                          className="text-[11px] font-semibold text-[#1677F2] hover:underline cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}

                      {/* Action Target Navigation Button */}
                      {notif.actionTarget && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notif);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#1677F2] bg-[#E5F0FF] hover:bg-[#1677F2] hover:text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>
                            {notif.actionTarget === 'budgets'
                              ? 'View Budget'
                              : notif.actionTarget === 'goals'
                              ? 'Manage Goal'
                              : notif.actionTarget === 'recurring'
                              ? 'Inspect Schedule'
                              : notif.actionTarget === 'analytics'
                              ? 'View Analytics'
                              : notif.actionTarget === 'settings'
                              ? 'Settings'
                              : 'Open Target'}
                          </span>
                          <ChevronRight size={13} />
                        </button>
                      )}

                      {/* Dismiss */}
                      <button
                        onClick={(e) => handleDeleteNotification(notif.id, e)}
                        className="p-1 rounded-lg text-[#94A3B8] hover:text-[#EF5360] hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                        title="Dismiss Notification"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
