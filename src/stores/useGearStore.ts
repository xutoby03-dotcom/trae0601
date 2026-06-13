import { create } from 'zustand';
import type { RainGear, BorrowRecord, StatisticsSummary, OverdueItem } from '../types';
import { gearApi } from '../api/gear';

interface GearState {
  gears: RainGear[];
  records: BorrowRecord[];
  summary: StatisticsSummary | null;
  overdueItems: OverdueItem[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  fetchGears: () => Promise<void>;
  fetchRecords: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  fetchOverdue: () => Promise<void>;
  createGear: (dto: any) => Promise<RainGear | null>;
  updateGear: (id: string, dto: any) => Promise<RainGear | null>;
  deleteGear: (id: string) => Promise<boolean>;
  lendGear: (id: string, dto: any) => Promise<BorrowRecord | null>;
  returnGear: (id: string, dto: any) => Promise<BorrowRecord | null>;
}

export const useGearStore = create<GearState>((set, get) => ({
  gears: [],
  records: [],
  summary: null,
  overdueItems: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [gears, records, summary, overdueItems] = await Promise.all([
        gearApi.getAll(),
        gearApi.getRecords(),
        gearApi.getSummary(),
        gearApi.getOverdue(),
      ]);
      set({ gears, records, summary, overdueItems, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch data', loading: false });
    }
  },

  fetchGears: async () => {
    try {
      const gears = await gearApi.getAll();
      set({ gears });
    } catch (error) {
      set({ error: 'Failed to fetch gears' });
    }
  },

  fetchRecords: async () => {
    try {
      const records = await gearApi.getRecords();
      set({ records });
    } catch (error) {
      set({ error: 'Failed to fetch records' });
    }
  },

  fetchSummary: async () => {
    try {
      const summary = await gearApi.getSummary();
      set({ summary });
    } catch (error) {
      set({ error: 'Failed to fetch summary' });
    }
  },

  fetchOverdue: async () => {
    try {
      const overdueItems = await gearApi.getOverdue();
      set({ overdueItems });
    } catch (error) {
      set({ error: 'Failed to fetch overdue items' });
    }
  },

  createGear: async (dto) => {
    try {
      const newGear = await gearApi.create(dto);
      set((state) => ({ gears: [...state.gears, newGear] }));
      get().fetchSummary();
      return newGear;
    } catch (error) {
      set({ error: 'Failed to create gear' });
      return null;
    }
  },

  updateGear: async (id, dto) => {
    try {
      const updatedGear = await gearApi.update(id, dto);
      set((state) => ({
        gears: state.gears.map((g) => (g.id === id ? updatedGear : g)),
      }));
      get().fetchSummary();
      return updatedGear;
    } catch (error) {
      set({ error: 'Failed to update gear' });
      return null;
    }
  },

  deleteGear: async (id) => {
    try {
      await gearApi.delete(id);
      set((state) => ({
        gears: state.gears.filter((g) => g.id !== id),
      }));
      get().fetchSummary();
      return true;
    } catch (error) {
      set({ error: 'Failed to delete gear' });
      return false;
    }
  },

  lendGear: async (id, dto) => {
    try {
      const record = await gearApi.lend(id, dto);
      await Promise.all([get().fetchGears(), get().fetchRecords(), get().fetchSummary(), get().fetchOverdue()]);
      return record;
    } catch (error) {
      set({ error: 'Failed to lend gear' });
      return null;
    }
  },

  returnGear: async (id, dto) => {
    try {
      const record = await gearApi.return(id, dto);
      await Promise.all([get().fetchGears(), get().fetchRecords(), get().fetchSummary(), get().fetchOverdue()]);
      return record;
    } catch (error) {
      set({ error: 'Failed to return gear' });
      return null;
    }
  },
}));
