import { create } from 'zustand';
import type { TastingRecord, TastingStatus } from '@/types';
import { getStorage, setStorage } from '@/utils/storage';
import { mockTastingRecords } from '@/data/mockData';
import { generateId, isToday } from '@/utils/date';
import { useProductStore } from './productStore';

interface TastingState {
  records: TastingRecord[];
  createTasting: (data: Omit<TastingRecord, 'id' | 'status' | 'remainingPortion' | 'convertedOrders'>) => void;
  endTasting: (id: string, remainingPortion: number, status?: TastingStatus) => void;
  getActiveRecords: () => TastingRecord[];
  getTodayRecords: () => TastingRecord[];
  getExpiringSoon: (minutes?: number) => TastingRecord[];
  getExpired: () => TastingRecord[];
  incrementConvertedOrders: (id: string) => void;
}

const STORAGE_KEY = 'tasting-records';

export const useTastingStore = create<TastingState>((set, get) => {
  const stored = getStorage<TastingRecord[]>(STORAGE_KEY, []);
  const initialRecords = stored.length > 0 ? stored : mockTastingRecords;
  
  if (stored.length === 0) {
    setStorage(STORAGE_KEY, initialRecords);
  }

  return {
    records: initialRecords,

    createTasting: (data) => {
      const newRecord: TastingRecord = {
        ...data,
        id: generateId(),
        status: 'active',
        remainingPortion: data.portion,
        convertedOrders: 0,
      };
      
      useProductStore.getState().updateBatchStock(data.batchId, -Math.ceil(data.portion));
      
      set((state) => {
        const records = [...state.records, newRecord];
        setStorage(STORAGE_KEY, records);
        return { records };
      });
    },

    endTasting: (id, remainingPortion, status = 'completed') => {
      set((state) => {
        const records = state.records.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                remainingPortion,
                actualEndTime: new Date().toISOString(),
              }
            : r
        );
        setStorage(STORAGE_KEY, records);
        return { records };
      });
    },

    getActiveRecords: () => {
      return get().records.filter((r) => r.status === 'active');
    },

    getTodayRecords: () => {
      return get().records.filter((r) => isToday(r.startTime));
    },

    getExpiringSoon: (minutes = 30) => {
      const now = Date.now();
      return get().records.filter((r) => {
        if (r.status !== 'active') return false;
        const endTime = new Date(r.expectedEndTime).getTime();
        const diff = endTime - now;
        return diff > 0 && diff <= minutes * 60 * 1000;
      });
    },

    getExpired: () => {
      const now = Date.now();
      return get().records.filter((r) => {
        if (r.status !== 'active') return false;
        return new Date(r.expectedEndTime).getTime() <= now;
      });
    },

    incrementConvertedOrders: (id) => {
      set((state) => {
        const records = state.records.map((r) =>
          r.id === id ? { ...r, convertedOrders: r.convertedOrders + 1 } : r
        );
        setStorage(STORAGE_KEY, records);
        return { records };
      });
    },
  };
});
