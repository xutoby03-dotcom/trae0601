import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Canopy, BorrowRecord, RepairRecord, BorrowItem, RepairIssueType, AccessoryType } from '@/types';
import { initialCanopies, initialBorrowRecords, initialRepairRecords } from '@/data/mockData';

interface ReturnData {
  returnedItems: BorrowItem;
  isWet: boolean;
}

interface CreateRepairData {
  canopyId: string;
  borrowRecordId?: string;
  issueType: RepairIssueType;
  accessoryType?: AccessoryType;
  description: string;
}

interface StoreState {
  canopies: Canopy[];
  borrowRecords: BorrowRecord[];
  repairRecords: RepairRecord[];

  createBorrowRecord: (data: Omit<BorrowRecord, 'id' | 'status'>) => void;
  returnBorrowRecord: (id: string, data: ReturnData) => void;
  createRepairRecord: (data: CreateRepairData) => void;
  fixRepairRecord: (id: string) => void;
  markCanopyDry: (canopyId: string) => void;
  resetStore: () => void;
}

function generateId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
}

function hasMissingOrDamage(borrowed: BorrowItem, returned: BorrowItem): boolean {
  return (
    borrowed.tarp !== returned.tarp ||
    borrowed.pole !== returned.pole ||
    borrowed.bar !== returned.bar ||
    borrowed.stake !== returned.stake ||
    borrowed.bag !== returned.bag
  );
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      canopies: initialCanopies,
      borrowRecords: initialBorrowRecords,
      repairRecords: initialRepairRecords,

      createBorrowRecord: (data) => {
        const newRecord: BorrowRecord = {
          ...data,
          id: generateId('br'),
          status: 'active',
        };
        set((state) => ({
          borrowRecords: [...state.borrowRecords, newRecord],
          canopies: state.canopies.map((c) =>
            c.id === data.canopyId ? { ...c, status: 'borrowed' } : c
          ),
        }));
      },

      returnBorrowRecord: (id, data) => {
        const record = get().borrowRecords.find((r) => r.id === id);
        if (!record) return;

        const now = new Date().toISOString();
        const overdue = new Date(now) > new Date(record.dueTime);
        const hasDamage = hasMissingOrDamage(record.borrowedItems, data.returnedItems);

        let newStatus: Canopy['status'] = 'available';
        if (data.isWet) newStatus = 'drying';
        if (hasDamage) newStatus = 'repairing';

        set((state) => ({
          borrowRecords: state.borrowRecords.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: 'returned',
                  returnTime: now,
                  returnedItems: data.returnedItems,
                  isWet: data.isWet,
                  isOverdue: overdue,
                }
              : r
          ),
          canopies: state.canopies.map((c) =>
            c.id === record.canopyId ? { ...c, status: newStatus } : c
          ),
        }));
      },

      createRepairRecord: (data) => {
        const newRepair: RepairRecord = {
          ...data,
          id: generateId('rp'),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          repairRecords: [...state.repairRecords, newRepair],
          canopies: state.canopies.map((c) =>
            c.id === data.canopyId ? { ...c, status: 'repairing' } : c
          ),
        }));
      },

      fixRepairRecord: (id) => {
        const repair = get().repairRecords.find((r) => r.id === id);
        if (!repair) return;

        set((state) => {
          const updatedRepairs = state.repairRecords.map((r) =>
            r.id === id ? { ...r, status: 'fixed' as const } : r
          );
          const canopyHasPending = updatedRepairs.some(
            (r) => r.canopyId === repair.canopyId && r.status === 'pending'
          );
          const canopy = state.canopies.find((c) => c.id === repair.canopyId);
          const isDrying = canopy?.status === 'drying';
          const newCanopyStatus: Canopy['status'] = canopyHasPending
            ? 'repairing'
            : isDrying
            ? 'drying'
            : 'available';

          return {
            repairRecords: updatedRepairs,
            canopies: state.canopies.map((c) =>
              c.id === repair.canopyId ? { ...c, status: newCanopyStatus } : c
            ),
          };
        });
      },

      markCanopyDry: (canopyId) => {
        set((state) => {
          const hasPendingRepairs = state.repairRecords.some(
            (r) => r.canopyId === canopyId && r.status === 'pending'
          );
          const newStatus: Canopy['status'] = hasPendingRepairs ? 'repairing' : 'available';
          return {
            canopies: state.canopies.map((c) =>
              c.id === canopyId ? { ...c, status: newStatus } : c
            ),
          };
        });
      },

      resetStore: () => {
        set({
          canopies: initialCanopies,
          borrowRecords: initialBorrowRecords,
          repairRecords: initialRepairRecords,
        });
      },
    }),
    {
      name: 'canopy-borrow-store',
    }
  )
);
