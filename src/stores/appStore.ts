import { create } from 'zustand';
import type { StatisticsOverview } from '../../shared/types';
import { statisticsApi } from '../services/costumeService';
import { borrowApi } from '../services/borrowService';

interface AppState {
  overview: StatisticsOverview | null;
  overdueCount: number;
  loading: boolean;
  refreshOverview: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  overview: null,
  overdueCount: 0,
  loading: false,

  refreshOverview: async () => {
    set({ loading: true });
    try {
      const [overview, overdue] = await Promise.all([
        statisticsApi.getOverview(),
        borrowApi.getOverdue(),
      ]);
      set({ overview, overdueCount: overdue.length, loading: false });
    } catch (error) {
      console.error('Failed to fetch overview:', error);
      set({ loading: false });
    }
  },
}));
