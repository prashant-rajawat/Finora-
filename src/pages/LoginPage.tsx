import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { FinoraLogo } from '../components/FinoraLogo';
import { NavigationPage } from '../types';

interface LoginPageProps {
  onNavigate: (page: NavigationPage) => void;
  onLogin: (params: { email: string; password: string }) => Promise<void>;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('ansh@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onLogin({ email: email.trim(), password });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('ansh@example.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#F2F7FF] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Container card matching Panel 3 */}
      <div className="max-w-md w-full bg-white rounded-3xl border border-[#DCE6F2] shadow-xl p-8 sm:p-10 space-y-6">
        {/* Header */}
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
            Welcome Back
          </h1>
          <p className="text-xs text-[#718096] mt-1">
            Sign in to continue your financial journey
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-[#EF5360] rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[#718096]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#DCE6F2] text-[#1677F2] focus:ring-[#1677F2]"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setError('Password reset instructions will be sent to your email.')}
              className="text-[#1677F2] font-semibold hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#1677F2] hover:bg-[#1260C4] text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Or continue with */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#DCE6F2]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-[#94A3B8]">or continue with</span>
          </div>
        </div>

        {/* Social / Demo buttons matching Panel 3 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-[#DCE6F2] rounded-xl text-xs font-semibold text-[#203451] hover:bg-[#F8FAFC] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleQuickDemo}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-[#DCE6F2] rounded-xl text-xs font-semibold text-[#203451] hover:bg-[#F8FAFC] transition-colors"
          >
            <svg className="w-4 h-4 fill-current text-[#203451]" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>GitHub</span>
          </button>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#718096]">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-[#1677F2] font-bold hover:underline"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
