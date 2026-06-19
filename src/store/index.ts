import { create } from 'zustand';
import { api } from '@/lib/api';
import type {
  Device, UsageRecord, DisinfectionTask, InventoryItem, ScrapRecord,
  DashboardStats, ClinicRoomUsage, StockLog
} from '@shared/types';

interface AppState {
  stats: DashboardStats | null;
  statusDistribution: any[];
  clinicUsage: ClinicRoomUsage[];
  overdueAlerts: any[];
  lowStockItems: InventoryItem[];
  devices: Device[];
  devicesTotal: number;
  usages: UsageRecord[];
  usagesTotal: number;
  disinfectionQueue: DisinfectionTask[];
  disinfectionRecords: DisinfectionTask[];
  inventory: InventoryItem[];
  scrapRecords: ScrapRecord[];
  stockLogs: StockLog[];
  loading: Record<string, boolean>;

  setLoading: (key: string, v: boolean) => void;
  fetchDashboard: () => Promise<void>;
  fetchDevices: (params?: Record<string, any>) => Promise<void>;
  fetchUsages: (params?: Record<string, any>) => Promise<void>;
  fetchDisinfectionQueue: () => Promise<void>;
  fetchDisinfectionRecords: (params?: Record<string, any>) => Promise<void>;
  fetchInventory: () => Promise<void>;
  fetchScrapRecords: (params?: Record<string, any>) => Promise<void>;
  fetchStockLogs: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  stats: null,
  statusDistribution: [],
  clinicUsage: [],
  overdueAlerts: [],
  lowStockItems: [],
  devices: [],
  devicesTotal: 0,
  usages: [],
  usagesTotal: 0,
  disinfectionQueue: [],
  disinfectionRecords: [],
  inventory: [],
  scrapRecords: [],
  stockLogs: [],
  loading: {},

  setLoading: (key, v) => set(s => ({ loading: { ...s.loading, [key]: v } })),

  fetchDashboard: async () => {
    get().setLoading('dashboard', true);
    try {
      const [stats, sd, cu, oa, ls] = await Promise.all([
        api.getDashboardStats(),
        api.getStatusDistribution(),
        api.getClinicUsage(),
        api.getOverdueAlerts(),
        api.getLowStock(),
      ]);
      set({
        stats: stats as DashboardStats || null,
        statusDistribution: (sd as any[]) || [],
        clinicUsage: (cu as ClinicRoomUsage[]) || [],
        overdueAlerts: (oa as any[]) || [],
        lowStockItems: (ls as InventoryItem[]) || [],
      });
    } catch (e) {
      console.error('fetchDashboard error:', e);
    } finally {
      get().setLoading('dashboard', false);
    }
  },

  fetchDevices: async (params) => {
    get().setLoading('devices', true);
    try {
      const res = await api.getDevices(params);
      const list = Array.isArray(res) ? res : [];
      set({ devices: list as Device[], devicesTotal: list.length });
    } catch (e) {
      console.error('fetchDevices error:', e);
    } finally {
      get().setLoading('devices', false);
    }
  },

  fetchUsages: async (params) => {
    get().setLoading('usages', true);
    try {
      const res = await api.getUsages(params);
      const list = Array.isArray(res) ? res : [];
      set({ usages: list as UsageRecord[], usagesTotal: list.length });
    } catch (e) {
      console.error('fetchUsages error:', e);
    } finally {
      get().setLoading('usages', false);
    }
  },

  fetchDisinfectionQueue: async () => {
    get().setLoading('disQueue', true);
    try {
      const data = await api.getDisinfectionQueue();
      set({ disinfectionQueue: (Array.isArray(data) ? data : []) as DisinfectionTask[] });
    } catch (e) {
      console.error('fetchDisinfectionQueue error:', e);
    } finally {
      get().setLoading('disQueue', false);
    }
  },

  fetchDisinfectionRecords: async (params) => {
    get().setLoading('disRecords', true);
    try {
      const res = await api.getDisinfectionRecords(params);
      const list = Array.isArray(res) ? res : [];
      set({ disinfectionRecords: list as DisinfectionTask[] });
    } catch (e) {
      console.error('fetchDisinfectionRecords error:', e);
    } finally {
      get().setLoading('disRecords', false);
    }
  },

  fetchInventory: async () => {
    get().setLoading('inventory', true);
    try {
      const data = await api.getInventory();
      set({ inventory: (Array.isArray(data) ? data : []) as InventoryItem[] });
    } catch (e) {
      console.error('fetchInventory error:', e);
    } finally {
      get().setLoading('inventory', false);
    }
  },

  fetchScrapRecords: async (params) => {
    get().setLoading('scrap', true);
    try {
      const res = await api.getScrapRecords(params);
      const list = Array.isArray(res) ? res : [];
      set({ scrapRecords: list as ScrapRecord[] });
    } catch (e) {
      console.error('fetchScrapRecords error:', e);
    } finally {
      get().setLoading('scrap', false);
    }
  },

  fetchStockLogs: async () => {
    get().setLoading('stockLogs', true);
    try {
      const data = await api.getStockLogs();
      set({ stockLogs: (Array.isArray(data) ? data : []) as StockLog[] });
    } catch (e) {
      console.error('fetchStockLogs error:', e);
    } finally {
      get().setLoading('stockLogs', false);
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().fetchDashboard(),
      get().fetchDevices(),
      get().fetchUsages(),
      get().fetchDisinfectionQueue(),
      get().fetchInventory(),
    ]);
  },
}));

export default useAppStore;
