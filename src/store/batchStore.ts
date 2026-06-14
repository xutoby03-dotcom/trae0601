import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TeaBatch } from '@/types';
import { mockBatches } from '@/data/mockData';
import { generateId } from '@/utils/storage';
import { nowISO } from '@/utils/date';

interface BatchState {
  batches: TeaBatch[];
  addBatch: (data: Omit<TeaBatch, 'id' | 'createdAt' | 'updatedAt' | 'remainingWeight'>) => void;
  updateBatch: (id: string, data: Partial<TeaBatch>) => void;
  deleteBatch: (id: string) => void;
  getBatch: (id: string) => TeaBatch | undefined;
  decrementWeight: (id: string, weight: number) => void;
  incrementWeight: (id: string, weight: number) => void;
}

export const useBatchStore = create<BatchState>()(
  persist(
    (set, get) => ({
      batches: mockBatches,

      addBatch: (data) => {
        const newBatch: TeaBatch = {
          ...data,
          id: generateId(),
          remainingWeight: data.totalWeight,
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };
        set((state) => ({ batches: [newBatch, ...state.batches] }));
      },

      updateBatch: (id, data) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === id ? { ...b, ...data, updatedAt: nowISO() } : b
          ),
        }));
      },

      deleteBatch: (id) => {
        set((state) => ({ batches: state.batches.filter((b) => b.id !== id) }));
      },

      getBatch: (id) => {
        return get().batches.find((b) => b.id === id);
      },

      decrementWeight: (id, weight) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === id
              ? { ...b, remainingWeight: Math.max(0, b.remainingWeight - weight), updatedAt: nowISO() }
              : b
          ),
        }));
      },

      incrementWeight: (id, weight) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === id
              ? { ...b, remainingWeight: b.remainingWeight + weight, updatedAt: nowISO() }
              : b
          ),
        }));
      },
    }),
    {
      name: 'tea-batch-storage',
    }
  )
);
