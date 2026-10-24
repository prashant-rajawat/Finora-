import { User, Transaction, DashboardSummary } from './types';

const TOKEN_KEY = 'finora_auth_token';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
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
    authStorage.setToken(res.token);
    return { user: res.user, token: res.token };
  },

  async login(params: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await apiFetch<{ success: boolean; user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    authStorage.setToken(res.token);
    return { user: res.user, token: res.token };
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
    category?: string;
    type?: string;
    search?: string;
  }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.month) params.append('month', filters.month);
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
};
