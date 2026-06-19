import { create } from 'zustand';
import type { CleaningRecord } from '../types';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/helpers';

interface CleaningState {
  cleaningRecords: CleaningRecord[];
  loading: boolean;
  fetchCleaningRecords: () => void;
  addCleaningRecord: (record: Omit<CleaningRecord, 'id' | 'createdAt'>) => void;
  updateCleaningRecord: (id: string, record: Partial<CleaningRecord>) => void;
  deleteCleaningRecord: (id: string) => void;
  getRecordsByBoxId: (boxId: string) => CleaningRecord[];
  getRecordsByDate: (date: string) => CleaningRecord[];
}

export const useCleaningStore = create<CleaningState>((set, get) => ({
  cleaningRecords: [],
  loading: false,

  fetchCleaningRecords: () => {
    const records = getFromStorage<CleaningRecord[]>(STORAGE_KEYS.CLEANING_RECORDS, []);
    set({ cleaningRecords: records });
  },

  addCleaningRecord: (recordData) => {
    const newRecord: CleaningRecord = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const cleaningRecords = [...get().cleaningRecords, newRecord];
    set({ cleaningRecords });
    setToStorage(STORAGE_KEYS.CLEANING_RECORDS, cleaningRecords);
  },

  updateCleaningRecord: (id, recordData) => {
    const cleaningRecords = get().cleaningRecords.map((r) =>
      r.id === id ? { ...r, ...recordData } : r
    );
    set({ cleaningRecords });
    setToStorage(STORAGE_KEYS.CLEANING_RECORDS, cleaningRecords);
  },

  deleteCleaningRecord: (id) => {
    const cleaningRecords = get().cleaningRecords.filter((r) => r.id !== id);
    set({ cleaningRecords });
    setToStorage(STORAGE_KEYS.CLEANING_RECORDS, cleaningRecords);
  },

  getRecordsByBoxId: (boxId) => {
    return get().cleaningRecords
      .filter((r) => r.boxId === boxId)
      .sort((a, b) => new Date(b.cleaningDate).getTime() - new Date(a.cleaningDate).getTime());
  },

  getRecordsByDate: (date) => {
    return get().cleaningRecords.filter((r) => r.cleaningDate === date);
  },
}));
