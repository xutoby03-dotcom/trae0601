import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoffeeBatch, BrewingRecord, BrewingMethod } from '../types';
import { mockBatches, mockRecords } from '../data/mockData';

interface BatchState {
  batches: CoffeeBatch[];
  records: BrewingRecord[];
  selectedFilter: string;
  
  addBatch: (batch: Omit<CoffeeBatch, 'id' | 'createdAt'>) => void;
  updateBatch: (id: string, updates: Partial<CoffeeBatch>) => void;
  deleteBatch: (id: string) => void;
  
  addRecord: (record: Omit<BrewingRecord, 'id' | 'createdAt'>) => void;
  deleteRecord: (id: string) => void;
  
  setSelectedFilter: (filter: string) => void;
  
  getBatchById: (id: string) => CoffeeBatch | undefined;
  getRecordsByBatchId: (batchId: string) => BrewingRecord[];
  
  openBatch: (id: string) => void;
  consumeBeans: (batchId: string, grams: number) => void;
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const useBatchStore = create<BatchState>()(
  persist(
    (set, get) => ({
      batches: mockBatches,
      records: mockRecords,
      selectedFilter: 'all',

      addBatch: (batchData) => {
        const newBatch: CoffeeBatch = {
          ...batchData,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          batches: [newBatch, ...state.batches],
        }));
      },

      updateBatch: (id, updates) => {
        set((state) => ({
          batches: state.batches.map((batch) =>
            batch.id === id ? { ...batch, ...updates } : batch
          ),
        }));
      },

      deleteBatch: (id) => {
        set((state) => ({
          batches: state.batches.filter((batch) => batch.id !== id),
          records: state.records.filter((record) => record.batchId !== id),
        }));
      },

      addRecord: (recordData) => {
        const newRecord: BrewingRecord = {
          ...recordData,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
        };
        
        const state = get();
        const batch = state.batches.find((b) => b.id === recordData.batchId);
        if (batch) {
          const newWeight = Math.max(0, batch.currentWeight - recordData.grams);
          get().updateBatch(recordData.batchId, { currentWeight: newWeight });
        }

        set((state) => ({
          records: [newRecord, ...state.records],
        }));
      },

      deleteRecord: (id) => {
        set((state) => ({
          records: state.records.filter((record) => record.id !== id),
        }));
      },

      setSelectedFilter: (filter) => {
        set({ selectedFilter: filter });
      },

      getBatchById: (id) => {
        return get().batches.find((batch) => batch.id === id);
      },

      getRecordsByBatchId: (batchId) => {
        return get()
          .records.filter((record) => record.batchId === batchId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      openBatch: (id) => {
        get().updateBatch(id, {
          openDate: new Date().toISOString().split('T')[0],
        });
      },

      consumeBeans: (batchId, grams) => {
        const state = get();
        const batch = state.batches.find((b) => b.id === batchId);
        if (batch) {
          const newWeight = Math.max(0, batch.currentWeight - grams);
          get().updateBatch(batchId, { currentWeight: newWeight });
        }
      },
    }),
    {
      name: 'coffee-batch-storage',
    }
  )
);
