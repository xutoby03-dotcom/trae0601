import { create } from 'zustand';
import { api } from '../lib/api.js';
import type {
  Mold,
  Master,
  BorrowRecordWithDetails,
  ExceptionRecordWithDetails,
  DashboardStats,
  BorrowConflict,
  UsageBySize,
  PurchaseSuggestion,
} from '../../shared/types.js';

interface AppState {
  molds: Mold[];
  masters: Master[];
  borrowRecords: BorrowRecordWithDetails[];
  exceptionRecords: ExceptionRecordWithDetails[];
  dashboardStats: DashboardStats | null;
  conflicts: BorrowConflict[];
  overdueList: any[];
  usageBySize: UsageBySize[];
  purchaseSuggestions: PurchaseSuggestion[];
  loading: Record<string, boolean>;
  error: string | null;

  fetchMolds: (params?: { type?: string; size?: string; material?: string; status?: string }) => Promise<void>;
  fetchMasters: () => Promise<void>;
  fetchBorrowRecords: (params?: { masterId?: string; status?: string; moldId?: string; includeDetails?: boolean }) => Promise<void>;
  fetchBorrows: (params?: { masterId?: string; status?: string; moldId?: string; includeDetails?: boolean }) => Promise<void>;
  fetchExceptions: (params?: { status?: string; moldId?: string; includeDetails?: boolean }) => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  fetchConflicts: () => Promise<void>;
  fetchOverdue: () => Promise<void>;
  fetchUsageBySize: () => Promise<void>;
  fetchPurchaseSuggestions: () => Promise<void>;
  fetchAllDashboard: () => Promise<void>;
  fetchAllBasics: () => Promise<void>;

  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  molds: [],
  masters: [],
  borrowRecords: [],
  exceptionRecords: [],
  dashboardStats: null,
  conflicts: [],
  overdueList: [],
  usageBySize: [],
  purchaseSuggestions: [],
  loading: {},
  error: null,

  fetchMolds: async (params) => {
    set({ loading: { ...get().loading, molds: true } });
    try {
      const data = await api.molds.list(params);
      set({ molds: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: { ...get().loading, molds: false } });
    }
  },

  fetchMasters: async () => {
    set({ loading: { ...get().loading, masters: true } });
    try {
      const data = await api.masters.list();
      set({ masters: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: { ...get().loading, masters: false } });
    }
  },

  fetchBorrowRecords: async (params) => {
    set({ loading: { ...get().loading, borrowRecords: true } });
    try {
      const data = await api.borrows.list(params);
      set({ borrowRecords: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: { ...get().loading, borrowRecords: false } });
    }
  },

  fetchBorrows: async (params) => {
    return get().fetchBorrowRecords(params);
  },

  fetchExceptions: async (params) => {
    set({ loading: { ...get().loading, exceptions: true } });
    try {
      const data = await api.exceptions.list(params);
      set({ exceptionRecords: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: { ...get().loading, exceptions: false } });
    }
  },

  fetchDashboardStats: async () => {
    set({ loading: { ...get().loading, stats: true } });
    try {
      const data = await api.dashboard.stats();
      set({ dashboardStats: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: { ...get().loading, stats: false } });
    }
  },

  fetchConflicts: async () => {
    set({ loading: { ...get().loading, conflicts: true } });
    try {
      const data = await api.dashboard.conflicts();
      set({ conflicts: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: { ...get().loading, conflicts: false } });
    }
  },

  fetchOverdue: async () => {
    set({ loading: { ...get().loading, overdue: true } });
    try {
      const data = await api.dashboard.overdue();
      set({ overdueList: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: { ...get().loading, overdue: false } });
    }
  },

  fetchUsageBySize: async () => {
    set({ loading: { ...get().loading, usageBySize: true } });
    try {
      const data = await api.dashboard.usageBySize();
      set({ usageBySize: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: { ...get().loading, usageBySize: false } });
    }
  },

  fetchPurchaseSuggestions: async () => {
    set({ loading: { ...get().loading, purchaseSuggestions: true } });
    try {
      const data = await api.dashboard.purchaseSuggestions();
      set({ purchaseSuggestions: data, error: null });
    } catch (e: any) {
      set({ error: e.message });
    } finally {
      set({ loading: { ...get().loading, purchaseSuggestions: false } });
    }
  },

  fetchAllDashboard: async () => {
    await Promise.all([
      get().fetchDashboardStats(),
      get().fetchConflicts(),
      get().fetchOverdue(),
      get().fetchUsageBySize(),
      get().fetchPurchaseSuggestions(),
    ]);
  },

  fetchAllBasics: async () => {
    await Promise.all([
      get().fetchMolds(),
      get().fetchMasters(),
    ]);
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
