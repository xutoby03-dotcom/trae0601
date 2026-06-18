import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInHours } from 'date-fns';
import type { ExceptionRecord, ExceptionType } from '@/types';
import { generateId } from '@/utils';
import { MOCK_EXCEPTIONS } from '@/mock/data';
import { usePackageStore } from './packageStore';

interface ExceptionState {
  records: ExceptionRecord[];
  addException: (data: {
    packageId: string;
    recipientName: string;
    slotLabel: string;
    type: ExceptionType;
    description: string;
    handler: string;
  }) => void;
  getExceptionList: () => ExceptionRecord[];
  getStats: () => { total: number; damaged: number; wrongPickup: number; unclaimed: number };
}

export const useExceptionStore = create<ExceptionState>()(
  persist(
    (set, get) => ({
      records: MOCK_EXCEPTIONS,

      addException: (data) => {
        const record: ExceptionRecord = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        usePackageStore.getState().markException(data.packageId);
        set((state) => ({ records: [record, ...state.records] }));
      },

      getExceptionList: () => [...get().records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

      getStats: () => {
        let damaged = 0;
        let wrongPickup = 0;
        let unclaimed = 0;
        get().records.forEach((r) => {
          if (r.type === 'damaged') damaged++;
          if (r.type === 'wrong_pickup') wrongPickup++;
          if (r.type === 'unclaimed') unclaimed++;
        });
        return {
          total: get().records.length,
          damaged,
          wrongPickup,
          unclaimed,
        };
      },
    }),
    {
      name: 'exception-storage',
    },
  ),
);
