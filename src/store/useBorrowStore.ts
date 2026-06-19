import { create } from 'zustand';
import type { BorrowRecord, BorrowStatus } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { initialBorrowRecords } from '@/utils/mockData';
import { formatDate, evaluateBoxCondition, isDateOverlap } from '@/utils/condition';

const STORAGE_KEY = 'borrowRecords';

interface BoxStoreType {
  getState: () => {
    updateBoxStatus: (id: string, status: string) => void;
    incrementUsageCount: (id: string) => void;
    updateBox: (id: string, data: { scrapReason?: string }) => void;
  };
}

interface BorrowStore {
  borrowRecords: BorrowRecord[];
  addBorrowRecord: (record: Omit<BorrowRecord, 'id' | 'createdAt' | 'status'>, useBoxStore: BoxStoreType) => void;
  updateBorrowRecord: (id: string, record: Partial<BorrowRecord>) => void;
  cancelBorrow: (id: string, useBoxStore: BoxStoreType) => void;
  confirmPickup: (id: string, useBoxStore: BoxStoreType) => void;
  confirmReturn: (id: string, checks: { damp: number; hole: number; tape: number; scrapReason?: string }, useBoxStore: BoxStoreType) => void;
  checkConflict: (boxId: string, startDate: string, endDate: string, excludeId?: string) => BorrowRecord[];
  getRecordsByBoxId: (boxId: string) => BorrowRecord[];
  getRecordsByStatus: (status: BorrowStatus | 'all') => BorrowRecord[];
  getPendingReturns: () => BorrowRecord[];
  getConflicts: () => Array<{ boxId: string; records: BorrowRecord[] }>;
}

export const useBorrowStore = create<BorrowStore>((set, get) => ({
  borrowRecords: loadFromStorage<BorrowRecord[]>(STORAGE_KEY, initialBorrowRecords),

  addBorrowRecord: (record, useBoxStore) => {
    const newRecord: BorrowRecord = {
      ...record,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: formatDate(new Date()),
    };
    const borrowRecords = [...get().borrowRecords, newRecord];
    set({ borrowRecords });
    saveToStorage(STORAGE_KEY, borrowRecords);
    useBoxStore.getState().updateBoxStatus(record.boxId, 'reserved');
  },

  updateBorrowRecord: (id, record) => {
    const borrowRecords = get().borrowRecords.map((r) =>
      r.id === id ? { ...r, ...record } : r
    );
    set({ borrowRecords });
    saveToStorage(STORAGE_KEY, borrowRecords);
  },

  cancelBorrow: (id, useBoxStore) => {
    const record = get().borrowRecords.find((r) => r.id === id);
    if (!record) return;

    const borrowRecords = get().borrowRecords.map((r) =>
      r.id === id ? { ...r, status: 'cancelled' as const } : r
    );
    set({ borrowRecords });
    saveToStorage(STORAGE_KEY, borrowRecords);

    const hasOtherActiveReservations = get().borrowRecords.some(
      (r) => r.boxId === record.boxId && r.id !== id && r.status !== 'cancelled' && r.status !== 'returned'
    );
    if (!hasOtherActiveReservations) {
      useBoxStore.getState().updateBoxStatus(record.boxId, 'available');
    }
  },

  confirmPickup: (id, useBoxStore) => {
    const record = get().borrowRecords.find((r) => r.id === id);
    if (!record) return;

    const borrowRecords = get().borrowRecords.map((r) =>
      r.id === id
        ? { ...r, status: 'picked_up' as const, actualPickupDate: formatDate(new Date()) }
        : r
    );
    set({ borrowRecords });
    saveToStorage(STORAGE_KEY, borrowRecords);
    useBoxStore.getState().updateBoxStatus(record.boxId, 'in_use');
  },

  confirmReturn: (id, checks, useBoxStore) => {
    const record = get().borrowRecords.find((r) => r.id === id);
    if (!record) return;

    const newStatus = evaluateBoxCondition(checks.damp, checks.hole, checks.tape);

    const borrowRecords = get().borrowRecords.map((r) =>
      r.id === id
        ? {
            ...r,
            status: 'returned' as const,
            actualReturnDate: formatDate(new Date()),
            dampCheck: checks.damp,
            holeCheck: checks.hole,
            tapeCheck: checks.tape,
            scrapReason: checks.scrapReason,
          }
        : r
    );
    set({ borrowRecords });
    saveToStorage(STORAGE_KEY, borrowRecords);

    useBoxStore.getState().incrementUsageCount(record.boxId);
    useBoxStore.getState().updateBoxStatus(record.boxId, newStatus);

    if (checks.scrapReason) {
      useBoxStore.getState().updateBox(record.boxId, { scrapReason: checks.scrapReason });
    }
  },

  checkConflict: (boxId, startDate, endDate, excludeId) => {
    const records = get().borrowRecords.filter(
      (r) =>
        r.boxId === boxId &&
        r.id !== excludeId &&
        r.status !== 'cancelled' &&
        r.status !== 'returned'
    );

    return records.filter((r) =>
      isDateOverlap(r.reserveStartDate, r.reserveEndDate, startDate, endDate)
    );
  },

  getRecordsByBoxId: (boxId) => {
    return get()
      .borrowRecords.filter((r) => r.boxId === boxId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getRecordsByStatus: (status) => {
    if (status === 'all') return get().borrowRecords;
    return get().borrowRecords.filter((r) => r.status === status);
  },

  getPendingReturns: () => {
    return get()
      .borrowRecords.filter((r) => r.status === 'picked_up')
      .sort((a, b) => new Date(a.reserveEndDate).getTime() - new Date(b.reserveEndDate).getTime());
  },

  getConflicts: () => {
    const activeRecords = get().borrowRecords.filter(
      (r) => r.status !== 'cancelled' && r.status !== 'returned'
    );

    const boxGroups = new Map<string, BorrowRecord[]>();
    activeRecords.forEach((r) => {
      if (!boxGroups.has(r.boxId)) {
        boxGroups.set(r.boxId, []);
      }
      boxGroups.get(r.boxId)!.push(r);
    });

    const conflicts: Array<{ boxId: string; records: BorrowRecord[] }> = [];

    boxGroups.forEach((records, boxId) => {
      for (let i = 0; i < records.length; i++) {
        for (let j = i + 1; j < records.length; j++) {
          if (
            isDateOverlap(
              records[i].reserveStartDate,
              records[i].reserveEndDate,
              records[j].reserveStartDate,
              records[j].reserveEndDate
            )
          ) {
            const existing = conflicts.find((c) => c.boxId === boxId);
            if (existing) {
              if (!existing.records.find((r) => r.id === records[i].id)) {
                existing.records.push(records[i]);
              }
              if (!existing.records.find((r) => r.id === records[j].id)) {
                existing.records.push(records[j]);
              }
            } else {
              conflicts.push({ boxId, records: [records[i], records[j]] });
            }
          }
        }
      }
    });

    return conflicts;
  },
}));
