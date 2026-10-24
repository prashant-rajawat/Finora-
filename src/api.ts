import {
  User,
  Transaction,
  DashboardSummary,
  Budget,
  BudgetType,
  BudgetWithCalculations,
  BudgetSummary,
  AnalyticsData,
  AnalyticsPeriodPreset,
  Goal,
  GoalContribution,
  GoalWithCalculations,
  GoalSummary,
  GoalFilterType,
  GoalSortType,
} from './types';

const TOKEN_KEY = 'finora_auth_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string, remember = true): void {
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.removeItem(TOKEN_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    }
  },
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  // Handle unauthorized
  if (response.status === 401) {
    authStorage.removeToken();
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(params: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await apiFetch<{ success: boolean; user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    authStorage.setToken(res.token, true);
    return { user: res.user, token: res.token };
  },

  async login(params: {
    email: string;
    password: string;
    rememberMe?: boolean;
  }): Promise<{ user: User; token: string }> {
    const res = await apiFetch<{ success: boolean; user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: params.email, password: params.password }),
    });
    authStorage.setToken(res.token, params.rememberMe ?? true);
    return { user: res.user, token: res.token };
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; resetCode?: string }> {
    return apiFetch<{ success: boolean; message: string; resetCode?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(params: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiFetch<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async getCurrentUser(): Promise<User | null> {
    const token = authStorage.getToken();
    if (!token) return null;
    try {
      const res = await apiFetch<{ success: boolean; user: User }>('/api/auth/me');
      return res.user;
    } catch {
      authStorage.removeToken();
      return null;
    }
  },

  async updateProfile(params: { fullName: string; email?: string }): Promise<User> {
    const res = await apiFetch<{ success: boolean; user: User; message: string }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(params),
    });
    return res.user;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      authStorage.removeToken();
    }
  },

  // Transactions
  async getTransactions(filters?: {
    month?: string;
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: string;
    search?: string;
  }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiFetch<{ success: boolean; transactions: Transaction[] }>(`/api/transactions${query}`);
    return res.transactions;
  },

  async createTransaction(data: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    description?: string;
    paymentMethod?: string;
    merchant?: string;
  }): Promise<Transaction> {
    const res = await apiFetch<{ success: boolean; transaction: Transaction; message: string }>(
      '/api/transactions',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return res.transaction;
  },

  async updateTransaction(
    id: string,
    data: {
      type?: 'income' | 'expense';
      amount?: number;
      category?: string;
      date?: string;
      description?: string;
      paymentMethod?: string;
      merchant?: string;
    }
  ): Promise<Transaction> {
    const res = await apiFetch<{ success: boolean; transaction: Transaction; message: string }>(
      `/api/transactions/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.transaction;
  },

  async deleteTransaction(id: string): Promise<boolean> {
    const res = await apiFetch<{ success: boolean; message: string }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  // Dashboard summary
  async getDashboardSummary(month = '2026-10'): Promise<DashboardSummary> {
    const res = await apiFetch<{ success: boolean; summary: DashboardSummary }>(
      `/api/transactions/summary?month=${encodeURIComponent(month)}`
    );
    return res.summary;
  },

  // CSV Export
  async downloadCsv(): Promise<void> {
    const token = authStorage.getToken();
    const res = await fetch('/api/transactions/export/csv', {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to generate export file.');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finora_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Budgets
  async getBudgets(period = '2026-10'): Promise<BudgetWithCalculations[]> {
    const res = await apiFetch<{ success: boolean; budgets: BudgetWithCalculations[] }>(
      `/api/budgets?month=${encodeURIComponent(period)}`
    );
    return res.budgets;
  },

  async getBudgetSummary(period = '2026-10'): Promise<BudgetSummary> {
    const res = await apiFetch<{ success: boolean; summary: BudgetSummary }>(
      `/api/budgets/summary?month=${encodeURIComponent(period)}`
    );
    return res.summary;
  },

  async getBudgetDetails(
    id: string
  ): Promise<{ budget: BudgetWithCalculations; transactions: Transaction[] }> {
    return apiFetch<{ success: boolean; budget: BudgetWithCalculations; transactions: Transaction[] }>(
      `/api/budgets/${id}`
    );
  },

  async createBudget(data: {
    name: string;
    type: BudgetType;
    category?: string;
    amount: number;
    period: string;
    notes?: string;
    alertThreshold?: number;
  }): Promise<Budget> {
    const res = await apiFetch<{ success: boolean; budget: Budget; message: string }>('/api/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.budget;
  },

  async updateBudget(
    id: string,
    data: {
      name?: string;
      type?: BudgetType;
      category?: string;
      amount?: number;
      period?: string;
      notes?: string;
      alertThreshold?: number;
    }
  ): Promise<Budget> {
    const res = await apiFetch<{ success: boolean; budget: Budget; message: string }>(
      `/api/budgets/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.budget;
  },

  async deleteBudget(id: string): Promise<boolean> {
    const res = await apiFetch<{ success: boolean; message: string }>(`/api/budgets/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  // Analytics
  async getAnalytics(params?: {
    period?: AnalyticsPeriodPreset;
    startDate?: string;
    endDate?: string;
  }): Promise<AnalyticsData> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiFetch<{ success: boolean; analytics: AnalyticsData }>(`/api/analytics${query}`);
    return res.analytics;
  },

  // Savings Goals
  async getGoals(params?: { filter?: GoalFilterType; sort?: GoalSortType }): Promise<GoalWithCalculations[]> {
    const searchParams = new URLSearchParams();
    if (params?.filter) searchParams.append('filter', params.filter);
    if (params?.sort) searchParams.append('sort', params.sort);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiFetch<{ success: boolean; goals: GoalWithCalculations[] }>(`/api/goals${query}`);
    return res.goals;
  },

  async getGoalById(id: string): Promise<GoalWithCalculations> {
    const res = await apiFetch<{ success: boolean; goal: GoalWithCalculations }>(`/api/goals/${id}`);
    return res.goal;
  },

  async getGoalSummary(): Promise<GoalSummary> {
    const res = await apiFetch<{ success: boolean; summary: GoalSummary }>('/api/goals/summary');
    return res.summary;
  },

  async createGoal(data: {
    name: string;
    category: string;
    targetAmount: number;
    initialAmount?: number;
    targetDate?: string;
    description?: string;
    color?: string;
    icon?: string;
    frequencyPreference?: 'weekly' | 'bi-weekly' | 'monthly' | 'one-time';
  }): Promise<GoalWithCalculations> {
    const res = await apiFetch<{ success: boolean; goal: GoalWithCalculations; message: string }>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.goal;
  },

  async updateGoal(
    id: string,
    data: {
      name?: string;
      category?: string;
      targetAmount?: number;
      targetDate?: string;
      description?: string;
      color?: string;
      icon?: string;
      status?: string;
      frequencyPreference?: 'weekly' | 'bi-weekly' | 'monthly' | 'one-time';
    }
  ): Promise<GoalWithCalculations> {
    const res = await apiFetch<{ success: boolean; goal: GoalWithCalculations; message: string }>(
      `/api/goals/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
    return res.goal;
  },

  async deleteGoal(id: string): Promise<boolean> {
    const res = await apiFetch<{ success: boolean; message: string }>(`/api/goals/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  },

  async addContribution(
    goalId: string,
    data: {
      amount: number;
      date?: string;
      note?: string;
      source?: string;
    }
  ): Promise<{ goal: GoalWithCalculations; contribution: GoalContribution }> {
    const res = await apiFetch<{
      success: boolean;
      goal: GoalWithCalculations;
      contribution: GoalContribution;
      message: string;
    }>(`/api/goals/${goalId}/contributions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return { goal: res.goal, contribution: res.contribution };
  },

  async deleteContribution(goalId: string, contributionId: string): Promise<GoalWithCalculations> {
    const res = await apiFetch<{ success: boolean; goal: GoalWithCalculations; message: string }>(
      `/api/goals/${goalId}/contributions/${contributionId}`,
      {
        method: 'DELETE',
      }
    );
    return res.goal;
  },

  // Reports
  async getReportSummary(params?: { period?: string; startDate?: string; endDate?: string }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiFetch<{ success: boolean; report: any }>(`/api/reports/summary${query}`);
    return res.report;
  },

  async downloadReportCsv(type: string, startDate?: string, endDate?: string, category?: string): Promise<void> {
    const token = authStorage.getToken();
    const params = new URLSearchParams();
    params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (category && category !== 'All Categories') params.append('category', category);

    const res = await fetch(`/api/reports/export/csv?${params.toString()}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to generate CSV report file.');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finora-${type}-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Settings
  async getSettingsPreferences(): Promise<any> {
    const res = await apiFetch<{ success: boolean; preferences: any }>('/api/settings/preferences');
    return res.preferences;
  },

  async updateSettingsPreferences(data: any): Promise<any> {
    const res = await apiFetch<{ success: boolean; preferences: any }>('/api/settings/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.preferences;
  },

  async getSecurityStatus(): Promise<any> {
    const res = await apiFetch<{ success: boolean; security: any }>('/api/settings/security');
    return res.security;
  },

  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<void> {
    await apiFetch('/api/settings/password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteAccount(): Promise<void> {
    await apiFetch('/api/settings/account', {
      method: 'DELETE',
    });
  },
};


