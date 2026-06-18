import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SortingRecord, SortingItem } from '../types';
import { mockSortingRecords } from '../data/sortingRecords';
import { generateId } from '../utils/formatters';
import { calculateTotalWeight } from '../utils/calculations';
import { useRecoveryPointsStore } from './recoveryPoints';
import { useDropRecordsStore } from './dropRecords';

interface SortingRecordsState {
  sortingRecords: SortingRecord[];
  addSortingRecord: (
    record: Omit<SortingRecord, 'id' | 'sortingTime' | 'items'> & {
      items: Omit<SortingItem, 'id'>[];
    }
  ) => void;
  updateSortingRecord: (id: string, updates: Partial<SortingRecord>) => void;
  deleteSortingRecord: (id: string) => void;
  getSortingRecord: (id: string) => SortingRecord | undefined;
  getRecordsByRecoveryPoint: (recoveryPointId: string) => SortingRecord[];
  getRecordsByDropRecord: (dropRecordId: string) => SortingRecord[];
  resetMockData: () => void;
}

export const useSortingRecordsStore = create<SortingRecordsState>()(
  persist(
    (set, get) => ({
      sortingRecords: mockSortingRecords,
      
      addSortingRecord: (record) => {
        const items: SortingItem[] = record.items.map((item) => ({
          ...item,
          id: generateId(),
        }));
        
        const newRecord: SortingRecord = {
          ...record,
          id: generateId(),
          sortingTime: new Date().toISOString(),
          items,
        };
        
        set((state) => ({
          sortingRecords: [...state.sortingRecords, newRecord],
        }));
        
        useDropRecordsStore.getState().updateDropRecord(
          record.dropRecordId,
          { status: 'completed' }
        );
        
        const totalWeight = calculateTotalWeight(items);
        useRecoveryPointsStore.getState().updateCurrentWeight(
          record.recoveryPointId,
          totalWeight,
          false
        );
      },
      
      updateSortingRecord: (id, updates) => {
        set((state) => ({
          sortingRecords: state.sortingRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },
      
      deleteSortingRecord: (id) => {
        set((state) => ({
          sortingRecords: state.sortingRecords.filter((r) => r.id !== id),
        }));
      },
      
      getSortingRecord: (id) => {
        return get().sortingRecords.find((r) => r.id === id);
      },
      
      getRecordsByRecoveryPoint: (recoveryPointId) => {
        return get().sortingRecords.filter(
          (r) => r.recoveryPointId === recoveryPointId
        );
      },
      
      getRecordsByDropRecord: (dropRecordId) => {
        return get().sortingRecords.filter(
          (r) => r.dropRecordId === dropRecordId
        );
      },
      
      resetMockData: () => {
        set({ sortingRecords: mockSortingRecords });
      },
    }),
    {
      name: 'sorting-records-storage',
    }
  )
);
