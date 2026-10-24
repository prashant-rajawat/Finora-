import React, { useState } from 'react';
import {
  ArrowRight,
  Play,
  Wallet,
  PieChart,
  BarChart3,
  Target,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ChevronDown,
  CheckCircle,
  IndianRupee,
  Layers,
} from 'lucide-react';
import { FinoraLogo } from '../components/FinoraLogo';
import { NavigationPage } from '../types';

interface LandingPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const faqs = [
    {
      q: 'How does Finora keep my financial data secure?',
      a: 'Finora stores all transactions and user data in isolated databases with bcrypt password hashing and cryptographic JSON Web Tokens. Your data is strictly private to your account.',
    },
    {
      q: 'Can I track both income and expenses in Indian Rupees (₹)?',
      a: 'Yes, Finora natively supports Indian Rupees (₹) with real-time balance calculations, category distributions, and monthly overview comparisons.',
    },
    {
      q: 'Can I export my financial data to CSV?',
      a: 'Absolutely! Finora includes an instant one-click CSV export so you can download all your transaction history anytime for accounting or tax purposes.',
    },
    {
      q: 'Is Finora free to use?',
      a: 'Yes, Finora Personal Finance Tracker is completely free for individual personal finance tracking.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F2F7FF] text-[#203451] flex flex-col">
      {/* Top Navigation Bar matching reference image */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#DCE6F2] px-6 lg:px-16 py-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="focus:outline-none"
        >
          <FinoraLogo size="md" />
        </button>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#718096]">
          <a href="#features" className="hover:text-[#1677F2] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#1677F2] transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-[#1677F2] transition-colors">Pricing</a>
          <a href="#faq" className="hover:text-[#1677F2] transition-colors">FAQ</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 text-xs font-semibold text-[#203451] hover:text-[#1677F2] transition-colors"
          >
            Login
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="px-4 py-2 bg-[#1677F2] hover:bg-[#1260C4] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Main Hero Section matching Panel 1 */}
      <main className="flex-1">
        <section className="px-6 lg:px-16 pt-12 pb-16 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5F0FF] border border-[#DCE6F2] text-[#1677F2] text-xs font-semibold">
                <span className="font-bold">+</span>
                <span>Personal Finance Tracker</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#203451] leading-[1.12]">
                Track Smarter <br />
                Plan Better <br />
                <span className="text-[#1677F2]">Grow Confidently</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#718096] max-w-xl leading-relaxed">
                Take control of your income, expenses, and future with Finora. A simple, powerful and beautiful finance tracker for a better tomorrow.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3.5 bg-[#1677F2] hover:bg-[#1260C4] text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => setShowDemoModal(true)}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-[#DCE6F2] text-[#203451] text-sm font-bold rounded-2xl shadow-xs transition-all flex items-center gap-2"
                >
                  <Play size={15} className="fill-[#1677F2] text-[#1677F2]" />
                  <span>Watch Demo</span>
                </button>
              </div>
            </div>

            {/* Right Column: Phone Mockup from Reference Design */}
            <div className="lg:col-span-5 flex justify-center relative">
              {/* Floating decorative badges matching reference */}
              <div className="absolute -top-4 left-4 z-10 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-[#DCE6F2] flex items-center gap-2.5 animate-bounce-subtle">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ₹
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[#203451]">+₹40,000</div>
                  <div className="text-[10px] text-[#718096]">Salary Credit</div>
                </div>
              </div>

              <div className="absolute -bottom-4 right-4 z-10 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-[#DCE6F2] flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1677F2] flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <div className="text-xs">
                  <div className="font-bold text-[#203451]">+14% Growth</div>
                  <div className="text-[10px] text-[#718096]">Savings Rate</div>
                </div>
              </div>

              {/* Smartphone Frame */}
              <div className="relative w-72 sm:w-80 bg-[#1E293B] rounded-[44px] p-3 shadow-2xl border-4 border-white ring-1 ring-slate-200">
                {/* Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-[#0F172A] rounded-full z-20"></div>

                {/* Inner Screen */}
                <div className="bg-[#F2F7FF] rounded-[36px] overflow-hidden pt-7 pb-4 px-3.5 space-y-3">
                  {/* App bar inside mockup */}
                  <div className="flex items-center justify-between px-1">
                    <FinoraLogo size="sm" />
                    <div className="w-7 h-7 rounded-full bg-[#1677F2] text-white text-[10px] font-bold flex items-center justify-center">
                      AK
                    </div>
                  </div>

                  {/* Balance Card inside mockup */}
                  <div className="bg-white rounded-2xl p-4 border border-[#DCE6F2] shadow-xs">
                    <span className="text-[10px] font-medium text-[#718096]">Total Balance</span>
                    <div className="text-xl font-extrabold text-[#203451] tabular-nums mt-0.5">
                      ₹16,550
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-[#16A66A] bg-emerald-50 px-2 py-0.5 rounded-full">
                      +12% this month
                    </span>
                  </div>

                  {/* Donut representation inside mockup */}
                  <div className="bg-white rounded-2xl p-3.5 border border-[#DCE6F2] shadow-xs flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-semibold text-[#718096]">Expenses</div>
                      <div className="text-base font-bold text-[#203451]">₹8,420</div>
                      <div className="text-[9px] text-[#1677F2] font-semibold">6 categories</div>
                    </div>
                    {/* Mini SVG Donut */}
                    <div className="relative w-14 h-14">
                      <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke="#E2E8F0" strokeWidth="4" />
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke="#1677F2" strokeWidth="4" strokeDasharray="30 100" />
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke="#EF5360" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-30" />
                        <circle cx="18" cy="18" r="14" fill="transparent" stroke="#F59E0B" strokeWidth="4" strokeDasharray="20 100" strokeDashoffset="-55" />
                      </svg>
                    </div>
                  </div>

                  {/* Mini recent transactions inside mockup */}
                  <div className="bg-white rounded-2xl p-3 border border-[#DCE6F2] shadow-xs space-y-2">
                    <div className="text-[10px] font-bold text-[#203451]">Recent</div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#203451] font-medium">Zomato</span>
                      <span className="text-[#EF5360] font-bold">-₹450</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#203451] font-medium">Salary</span>
                      <span className="text-[#16A66A] font-bold">+₹40,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Feature Badges at Bottom matching reference design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="bg-white rounded-2xl p-4 border border-[#DCE6F2] shadow-xs flex items-center gap-3 hover:border-[#1677F2]/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1677F2] flex items-center justify-center shrink-0">
                <Wallet size={20} />
              </div>
              <span className="text-xs font-bold text-[#203451]">
                Track Income & Expenses
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#DCE6F2] shadow-xs flex items-center gap-3 hover:border-emerald-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#16A66A] flex items-center justify-center shrink-0">
                <Layers size={20} />
              </div>
              <span className="text-xs font-bold text-[#203451]">
                Set Budgets
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#DCE6F2] shadow-xs flex items-center gap-3 hover:border-amber-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                <BarChart3 size={20} />
              </div>
              <span className="text-xs font-bold text-[#203451]">
                Visual Reports
              </span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#DCE6F2] shadow-xs flex items-center gap-3 hover:border-purple-500/50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Target size={20} />
              </div>
              <span className="text-xs font-bold text-[#203451]">
                Savings Goals
              </span>
            </div>
          </div>
        </section>

        {/* Features Highlight Section */}
        <section id="features" className="py-16 bg-white border-y border-[#DCE6F2]">
          <div className="max-w-7xl mx-auto px-6 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#1677F2] uppercase tracking-wider">Features</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#203451] mt-1">
                Everything you need to master your money
              </h2>
              <p className="text-xs sm:text-sm text-[#718096] mt-2">
                Finora provides intuitive instruments designed to turn financial tracking from a chore into an effortless daily habit.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#DCE6F2]">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#1677F2] flex items-center justify-center mb-4">
                  <IndianRupee size={22} />
                </div>
                <h3 className="font-bold text-[#203451] text-base mb-1.5">Accurate Rupee Ledger</h3>
                <p className="text-xs text-[#718096] leading-relaxed">
                  Log transactions with categories, dates, and notes. No approximations—every balance is calculated to the exact rupee.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#DCE6F2]">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#16A66A] flex items-center justify-center mb-4">
                  <PieChart size={22} />
                </div>
                <h3 className="font-bold text-[#203451] text-base mb-1.5">Interactive Category Charts</h3>
                <p className="text-xs text-[#718096] leading-relaxed">
                  Spot spending leaks immediately with clean donut charts and monthly income vs expense trend curves.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#F8FAFC] border border-[#DCE6F2]">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                  <ShieldCheck size={22} />
                </div>
                <h3 className="font-bold text-[#203451] text-base mb-1.5">Secure Account Isolation</h3>
                <p className="text-xs text-[#718096] leading-relaxed">
                  Every user has a dedicated, verified identity. We never expose your financials or rely on insecure browser mocks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 max-w-7xl mx-auto px-6 lg:px-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#1677F2] uppercase tracking-wider">How It Works</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#203451] mt-1">
              Start tracking in under 60 seconds
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1677F2] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                1
              </div>
              <h4 className="font-bold text-[#203451] text-base mb-1">Create an Account</h4>
              <p className="text-xs text-[#718096]">Register with your name, email, and password. No credit card required.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1677F2] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                2
              </div>
              <h4 className="font-bold text-[#203451] text-base mb-1">Log Transactions</h4>
              <p className="text-xs text-[#718096]">Add your salary, grocery bills, rent, and investments in one tap.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1677F2] text-white font-bold text-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                3
              </div>
              <h4 className="font-bold text-[#203451] text-base mb-1">Review Analytics</h4>
              <p className="text-xs text-[#718096]">Gain clear visibility over your monthly cash flow and grow your savings.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-white border-y border-[#DCE6F2]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <span className="text-xs font-bold text-[#1677F2] uppercase tracking-wider">Pricing</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#203451] mt-1 mb-2">
              Simple, transparent, 100% free
            </h2>
            <p className="text-xs sm:text-sm text-[#718096] mb-8">
              All personal finance features are included with no hidden fees or tier limits.
            </p>

            <div className="bg-[#F8FAFC] border border-[#DCE6F2] rounded-3xl p-8 max-w-md mx-auto shadow-sm">
              <h3 className="text-xl font-bold text-[#203451]">Personal Account</h3>
              <div className="my-4">
                <span className="text-4xl font-extrabold text-[#203451]">₹0</span>
                <span className="text-xs text-[#718096]"> / forever</span>
              </div>
              <ul className="text-xs text-[#718096] space-y-3 mb-6 text-left max-w-xs mx-auto">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#16A66A]" />
                  <span>Unlimited income & expense logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#16A66A]" />
                  <span>Category visual breakdowns & charts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#16A66A]" />
                  <span>One-click CSV data export</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#16A66A]" />
                  <span>Real-time balance summaries</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigate('register')}
                className="w-full py-3 bg-[#1677F2] hover:bg-[#1260C4] text-white font-bold rounded-xl text-xs transition-colors"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-[#1677F2] uppercase tracking-wider">FAQ</span>
            <h2 className="text-2xl font-extrabold text-[#203451] mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.q}
                className="bg-white border border-[#DCE6F2] rounded-2xl overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-[#203451]"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-[#718096] transition-transform ${
                      openFaq === idx ? 'rotate-180 text-[#1677F2]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-[#718096] leading-relaxed border-t border-[#F2F7FF] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#DCE6F2] py-8 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#718096]">
          <FinoraLogo size="sm" />
          <div>© 2026 Finora Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('login')} className="hover:text-[#1677F2]">Sign In</button>
            <button onClick={() => onNavigate('register')} className="hover:text-[#1677F2]">Create Account</button>
          </div>
        </div>
      </footer>

      {/* Watch Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#203451]/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#DCE6F2] shadow-2xl max-w-lg w-full p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1677F2] flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#203451] mb-2">Experience Finora in Action</h3>
            <p className="text-xs text-[#718096] mb-6 leading-relaxed">
              Explore the full interactive dashboard seeded with real demo transactions for Ansh Kumar. You can log in instantly or create your own brand new ledger.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDemoModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#203451] text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDemoModal(false);
                  onNavigate('login');
                }}
                className="flex-1 py-2.5 bg-[#1677F2] hover:bg-[#1260C4] text-white text-xs font-semibold rounded-xl"
              >
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
