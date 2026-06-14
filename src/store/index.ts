import { create } from 'zustand';
import type {
  Printer,
  Consumption,
  Replenishment,
  Alert,
  ConsumptionRate,
  DepartmentUsage,
  ReplenishmentForecast,
} from '../../shared/types';
import { api } from '../api/client';

interface AppState {
  printers: Printer[];
  consumptions: Consumption[];
  replenishments: Replenishment[];
  alerts: Alert[];
  consumptionRates: ConsumptionRate[];
  departmentUsage: DepartmentUsage[];
  replenishmentForecast: ReplenishmentForecast[];
  dailyTrend: any[];
  loading: boolean;
  error: string | null;

  fetchPrinters: () => Promise<void>;
  fetchConsumptions: (printerId?: string, department?: string) => Promise<void>;
  fetchReplenishments: (printerId?: string, supplier?: string) => Promise<void>;
  fetchAlerts: (printerId?: string, isResolved?: boolean) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchAll: () => Promise<void>;

  addPrinter: (data: any) => Promise<void>;
  updatePrinter: (id: string, data: any) => Promise<void>;
  deletePrinter: (id: string) => Promise<void>;

  addConsumption: (data: any) => Promise<void>;
  addReplenishment: (data: any) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;

  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  printers: [],
  consumptions: [],
  replenishments: [],
  alerts: [],
  consumptionRates: [],
  departmentUsage: [],
  replenishmentForecast: [],
  dailyTrend: [],
  loading: false,
  error: null,

  fetchPrinters: async () => {
    set({ loading: true });
    try {
      const data = await api.printers.getAll();
      set({ printers: data, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchConsumptions: async (printerId?: string, department?: string) => {
    set({ loading: true });
    try {
      const data = await api.consumptions.getAll(printerId, department);
      set({ consumptions: data, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchReplenishments: async (printerId?: string, supplier?: string) => {
    set({ loading: true });
    try {
      const data = await api.replenishments.getAll(printerId, supplier);
      set({ replenishments: data, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchAlerts: async (printerId?: string, isResolved?: boolean) => {
    set({ loading: true });
    try {
      const data = await api.alerts.getAll(printerId, isResolved);
      set({ alerts: data, error: null });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchStatistics: async () => {
    set({ loading: true });
    try {
      const [rates, usage, forecast, trend] = await Promise.all([
        api.statistics.getConsumptionRate(),
        api.statistics.getDepartmentUsage(),
        api.statistics.getReplenishmentForecast(),
        api.statistics.getDailyTrend(30),
      ]);
      set({
        consumptionRates: rates,
        departmentUsage: usage,
        replenishmentForecast: forecast,
        dailyTrend: trend,
        error: null,
      });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchAll: async () => {
    set({ loading: true });
    try {
      const [printers, consumptions, replenishments, alerts] = await Promise.all([
        api.printers.getAll(),
        api.consumptions.getAll(),
        api.replenishments.getAll(),
        api.alerts.getAll(undefined, false),
      ]);
      set({
        printers,
        consumptions,
        replenishments,
        alerts,
        error: null,
      });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addPrinter: async (data: any) => {
    set({ loading: true });
    try {
      await api.printers.create(data);
      await get().fetchPrinters();
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updatePrinter: async (id: string, data: any) => {
    set({ loading: true });
    try {
      await api.printers.update(id, data);
      await get().fetchPrinters();
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deletePrinter: async (id: string) => {
    set({ loading: true });
    try {
      await api.printers.delete(id);
      await get().fetchPrinters();
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addConsumption: async (data: any) => {
    set({ loading: true });
    try {
      await api.consumptions.create(data);
      await Promise.all([
        get().fetchConsumptions(),
        get().fetchPrinters(),
        get().fetchAlerts(undefined, false),
      ]);
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  addReplenishment: async (data: any) => {
    set({ loading: true });
    try {
      await api.replenishments.create(data);
      await Promise.all([
        get().fetchReplenishments(),
        get().fetchPrinters(),
        get().fetchAlerts(undefined, false),
        get().fetchStatistics(),
      ]);
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  resolveAlert: async (id: string) => {
    try {
      await api.alerts.resolve(id);
      await get().fetchAlerts(undefined, false);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setError: (error: string | null) => set({ error }),
}));
