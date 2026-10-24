import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User } from '../types';
import {
  User as UserIcon,
  Sliders,
  Bell,
  Lock,
  Shield,
  Loader2,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Trash2,
  LogOut,
  Globe,
  Calendar,
  DollarSign,
  Layout,
} from 'lucide-react';

interface SettingsPageProps {
  user: User;
  onUpdateProfile: (data: { fullName: string; email?: string }) => Promise<void>;
  onLogout: () => Promise<void>;
  onShowToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

type SettingsTab = 'profile' | 'preferences' | 'appearance' | 'notifications' | 'security' | 'privacy' | 'account';

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpdateProfile, onLogout, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);

  // Preferences State
  const [preferences, setPreferences] = useState({
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Asia/Kolkata',
    tableDensity: 'comfortable',
    emailAlerts: true,
    monthlyDigest: true,
    budgetThresholdAlerts: true,
  });

  // Security / Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<any>(null);

  // Account Deletion Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Load preferences and security status on mount
  useEffect(() => {
    async function loadSettingsData() {
      try {
        const [prefData, secData] = await Promise.all([
          api.getSettingsPreferences(),
          api.getSecurityStatus(),
        ]);
        if (prefData) {
          setPreferences({
            currency: prefData.currency || 'INR',
            dateFormat: prefData.dateFormat || 'DD/MM/YYYY',
            timezone: prefData.timezone || 'Asia/Kolkata',
            tableDensity: prefData.tableDensity || 'comfortable',
            emailAlerts: prefData.emailAlerts ?? true,
            monthlyDigest: prefData.monthlyDigest ?? true,
            budgetThresholdAlerts: prefData.budgetThresholdAlerts ?? true,
          });
        }
        if (secData) {
          setSecurityStatus(secData);
        }
      } catch (err) {
        console.error('Failed to load settings preferences:', err);
      }
    }
    loadSettingsData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      onShowToast('error', 'Full name cannot be empty.');
      return;
    }

    try {
      setIsSaving(true);
      await onUpdateProfile({
        fullName: fullName.trim(),
        email: email.trim() !== user.email ? email.trim() : undefined,
      });
      onShowToast('success', 'Profile updated successfully.');
    } catch (err: any) {
      onShowToast('error', err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await api.updateSettingsPreferences(preferences);
      setPreferences(updated);
      onShowToast('success', 'Preferences saved successfully.');
    } catch (err: any) {
      onShowToast('error', err.message || 'Failed to save preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      onShowToast('error', 'All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      onShowToast('error', 'New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      onShowToast('error', 'New password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSaving(true);
      await api.changePassword({ currentPassword, newPassword, confirmPassword });
      onShowToast('success', 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      onShowToast('error', err.message || 'Failed to change password.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      onShowToast('error', 'Please type DELETE to confirm account deletion.');
      return;
    }

    try {
      setIsSaving(true);
      await api.deleteAccount();
      onShowToast('info', 'Account successfully deleted.');
      await onLogout();
    } catch (err: any) {
      onShowToast('error', err.message || 'Failed to delete account.');
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: UserIcon },
    { id: 'preferences' as SettingsTab, label: 'Financial Preferences', icon: Sliders },
    { id: 'appearance' as SettingsTab, label: 'Appearance & Display', icon: Layout },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsTab, label: 'Security & Password', icon: Lock },
    { id: 'privacy' as SettingsTab, label: 'Privacy & Data', icon: Shield },
    { id: 'account' as SettingsTab, label: 'Account Management', icon: AlertTriangle },
  ];

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AK';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#203451]">
          Settings Center
        </h1>
        <p className="text-xs sm:text-sm text-[#718096] mt-0.5">
          Manage your account profile, financial preferences, and security settings.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Menu */}
        <div className="md:col-span-4 bg-white rounded-2xl p-2.5 border border-[#DCE6F2] shadow-xs space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#E5F0FF] text-[#1677F2]'
                    : 'text-[#718096] hover:text-[#203451] hover:bg-slate-50'
                }`}
              >
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE6F2] shadow-xs">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">Profile Information</h2>
                <p className="text-xs text-[#718096] mt-0.5">
                  Update your personal details and display name
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1677F2] to-[#34D399] text-white font-bold text-xl flex items-center justify-center shadow-sm">
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#203451]">{fullName}</div>
                  <div className="text-xs text-[#718096]">{email}</div>
                  <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                    <Check size={12} />
                    <span>Verified Account</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5">
                    Member Since
                  </label>
                  <input
                    type="text"
                    disabled
                    value={new Date(user.createdAt).toLocaleDateString()}
                    className="w-full px-4 py-2.5 bg-slate-100 border border-[#DCE6F2] rounded-xl text-sm text-[#718096] cursor-not-allowed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#1677F2] hover:bg-[#1260C4] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">Financial Preferences</h2>
                <p className="text-xs text-[#718096] mt-0.5">Configure your primary currency, date formats, and timezone</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-[#1677F2]" />
                    <span>Display Currency</span>
                  </label>
                  <select
                    value={preferences.currency}
                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] font-medium focus:bg-white focus:border-[#1677F2] focus:outline-none"
                  >
                    <option value="INR">₹ INR (Indian Rupee - Default)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="GBP">£ GBP (British Pound)</option>
                  </select>
                  <p className="text-[11px] text-[#718096] mt-1">
                    Applies currency formatting consistently across dashboard, budgets, reports, and analytics.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#1677F2]" />
                    <span>Date Format</span>
                  </label>
                  <select
                    value={preferences.dateFormat}
                    onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] font-medium focus:bg-white focus:border-[#1677F2] focus:outline-none"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (31/10/2026)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (10/31/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-10-31)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5 flex items-center gap-1.5">
                    <Globe size={14} className="text-[#1677F2]" />
                    <span>Timezone</span>
                  </label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] font-medium focus:bg-white focus:border-[#1677F2] focus:outline-none"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#1677F2] hover:bg-[#1260C4] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'appearance' && (
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">Appearance & Display</h2>
                <p className="text-xs text-[#718096] mt-0.5">Manage table spacing and layout density</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5">
                    Table & List Density
                  </label>
                  <select
                    value={preferences.tableDensity}
                    onChange={(e) => setPreferences({ ...preferences, tableDensity: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] font-medium focus:bg-white focus:border-[#1677F2] focus:outline-none"
                  >
                    <option value="comfortable">Comfortable (Spacious padding)</option>
                    <option value="compact">Compact (High data density)</option>
                  </select>
                </div>

                <div className="p-4 bg-[#F2F7FF] rounded-2xl border border-[#DCE6F2] space-y-2">
                  <div className="text-xs font-bold text-[#203451]">Theme & Design System</div>
                  <p className="text-xs text-[#718096] leading-relaxed">
                    Finora uses a verified light theme with white cards, pale-blue surfaces, and blue primary actions for optimal scanning clarity.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#1677F2] hover:bg-[#1260C4] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Save Appearance</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">Notification Preferences</h2>
                <p className="text-xs text-[#718096] mt-0.5">Control automated in-app alerts and summary digests</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#DCE6F2] cursor-pointer hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-[#203451]">Transaction Alerts</div>
                    <div className="text-[11px] text-[#718096]">Get notified when income or expenses are recorded</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailAlerts}
                    onChange={(e) => setPreferences({ ...preferences, emailAlerts: e.target.checked })}
                    className="w-4 h-4 rounded border-[#DCE6F2] text-[#1677F2] focus:ring-[#1677F2] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#DCE6F2] cursor-pointer hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-[#203451]">Monthly Summary Digest</div>
                    <div className="text-[11px] text-[#718096]">Receive a monthly cash flow and savings performance digest</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.monthlyDigest}
                    onChange={(e) => setPreferences({ ...preferences, monthlyDigest: e.target.checked })}
                    className="w-4 h-4 rounded border-[#DCE6F2] text-[#1677F2] focus:ring-[#1677F2] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-[#DCE6F2] cursor-pointer hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-xs font-bold text-[#203451]">Budget Threshold Alerts</div>
                    <div className="text-[11px] text-[#718096]">Instant warning when spending reaches 85%+ of allocated budgets</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.budgetThresholdAlerts}
                    onChange={(e) => setPreferences({ ...preferences, budgetThresholdAlerts: e.target.checked })}
                    className="w-4 h-4 rounded border-[#DCE6F2] text-[#1677F2] focus:ring-[#1677F2] cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#1677F2] hover:bg-[#1260C4] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Save Notification Preferences</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">Security & Password</h2>
                <p className="text-xs text-[#718096] mt-0.5">Secure your account with a strong password</p>
              </div>

              {securityStatus && (
                <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#DCE6F2] space-y-2">
                  <div className="text-xs font-semibold text-[#203451]">Active Session Details</div>
                  <div className="text-xs text-[#718096]">
                    Signed in as <strong className="text-[#203451]">{securityStatus.email}</strong> via secure JWT Bearer authentication.
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                    <Check size={14} />
                    <span>Email Verified & Session Active</span>
                  </div>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-2 border-t border-[#DCE6F2]">
                <h3 className="text-sm font-bold text-[#203451]">Change Password</h3>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3.5 top-3 text-[#718096] hover:text-[#203451]"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3 text-[#718096] hover:text-[#203451]"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] focus:bg-white focus:border-[#1677F2] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#1677F2] hover:bg-[#1260C4] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">Privacy & Data Ownership</h2>
                <p className="text-xs text-[#718096] mt-0.5">Your personal data privacy and export controls</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#DCE6F2] space-y-2">
                  <div className="text-xs font-bold text-[#203451]">Strict Data Isolation</div>
                  <p className="text-xs text-[#718096] leading-relaxed">
                    Finora strictly isolates user records by user ID. Your transactions, budgets, and savings goals are never exposed across user accounts or shared with third parties.
                  </p>
                </div>

                <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#DCE6F2] space-y-2">
                  <div className="text-xs font-bold text-[#203451]">Financial Data Portability</div>
                  <p className="text-xs text-[#718096] leading-relaxed">
                    You can generate and download complete financial statements and transaction CSV or PDF reports at any time from the Reports module.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">Account Management</h2>
                <p className="text-xs text-[#718096] mt-0.5">Sign out or permanently delete your account</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#DCE6F2] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#203451]">Sign Out</div>
                    <div className="text-[11px] text-[#718096]">End your current secure session on this device</div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#203451] font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>

                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-rose-700">Delete Account & Data</div>
                    <div className="text-[11px] text-rose-600">Permanently delete your profile, transactions, and goals</div>
                  </div>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Trash2 size={14} />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#DCE6F2] shadow-xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold text-[#203451]">Permanently Delete Account?</h3>
            </div>
            <p className="text-xs text-[#718096] leading-relaxed">
              This action is irreversible. All your transactions, budgets, savings goals, and preferences will be permanently wiped from the database.
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#718096] mb-1.5">
                Type <strong className="text-rose-600">DELETE</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm font-bold text-[#203451] focus:bg-white focus:border-rose-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteConfirmationText('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#203451] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmationText !== 'DELETE' || isSaving}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
