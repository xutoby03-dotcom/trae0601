import { create } from 'zustand';
import type { Bed, Reservation, OverviewStats } from '#shared/types';
import { bedsApi, reservationsApi, statisticsApi } from '@/api/client';

interface AppState {
  beds: Bed[];
  reservations: Reservation[];
  overview: OverviewStats;
  loading: boolean;
  error: string | null;
  fetchBeds: () => Promise<void>;
  fetchReservations: (date?: string) => Promise<void>;
  fetchOverview: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  beds: [],
  reservations: [],
  overview: { todayReservations: 0, todayCheckedIn: 0, todayVacant: 0, pendingDisinfection: 0 },
  loading: false,
  error: null,

  fetchBeds: async () => {
    try {
      set({ loading: true });
      const data = await bedsApi.list();
      set({ beds: data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchReservations: async (date) => {
    try {
      set({ loading: true });
      const data = await reservationsApi.list(date ? { date } : undefined);
      set({ reservations: data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchOverview: async () => {
    try {
      const data = await statisticsApi.overview();
      set({ overview: data });
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
