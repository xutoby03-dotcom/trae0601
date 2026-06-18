import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DropRecord } from '../types';
import { mockDropRecords } from '../data/dropRecords';
import { generateId } from '../utils/formatters';
import { estimateBagWeight } from '../utils/calculations';
import { useRecoveryPointsStore } from './recoveryPoints';

interface DropRecordsState {
  dropRecords: DropRecord[];
  addDropRecord: (record: Omit<DropRecord, 'id' | 'dropTime' | 'status'>) => void;
  updateDropRecord: (id: string, updates: Partial<DropRecord>) => void;
  deleteDropRecord: (id: string) => void;
  getDropRecord: (id: string) => DropRecord | undefined;
  getPendingRecords: () => DropRecord[];
  getRecordsByRecoveryPoint: (recoveryPointId: string) => DropRecord[];
  resetMockData: () => void;
}

export const useDropRecordsStore = create<DropRecordsState>()(
  persist(
    (set, get) => ({
      dropRecords: mockDropRecords,
      
      addDropRecord: (record) => {
        const newRecord: DropRecord = {
          ...record,
          id: generateId(),
          dropTime: new Date().toISOString(),
          status: 'pending',
        };
        set((state) => ({
          dropRecords: [...state.dropRecords, newRecord],
        }));
        
        const weight = estimateBagWeight(record.bagCount);
        useRecoveryPointsStore.getState().updateCurrentWeight(
          record.recoveryPointId,
          weight,
          true
        );
      },
      
      updateDropRecord: (id, updates) => {
        set((state) => ({
          dropRecords: state.dropRecords.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },
      
      deleteDropRecord: (id) => {
        const record = get().getDropRecord(id);
        if (record && record.status === 'pending') {
          const weight = estimateBagWeight(record.bagCount);
          useRecoveryPointsStore.getState().updateCurrentWeight(
            record.recoveryPointId,
            weight,
            false
          );
        }
        set((state) => ({
          dropRecords: state.dropRecords.filter((r) => r.id !== id),
        }));
      },
      
      getDropRecord: (id) => {
        return get().dropRecords.find((r) => r.id === id);
      },
      
      getPendingRecords: () => {
        return get().dropRecords.filter((r) => r.status === 'pending');
      },
      
      getRecordsByRecoveryPoint: (recoveryPointId) => {
        return get().dropRecords.filter((r) => r.recoveryPointId === recoveryPointId);
      },
      
      resetMockData: () => {
        set({ dropRecords: mockDropRecords });
      },
    }),
    {
      name: 'drop-records-storage',
    }
  )
);
