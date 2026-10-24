import React, { useState, useEffect, useCallback } from 'react';
import { api, authStorage } from './api';
import {
  User,
  Transaction,
  DashboardSummary,
  NavigationPage,
  TransactionType,
} from './types';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TransactionModal } from './components/TransactionModal';
import { ComingSoonView } from './components/ComingSoonView';
import { ToastContainer, ToastMessage } from './components/Toast';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  FileText,
  Settings,
  Plus,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Transactions & Summary State
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Filters for transactions & dashboard
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('all');

  // Modal State
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Restore authenticated session on mount
  useEffect(() => {
    async function initAuth() {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setCurrentPage('dashboard');
        } else {
          // If no active session, start on landing
          setCurrentPage('landing');
        }
      } catch {
        setCurrentPage('landing');
      } finally {
        setIsAuthLoading(false);
      }
    }
    initAuth();
  }, []);

  // Fetch dashboard summary and transactions whenever user or month filter changes
  const loadFinancialData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setIsDataLoading(true);
      const [sumData, txData] = await Promise.all([
        api.getDashboardSummary(selectedMonth),
        api.getTransactions({
          month: selectedMonth,
          category: selectedCategory,
          type: selectedType,
          search: searchQuery,
        }),
      ]);
      setSummary(sumData);
      setTransactions(txData);
    } catch (err: any) {
      console.error('Data load error:', err);
    } finally {
      setIsDataLoading(false);
    }
  }, [currentUser, selectedMonth, selectedCategory, selectedType, searchQuery]);

  useEffect(() => {
    if (currentUser) {
      loadFinancialData();
    }
  }, [currentUser, loadFinancialData]);

  // Auth Handlers
  const handleLogin = async (params: { email: string; password: string }) => {
    const { user } = await api.login(params);
    setCurrentUser(user);
    setCurrentPage('dashboard');
    addToast('success', `Welcome back, ${user.fullName}!`);
  };

  const handleRegister = async (params: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const { user } = await api.register(params);
    setCurrentUser(user);
    setCurrentPage('dashboard');
    addToast('success', `Account created successfully! Welcome to Finora.`);
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setCurrentPage('login');
    addToast('info', 'You have been signed out.');
  };

  const handleUpdateProfile = async (data: { fullName: string; email?: string }) => {
    const updated = await api.updateProfile(data);
    setCurrentUser(updated);
    addToast('success', 'Profile updated successfully.');
  };

  // Transaction Actions
  const handleSaveTransaction = async (data: {
    id?: string;
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    description: string;
  }) => {
    if (data.id) {
      await api.updateTransaction(data.id, {
        type: data.type,
        amount: data.amount,
        category: data.category,
        date: data.date,
        description: data.description,
      });
      addToast('success', 'Transaction updated successfully.');
    } else {
      await api.createTransaction({
        type: data.type,
        amount: data.amount,
        category: data.category,
        date: data.date,
        description: data.description,
      });
      addToast('success', `${data.type === 'income' ? 'Income' : 'Expense'} recorded.`);
    }
    await loadFinancialData();
  };

  const handleDeleteTransaction = async (id: string) => {
    await api.deleteTransaction(id);
    addToast('info', 'Transaction removed.');
    await loadFinancialData();
  };

  const handleExportCsv = async () => {
    try {
      await api.downloadCsv();
      addToast('success', 'CSV export downloaded successfully.');
    } catch (err: any) {
      addToast('error', err.message || 'Failed to export CSV report.');
    }
  };

  // Global Navigation Guard
  const navigateTo = (page: NavigationPage) => {
    // If not authenticated and trying to access protected pages
    const protectedPages: NavigationPage[] = [
      'dashboard',
      'transactions',
      'budgets',
      'analytics',
      'goals',
      'reports',
      'settings',
    ];
    if (!currentUser && protectedPages.includes(page)) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initial Auth Loading Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F2F7FF] flex flex-col items-center justify-center p-4">
        <div className="flex items-center gap-1.5 mb-4">
          <span className="w-2 h-6 bg-[#1677F2]/60 rounded-full animate-pulse" />
          <span className="w-2 h-9 bg-[#1677F2] rounded-full animate-pulse delay-75" />
          <span className="w-2 h-7 bg-[#1677F2]/80 rounded-full animate-pulse delay-150" />
        </div>
        <span className="text-sm font-bold text-[#203451]">Finora</span>
        <span className="text-xs text-[#718096] mt-1">Initializing secure session...</span>
      </div>
    );
  }

  // Unauthenticated Views
  if (!currentUser) {
    if (currentPage === 'register') {
      return (
        <>
          <RegisterPage onNavigate={navigateTo} onRegister={handleRegister} />
          <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </>
      );
    }
    if (currentPage === 'login') {
      return (
        <>
          <LoginPage onNavigate={navigateTo} onLogin={handleLogin} />
          <ToastContainer toasts={toasts} onDismiss={removeToast} />
        </>
      );
    }
    return (
      <>
        <LandingPage onNavigate={navigateTo} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  // Authenticated Application Shell (Sidebar + Top Bar + Responsive Content)
  return (
    <div className="min-h-screen bg-[#F2F7FF] flex flex-col md:flex-row antialiased text-[#203451]">
      {/* Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onLogout={handleLogout}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        {/* Top Header */}
        <Header
          user={currentUser}
          onNavigate={navigateTo}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (currentPage !== 'transactions') {
              setCurrentPage('transactions');
            }
          }}
        />

        {/* View Switcher */}
        <main className="flex-1 overflow-x-hidden">
          {currentPage === 'dashboard' && (
            <DashboardPage
              user={currentUser}
              summary={summary}
              isLoading={isDataLoading}
              onNavigate={navigateTo}
              onOpenAddTransaction={() => {
                setEditingTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
          )}

          {currentPage === 'transactions' && (
            <TransactionsPage
              transactions={transactions}
              isLoading={isDataLoading}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              onOpenEditModal={(tx) => {
                setEditingTransaction(tx);
                setIsTransactionModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedType={selectedType}
              onSelectType={setSelectedType}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
          )}

          {currentPage === 'budgets' && (
            <ComingSoonView
              page="budgets"
              onBackToDashboard={() => navigateTo('dashboard')}
            />
          )}

          {currentPage === 'analytics' && (
            <ComingSoonView
              page="analytics"
              onBackToDashboard={() => navigateTo('dashboard')}
            />
          )}

          {currentPage === 'goals' && (
            <ComingSoonView
              page="goals"
              onBackToDashboard={() => navigateTo('dashboard')}
            />
          )}

          {currentPage === 'reports' && (
            <ComingSoonView
              page="reports"
              onBackToDashboard={() => navigateTo('dashboard')}
              onExportCsv={handleExportCsv}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              user={currentUser}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar matching Panel 12 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#DCE6F2] py-2 px-4 flex items-center justify-around shadow-lg">
        <button
          onClick={() => navigateTo('dashboard')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            currentPage === 'dashboard' ? 'text-[#1677F2]' : 'text-[#718096]'
          }`}
        >
          <LayoutDashboard size={18} strokeWidth={currentPage === 'dashboard' ? 2.5 : 1.8} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => navigateTo('transactions')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            currentPage === 'transactions' ? 'text-[#1677F2]' : 'text-[#718096]'
          }`}
        >
          <ArrowLeftRight size={18} strokeWidth={currentPage === 'transactions' ? 2.5 : 1.8} />
          <span>Transactions</span>
        </button>

        {/* Central Add Action Button on Mobile */}
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsTransactionModalOpen(true);
          }}
          className="w-10 h-10 -mt-4 rounded-full bg-[#1677F2] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
          aria-label="Add Transaction"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>

        <button
          onClick={() => navigateTo('budgets')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            currentPage === 'budgets' ? 'text-[#1677F2]' : 'text-[#718096]'
          }`}
        >
          <Wallet size={18} strokeWidth={currentPage === 'budgets' ? 2.5 : 1.8} />
          <span>Budgets</span>
        </button>

        <button
          onClick={() => navigateTo('settings')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${
            currentPage === 'settings' ? 'text-[#1677F2]' : 'text-[#718096]'
          }`}
        >
          <Settings size={18} strokeWidth={currentPage === 'settings' ? 2.5 : 1.8} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
