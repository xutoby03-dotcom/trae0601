import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LabCoat, Lending, DamageRecord, CleaningBatch, CoatSize, CoatStatus } from '../types';
import { mockCoats, mockLendings, mockDamageRecords, mockCleaningBatches } from '../data/mockData';
import { generateId, generateBatchNo, getTodayStr, isOverdue } from '../utils/helpers';

interface AppState {
  coats: LabCoat[];
  lendings: Lending[];
  damageRecords: DamageRecord[];
  cleaningBatches: CleaningBatch[];

  addCoat: (coat: Omit<LabCoat, 'id' | 'createdAt'>) => void;
  updateCoat: (id: string, updates: Partial<LabCoat>) => void;
  deleteCoat: (id: string) => void;

  addLending: (lending: Omit<Lending, 'id' | 'status' | 'createdAt'>) => void;
  returnLending: (lendingId: string, damageRecord: Omit<DamageRecord, 'id' | 'lendingId' | 'createdAt'>) => void;

  addCleaningBatch: (coatIds: string[], notes?: string) => void;
  completeCleaningBatch: (batchId: string) => void;

  getAvailableCoats: () => LabCoat[];
  getAvailableCoatsBySize: (size: CoatSize) => LabCoat[];
  getPendingCleaningCoats: () => LabCoat[];
  getOverdueLendings: () => Lending[];
  getActiveLendingForCoat: (coatId: string) => Lending | undefined;
  getLendingsForCoat: (coatId: string) => Lending[];
  getDamageRecordsForLending: (lendingId: string) => DamageRecord[];
  getDamageRecordsForCoat: (coatId: string) => DamageRecord[];
  getCleaningBatchesForCoat: (coatId: string) => CleaningBatch[];

  updateOverdueStatus: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      coats: mockCoats,
      lendings: mockLendings,
      damageRecords: mockDamageRecords,
      cleaningBatches: mockCleaningBatches,

      addCoat: (coat) => {
        const newCoat: LabCoat = {
          ...coat,
          id: generateId(),
          createdAt: getTodayStr(),
        };
        set((state) => ({ coats: [...state.coats, newCoat] }));
      },

      updateCoat: (id, updates) => {
        set((state) => ({
          coats: state.coats.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCoat: (id) => {
        set((state) => ({ coats: state.coats.filter((c) => c.id !== id) }));
      },

      addLending: (lending) => {
        const newLending: Lending = {
          ...lending,
          id: generateId(),
          status: 'active',
          createdAt: getTodayStr(),
        };
        set((state) => ({
          lendings: [...state.lendings, newLending],
          coats: state.coats.map((c) => (c.id === lending.coatId ? { ...c, status: 'in_use' as CoatStatus } : c)),
        }));
      },

      returnLending: (lendingId, damageRecord) => {
        const today = getTodayStr();
        const lending = get().lendings.find((l) => l.id === lendingId);
        if (!lending) return;

        const newDamageRecord: DamageRecord = {
          ...damageRecord,
          id: generateId(),
          lendingId,
          createdAt: today,
        };

        let newStatus: CoatStatus = 'available';
        if (damageRecord.needRepair) {
          newStatus = 'repairing';
        } else if (damageRecord.needCleaning) {
          newStatus = 'pending_cleaning';
        }

        set((state) => ({
          lendings: state.lendings.map((l) =>
            l.id === lendingId ? { ...l, status: 'returned' as const, actualReturn: today } : l
          ),
          damageRecords: [...state.damageRecords, newDamageRecord],
          coats: state.coats.map((c) => (c.id === lending.coatId ? { ...c, status: newStatus } : c)),
        }));
      },

      addCleaningBatch: (coatIds, notes) => {
        const newBatch: CleaningBatch = {
          id: generateId(),
          batchNo: generateBatchNo(),
          createdAt: getTodayStr(),
          status: 'cleaning',
          notes,
          coatIds,
        };
        set((state) => ({
          cleaningBatches: [...state.cleaningBatches, newBatch],
          coats: state.coats.map((c) =>
            coatIds.includes(c.id) ? { ...c, status: 'cleaning' as CoatStatus, lastCleaningBatchId: newBatch.id } : c
          ),
        }));
      },

      completeCleaningBatch: (batchId) => {
        const batch = get().cleaningBatches.find((b) => b.id === batchId);
        if (!batch) return;

        set((state) => ({
          cleaningBatches: state.cleaningBatches.map((b) =>
            b.id === batchId ? { ...b, status: 'completed' as const, completedAt: getTodayStr() } : b
          ),
          coats: state.coats.map((c) =>
            batch.coatIds.includes(c.id) ? { ...c, status: 'available' as CoatStatus } : c
          ),
        }));
      },

      getAvailableCoats: () => {
        return get().coats.filter((c) => c.status === 'available');
      },

      getAvailableCoatsBySize: (size) => {
        return get().coats.filter((c) => c.status === 'available' && c.size === size);
      },

      getPendingCleaningCoats: () => {
        return get().coats.filter((c) => c.status === 'pending_cleaning');
      },

      getOverdueLendings: () => {
        return get().lendings.filter((l) => l.status === 'active' && isOverdue(l.expectedReturn));
      },

      getActiveLendingForCoat: (coatId) => {
        return get().lendings.find((l) => l.coatId === coatId && l.status === 'active');
      },

      getLendingsForCoat: (coatId) => {
        return get().lendings.filter((l) => l.coatId === coatId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      },

      getDamageRecordsForLending: (lendingId) => {
        return get().damageRecords.filter((d) => d.lendingId === lendingId);
      },

      getDamageRecordsForCoat: (coatId) => {
        const coatLendings = get().getLendingsForCoat(coatId);
        const lendingIds = coatLendings.map((l) => l.id);
        return get().damageRecords.filter((d) => lendingIds.includes(d.lendingId));
      },

      getCleaningBatchesForCoat: (coatId) => {
        return get().cleaningBatches.filter((b) => b.coatIds.includes(coatId));
      },

      updateOverdueStatus: () => {
        set((state) => ({
          lendings: state.lendings.map((l) =>
            l.status === 'active' && isOverdue(l.expectedReturn) ? { ...l, status: 'overdue' as const } : l
          ),
        }));
      },
    }),
    {
      name: 'lab-coat-management-storage',
    }
  )
);
