import React, { useState } from 'react';
import {
  User as UserIcon,
  Sliders,
  Bell,
  Lock,
  Shield,
  Loader2,
  Check,
  Camera,
} from 'lucide-react';
import { User } from '../types';

interface SettingsPageProps {
  user: User;
  onUpdateProfile: (data: { fullName: string; email?: string }) => Promise<void>;
}

type SettingsTab = 'profile' | 'preferences' | 'notifications' | 'security' | 'privacy';

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preference states
  const [currency, setCurrency] = useState('INR');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [monthlyDigest, setMonthlyDigest] = useState(true);

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: UserIcon },
    { id: 'preferences' as SettingsTab, label: 'Preferences', icon: Sliders },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsTab, label: 'Security', icon: Lock },
    { id: 'privacy' as SettingsTab, label: 'Privacy', icon: Shield },
  ];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaveSuccess(false);

    if (!fullName.trim()) {
      setError('Full name cannot be empty.');
      return;
    }

    try {
      setIsSaving(true);
      await onUpdateProfile({
        fullName: fullName.trim(),
        email: email.trim() !== user.email ? email.trim() : undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AK';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header matching Panel 11 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#203451]">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#718096] mt-0.5">
          Manage your account and preferences
        </p>
      </div>

      {/* Main Settings Grid matching Panel 11 layout */}
      <div className="grid md:grid-cols-12 gap-6 items-start">
        {/* Left Tabs List */}
        <div className="md:col-span-4 bg-white rounded-2xl p-2.5 border border-[#DCE6F2] shadow-xs space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
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

        {/* Right Tab Content */}
        <div className="md:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE6F2] shadow-xs">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">Profile Information</h2>
                <p className="text-xs text-[#718096] mt-0.5">
                  Update your personal information and contact details
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-[#EF5360] rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#16A66A] rounded-xl text-xs font-medium flex items-center gap-2">
                  <Check size={16} />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              {/* Profile Photo matching Panel 11 */}
              <div>
                <label className="block text-xs font-semibold text-[#718096] mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1677F2] to-[#34D399] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                    {initials}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newName = prompt('Enter initials or new name', fullName);
                      if (newName) setFullName(newName);
                    }}
                    className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-[#DCE6F2] rounded-xl text-xs font-semibold text-[#203451] transition-colors flex items-center gap-2"
                  >
                    <Camera size={14} className="text-[#718096]" />
                    <span>Change Photo</span>
                  </button>
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-[#1677F2] hover:bg-[#1260C4] text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">App Preferences</h2>
                <p className="text-xs text-[#718096] mt-0.5">Customize your currency and dashboard displays</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5">
                    Primary Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full max-w-xs px-3.5 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-xs text-[#203451] font-medium focus:bg-white focus:border-[#1677F2] focus:outline-none"
                  >
                    <option value="INR">₹ INR (Indian Rupee)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="GBP">£ GBP (British Pound)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#718096] mb-1.5">
                    Number Format
                  </label>
                  <div className="text-xs text-[#203451] font-mono bg-slate-50 p-3 rounded-xl border border-[#DCE6F2] max-w-xs">
                    Indian Format: ₹1,00,000.00
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">Notification Settings</h2>
                <p className="text-xs text-[#718096] mt-0.5">Choose how and when Finora sends alerts</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3.5 bg-[#F8FAFC] rounded-xl border border-[#DCE6F2] cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-[#203451]">Transaction Alerts</div>
                    <div className="text-[11px] text-[#718096]">Receive confirmation on new transactions</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="rounded border-[#DCE6F2] text-[#1677F2] focus:ring-[#1677F2]"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 bg-[#F8FAFC] rounded-xl border border-[#DCE6F2] cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-[#203451]">Monthly Summary Digest</div>
                    <div className="text-[11px] text-[#718096]">Get monthly income and expense highlights</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={monthlyDigest}
                    onChange={(e) => setMonthlyDigest(e.target.checked)}
                    className="rounded border-[#DCE6F2] text-[#1677F2] focus:ring-[#1677F2]"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">Security & Authentication</h2>
                <p className="text-xs text-[#718096] mt-0.5">Manage your password and active session</p>
              </div>

              <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#DCE6F2] space-y-3">
                <div className="text-xs font-semibold text-[#203451]">Session Information</div>
                <div className="text-xs text-[#718096]">
                  Signed in as <strong className="text-[#203451]">{user.email}</strong> via secure Bearer token authentication.
                </div>
                <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1.5">
                  <Check size={14} />
                  <span>Session Active & Protected</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold text-[#203451]">Privacy & Data Ownership</h2>
                <p className="text-xs text-[#718096] mt-0.5">Your personal data is isolated and encrypted</p>
              </div>

              <p className="text-xs text-[#718096] leading-relaxed">
                Finora never sells or shares your transactional data with third-party advertising networks. Your transactions are accessible only through authenticated API sessions belonging to your user ID.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
