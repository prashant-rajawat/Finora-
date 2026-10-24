import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FinoraLogo } from '../components/FinoraLogo';
import { NavigationPage } from '../types';

interface RegisterPageProps {
  onNavigate: (page: NavigationPage) => void;
  onRegister: (params: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onRegister }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreed) {
      setError('You must accept the Terms of Service and Privacy Policy.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onRegister({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F7FF] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Container card matching Panel 2 */}
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#DCE6F2] shadow-xl p-8 sm:p-10 space-y-6">
        {/* Header with Finora Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <button
              onClick={() => onNavigate('landing')}
              className="focus:outline-none hover:opacity-90 transition-opacity"
            >
              <FinoraLogo size="lg" />
            </button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#203451]">
            Create Your Account
          </h1>
          <p className="text-xs text-[#718096] mt-1">
            Start your financial journey with Finora
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-[#EF5360] rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserIcon
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]"
              />
              <input
                type="text"
                placeholder="Ansh Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] placeholder-[#94A3B8] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]"
              />
              <input
                type="email"
                placeholder="ansh@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] placeholder-[#94A3B8] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] placeholder-[#94A3B8] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#203451] focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-[#718096] mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]"
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 bg-[#F8FAFC] border border-[#DCE6F2] rounded-xl text-sm text-[#203451] placeholder-[#94A3B8] focus:bg-white focus:border-[#1677F2] focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#203451] focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-[#DCE6F2] text-[#1677F2] focus:ring-[#1677F2] cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-[#718096] select-none leading-relaxed">
              I agree to the <span className="text-[#1677F2] font-semibold">Terms of Service</span> and{' '}
              <span className="text-[#1677F2] font-semibold">Privacy Policy</span>
            </label>
          </div>

          {/* Create Account button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#1677F2] hover:bg-[#1260C4] text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#718096]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#1677F2] font-bold hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
