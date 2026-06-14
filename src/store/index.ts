import { create } from 'zustand';
import { api } from '../lib/api';

interface AppState {
  costumes: Costume[];
  reservations: Reservation[];
  lendingRecords: LendingRecord[];
  pendingReturns: LendingRecord[];
  cleaningRecords: CleaningRecord[];
  statistics: Statistics | null;
  damages: DamageRecord[];
  overdueRecords: LendingRecord[];
  loading: boolean;
  error: string | null;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  fetchCostumes: (params?: any) => Promise<void>;
  fetchReservations: (params?: any) => Promise<void>;
  fetchLendings: () => Promise<void>;
  fetchPendingReturns: () => Promise<void>;
  fetchCleaning: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchDamages: () => Promise<void>;
  fetchOverdue: () => Promise<void>;
  
  createCostume: (data: Partial<Costume>) => Promise<Costume | null>;
  updateCostume: (id: string, data: Partial<Costume>) => Promise<Costume | null>;
  deleteCostume: (id: string) => Promise<boolean>;
  
  createReservation: (data: Partial<Reservation>) => Promise<Reservation | null>;
  approveReservation: (id: string) => Promise<boolean>;
  rejectReservation: (id: string, reason: string) => Promise<boolean>;
  cancelReservation: (id: string) => Promise<boolean>;
  
  previewLending: (reservationId: string) => Promise<any>;
  createLending: (reservationId: string, lenderName: string, costumeIds: string[]) => Promise<{ success: boolean; record?: LendingRecord; error?: string; unavailableCostumes?: UnavailableCostume[] }>;
  returnItems: (id: string, items: any[]) => Promise<boolean>;
  
  startCleaning: (id: string, operator: string) => Promise<boolean>;
  completeCleaning: (id: string) => Promise<boolean>;
  
  setToast: (toast: { message: string; type: 'success' | 'error' | 'info' } | null) => void;
  clearError: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  costumes: [],
  reservations: [],
  lendingRecords: [],
  pendingReturns: [],
  cleaningRecords: [],
  statistics: null,
  damages: [],
  overdueRecords: [],
  loading: false,
  error: null,
  toast: null,

  setToast: (toast) => set({ toast }),
  clearError: () => set({ error: null }),

  fetchCostumes: async (params) => {
    try {
      set({ loading: true });
      const data = await api.costumes.getAll(params);
      set({ costumes: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchReservations: async (params) => {
    try {
      set({ loading: true });
      const data = await api.reservations.getAll(params);
      set({ reservations: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchLendings: async () => {
    try {
      set({ loading: true });
      const data = await api.lendings.getAll();
      set({ lendingRecords: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchPendingReturns: async () => {
    try {
      set({ loading: true });
      const data = await api.returns.getPending();
      set({ pendingReturns: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchCleaning: async () => {
    try {
      set({ loading: true });
      const data = await api.cleaning.getAll();
      set({ cleaningRecords: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchStatistics: async () => {
    try {
      set({ loading: true });
      const data = await api.statistics.getOverview();
      set({ statistics: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchDamages: async () => {
    try {
      set({ loading: true });
      const data = await api.statistics.getDamages(false);
      set({ damages: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchOverdue: async () => {
    try {
      set({ loading: true });
      const data = await api.statistics.getOverdue();
      set({ overdueRecords: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createCostume: async (data) => {
    try {
      set({ loading: true });
      const result = await api.costumes.create(data);
      await get().fetchCostumes();
      set({ toast: { message: '服装添加成功', type: 'success' }, loading: false });
      return result;
    } catch (error) {
      set({ error: (error as Error).message, toast: { message: (error as Error).message, type: 'error' }, loading: false });
      return null;
    }
  },

  updateCostume: async (id, data) => {
    try {
      set({ loading: true });
      const result = await api.costumes.update(id, data);
      await get().fetchCostumes();
      set({ toast: { message: '服装更新成功', type: 'success' }, loading: false });
      return result;
    } catch (error) {
      set({ error: (error as Error).message, toast: { message: (error as Error).message, type: 'error' }, loading: false });
      return null;
    }
  },

  deleteCostume: async (id) => {
    try {
      set({ loading: true });
      await api.costumes.delete(id);
      await get().fetchCostumes();
      set({ toast: { message: '服装删除成功', type: 'success' }, loading: false });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, toast: { message: (error as Error).message, type: 'error' }, loading: false });
      return false;
    }
  },

  createReservation: async (data) => {
    try {
      set({ loading: true });
      const result = await api.reservations.create(data);
      await get().fetchReservations();
      set({ toast: { message: '预约提交成功', type: 'success' }, loading: false });
      return result;
    } catch (error) {
      set({ error: (error as Error).message, toast: { message: (error as Error).message, type: 'error' }, loading: false });
      return null;
    }
  },

  approveReservation: async (id) => {
    try {
      set({ loading: true });
      await api.reservations.approve(id);
      await get().fetchReservations();
      set({ toast: { message: '预约审核通过', type: 'success' }, loading: false });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, toast: { message: (error as Error).message, type: 'error' }, loading: false });
      return false;
    }
  },

  rejectReservation: async (id, reason) => {
    try {
      set({ loading: true });
      await api.reservations.reject(id, reason);
      await get().fetchReservations();
      set({ toast: { message: '预约已驳回', type: 'success' }, loading: false });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, toast: { message: (error as Error).message, type: 'error' }, loading: false });
      return false;
    }
  },

  cancelReservation: async (id) => {
    try {
      set({ loading: true });
      await api.reservations.cancel(id);
      await get().fetchReservations();
      set({ toast: { message: '预约已取消', type: 'success' }, loading: false });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, toast: { message: (error as Error).message, type: 'error' }, loading: false });
      return false;
    }
  },

  previewLending: async (reservationId) => {
    try {
      set({ loading: true });
      const result = await api.lendings.preview(reservationId);
      set({ loading: false });
      return result;
    } catch (error) {
      set({ error: (error as Error).message, toast: { message: (error as Error).message, type: 'error' }, loading: false });
      return null;
    }
  },

  createLending: async (reservationId, lenderName, costumeIds) => {
    try {
      set({ loading: true });
      const record = await api.lendings.create({ reservationId, lenderName, costumeIds });
      await Promise.all([get().fetchReservations(), get().fetchLendings()]);
      set({ toast: { message: '借出成功', type: 'success' }, loading: false });
      return { success: true, record };
    } catch (error) {
      const errMsg = (error as Error).message;
      set({ error: errMsg, loading: false });
      try {
        if (errMsg.startsWith('{')) {
          const errData = JSON.parse(errMsg);
          if (errData.unavailableCostumes) {
            set({ toast: { message: errData.error || '部分服装已无法借出', type: 'error' } });
            return { success: false, error: errData.error, unavailableCostumes: errData.unavailableCostumes };
          }
        }
      } catch {
      }
      set({ toast: { message: errMsg, type: 'error' } });
      return { success: false, error: errMsg };
    }
  },

  returnItems: async (id, items) => {
    try {
      set({ loading: true });
      await api.returns.returnItems(id, items);
      await get().fetchPendingReturns();
      await get().fetchLendings();
      await get().fetchCostumes();
      await get().fetchCleaning();
      await get().fetchDamages();
      set({ toast: { message: '归还成功', type: 'success' }, loading: false });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, toast: { message: (error as Error).message, type: 'error' }, loading: false });
      return false;
    }
  },

  startCleaning: async (id, operator) => {
    try {
      set({ loading: true });
      await api.cleaning.start(id, operator);
      await get().fetchCleaning();
      await get().fetchCostumes();
      set({ toast: { message: '开始清洗', type: 'success' }, loading: false });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, toast: { message: (error as Error).message, type: 'error' }, loading: false });
      return false;
    }
  },

  completeCleaning: async (id) => {
    try {
      set({ loading: true });
      await api.cleaning.complete(id);
      await get().fetchCleaning();
      await get().fetchCostumes();
      set({ toast: { message: '清洗完成', type: 'success' }, loading: false });
      return true;
    } catch (error) {
      set({ error: (error as Error).message, toast: { message: (error as Error).message, type: 'error' }, loading: false });
      return false;
    }
  },
}));

export default useStore;
