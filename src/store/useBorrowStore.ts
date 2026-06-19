import { create } from 'zustand';
import type { BorrowRecord } from '@/types';
import { getStorage, setStorage } from '@/utils/storage';
import { mockBorrowRecords } from '@/utils/mockData';
import { useScoreStore } from './useScoreStore';

const STORAGE_KEY = 'chorus_borrow_records';

interface BorrowState {
  borrowRecords: BorrowRecord[];
  fetchBorrowRecords: () => void;
  addBorrowRecord: (record: Omit<BorrowRecord, 'id' | 'created_at' | 'status'>) => void;
  returnBorrowRecord: (id: string, returnData: Partial<BorrowRecord>) => void;
  getBorrowRecordById: (id: string) => BorrowRecord | undefined;
  getActiveBorrows: () => BorrowRecord[];
  getBorrowsByScore: (scoreId: string) => BorrowRecord[];
  getBorrowsByMember: (memberId: string) => BorrowRecord[];
}

const initializeBorrowRecords = (): BorrowRecord[] => {
  const stored = getStorage<BorrowRecord[] | null>(STORAGE_KEY, null);
  if (stored && stored.length > 0) {
    return stored;
  }
  setStorage(STORAGE_KEY, mockBorrowRecords);
  return mockBorrowRecords;
};

export const useBorrowStore = create<BorrowState>((set, get) => ({
  borrowRecords: initializeBorrowRecords(),

  fetchBorrowRecords: () => {
    const borrowRecords = getStorage<BorrowRecord[]>(STORAGE_KEY, []);
    set({ borrowRecords });
  },

  addBorrowRecord: (recordData) => {
    const now = new Date().toISOString();
    const newRecord: BorrowRecord = {
      ...recordData,
      id: `borrow-${Date.now()}`,
      status: '借阅中',
      created_at: now,
    };
    const borrowRecords = [...get().borrowRecords, newRecord];
    set({ borrowRecords });
    setStorage(STORAGE_KEY, borrowRecords);

    const scoreStore = useScoreStore.getState();
    const score = scoreStore.getScoreById(recordData.score_id);
    if (score) {
      scoreStore.updateScore(recordData.score_id, {
        available_stock: score.available_stock - 1,
      });
    }
  },

  returnBorrowRecord: (id, returnData) => {
    const borrowRecords: BorrowRecord[] = get().borrowRecords.map((record) =>
      record.id === id
        ? {
            ...record,
            ...returnData,
            status: '已归还' as const,
            actual_return_date: returnData.actual_return_date || new Date().toISOString(),
          }
        : record
    );
    set({ borrowRecords });
    setStorage(STORAGE_KEY, borrowRecords);

    const record = get().getBorrowRecordById(id);
    if (record) {
      const scoreStore = useScoreStore.getState();
      const score = scoreStore.getScoreById(record.score_id);
      if (score) {
        scoreStore.updateScore(record.score_id, {
          available_stock: score.available_stock + 1,
        });
      }
    }
  },

  getBorrowRecordById: (id) => {
    return get().borrowRecords.find((record) => record.id === id);
  },

  getActiveBorrows: () => {
    return get().borrowRecords.filter(
      (record) => record.status === '借阅中' || record.status === '逾期'
    );
  },

  getBorrowsByScore: (scoreId) => {
    return get().borrowRecords.filter((record) => record.score_id === scoreId);
  },

  getBorrowsByMember: (memberId) => {
    return get().borrowRecords.filter((record) => record.member_id === memberId);
  },
}));
