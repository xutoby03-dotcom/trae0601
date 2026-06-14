import { create } from 'zustand';
import type {
  Register,
  Handover,
  Transaction,
  OverviewStats,
  StatsResponse,
} from '../../shared/types';

interface AppState {
  registers: Register[];
  handovers: Handover[];
  transactions: Transaction[];
  overview: OverviewStats | null;
  statistics: StatsResponse | null;
  loading: boolean;
  error: string | null;

  fetchRegisters: () => Promise<void>;
  fetchHandovers: (params?: Record<string, string>) => Promise<void>;
  fetchTransactions: (params?: Record<string, string>) => Promise<void>;
  fetchOverview: (params?: Record<string, string>) => Promise<void>;
  fetchStatistics: (params?: Record<string, string>) => Promise<void>;

  createRegister: (data: Partial<Register>) => Promise<Register>;
  updateRegister: (id: string, data: Partial<Register>) => Promise<Register>;
  deleteRegister: (id: string) => Promise<void>;

  createHandover: (data: Record<string, unknown>) => Promise<Handover>;
  createTransaction: (data: Partial<Transaction>) => Promise<Transaction>;
}

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: '请求失败' }));
    throw new Error(err.error || '请求失败');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const useAppStore = create<AppState>((set, get) => ({
  registers: [],
  handovers: [],
  transactions: [],
  overview: null,
  statistics: null,
  loading: false,
  error: null,

  fetchRegisters: async () => {
    set({ loading: true });
    try {
      const data = await request<Register[]>('/registers');
      set({ registers: data, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchHandovers: async (params) => {
    set({ loading: true });
    try {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      const data = await request<Handover[]>(`/handovers${query}`);
      set({ handovers: data, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchTransactions: async (params) => {
    set({ loading: true });
    try {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      const data = await request<Transaction[]>(`/transactions${query}`);
      set({ transactions: data, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchOverview: async (params) => {
    try {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      const data = await request<OverviewStats>(`/statistics/overview${query}`);
      set({ overview: data });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  fetchStatistics: async (params) => {
    set({ loading: true });
    try {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      const data = await request<StatsResponse>(`/statistics${query}`);
      set({ statistics: data, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createRegister: async (data) => {
    const result = await request<Register>('/registers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    set({ registers: [...get().registers, result] });
    return result;
  },

  updateRegister: async (id, data) => {
    const result = await request<Register>(`/registers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    set({
      registers: get().registers.map((r) => (r.id === id ? result : r)),
    });
    return result;
  },

  deleteRegister: async (id) => {
    await request(`/registers/${id}`, { method: 'DELETE' });
    set({ registers: get().registers.filter((r) => r.id !== id) });
  },

  createHandover: async (data) => {
    const result = await request<Handover>('/handovers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    set({ handovers: [result, ...get().handovers] });
    return result;
  },

  createTransaction: async (data) => {
    const result = await request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    set({ transactions: [result, ...get().transactions] });
    return result;
  },
}));
