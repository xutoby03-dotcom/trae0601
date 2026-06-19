import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CollectionRecord } from '../types';
import { mockCollectionRecords } from '../data/collectionRecords';
import { generateId } from '../utils/formatters';
import { useRecoveryPointsStore } from './recoveryPoints';

interface CollectionRecordsState {
  collectionRecords: CollectionRecord[];
  addCollectionRecord: (
    record: Omit<CollectionRecord, 'id' | 'status' | 'collectionTime' | 'createdAt'> & {
      status?: 'scheduled' | 'completed';
      collectionTime?: string;
      createdAt?: string;
    }
  ) => void;
  completeCollection: (id: string, collector: string) => void;
  deleteCollectionRecord: (id: string) => void;
  getCollectionRecord: (id: string) => CollectionRecord | undefined;
  getRecordsByRecoveryPoint: (recoveryPointId: string) => CollectionRecord[];
  getCompletedRecords: () => CollectionRecord[];
  resetMockData: () => void;
}

export const useCollectionRecordsStore = create<CollectionRecordsState>()(
  persist(
    (set, get) => ({
      collectionRecords: mockCollectionRecords,
      
      addCollectionRecord: (record) => {
        const newRecord: CollectionRecord = {
          ...record,
          id: generateId(),
          createdAt: record.createdAt || new Date().toISOString(),
          collectionTime: record.collectionTime || new Date().toISOString(),
          status: record.status || 'scheduled',
        };
        set((state) => ({
          collectionRecords: [...state.collectionRecords, newRecord],
        }));
        
        if (newRecord.status === 'completed') {
          useRecoveryPointsStore.getState().updateCurrentWeight(
            newRecord.recoveryPointId,
            newRecord.weightKg,
            false
          );
        }
      },
      
      completeCollection: (id, collector) => {
        const record = get().getCollectionRecord(id);
        if (!record) return;
        
        set((state) => ({
          collectionRecords: state.collectionRecords.map((r) =>
            r.id === id
              ? { ...r, status: 'completed', collector, collectionTime: new Date().toISOString() }
              : r
          ),
        }));
        
        useRecoveryPointsStore.getState().updateCurrentWeight(
          record.recoveryPointId,
          record.weightKg,
          false
        );
      },
      
      deleteCollectionRecord: (id) => {
        set((state) => ({
          collectionRecords: state.collectionRecords.filter((r) => r.id !== id),
        }));
      },
      
      getCollectionRecord: (id) => {
        return get().collectionRecords.find((r) => r.id === id);
      },
      
      getRecordsByRecoveryPoint: (recoveryPointId) => {
        return get().collectionRecords.filter(
          (r) => r.recoveryPointId === recoveryPointId
        );
      },
      
      getCompletedRecords: () => {
        return get().collectionRecords.filter((r) => r.status === 'completed');
      },
      
      resetMockData: () => {
        set({ collectionRecords: mockCollectionRecords });
      },
    }),
    {
      name: 'collection-records-storage',
    }
  )
);
