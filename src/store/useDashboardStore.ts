import { create } from 'zustand';
import { api } from '@/services/api';

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const stats = await api.dashboard.getStats();
      set({ stats, loading: false });
    } catch (error) {
      set({ error: '获取看板数据失败', loading: false });
    }
  },
}));
