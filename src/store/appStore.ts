import { create } from 'zustand';
import type { Room, Borrow, ExceptionRecord, DashboardStats } from '../../shared/types.js';
import { roomsApi, borrowsApi, exceptionsApi, statsApi } from '../services/api.js';

interface AppState {
  rooms: Room[];
  borrows: Borrow[];
  exceptions: ExceptionRecord[];
  dashboardStats: DashboardStats | null;
  loading: boolean;
  error: string | null;

  fetchRooms: () => Promise<void>;
  fetchBorrows: (status?: string) => Promise<void>;
  fetchExceptions: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  rooms: [],
  borrows: [],
  exceptions: [],
  dashboardStats: null,
  loading: false,
  error: null,

  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const rooms = await roomsApi.list();
      set({ rooms });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchBorrows: async (status?: string) => {
    set({ loading: true, error: null });
    try {
      const borrows = await borrowsApi.list(status);
      set({ borrows });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchExceptions: async () => {
    set({ loading: true, error: null });
    try {
      const exceptions = await exceptionsApi.list();
      set({ exceptions });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchDashboard: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await statsApi.dashboard();
      set({ dashboardStats: stats });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [rooms, borrows, exceptions, stats] = await Promise.all([
        roomsApi.list(),
        borrowsApi.list(),
        exceptionsApi.list(),
        statsApi.dashboard(),
      ]);
      set({ rooms, borrows, exceptions, dashboardStats: stats });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));
