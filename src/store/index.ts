import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Canopy, BorrowRecord, RepairRecord, BorrowItem, RepairIssueType, AccessoryType } from '@/types';
import { ACCESSORY_META } from '@/types';
import { initialCanopies, initialBorrowRecords, initialRepairRecords } from '@/data/mockData';

const ACCESSORY_UNIT: Record<AccessoryType, string> = {
  tarp: '块',
  pole: '根',
  bar: '根',
  stake: '根',
  bag: '个',
};

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

export function formatMissingDescription(
  description: string,
  issueType: RepairIssueType,
  accessoryType?: AccessoryType
): string {
  if (issueType !== 'missing' || !accessoryType) return description;
  if (/^少了\d+/.test(description)) return description;
  const match = description.match(/(\d+)/);
  const qty = match ? parseInt(match[1], 10) : 1;
  return `少了${qty}${ACCESSORY_UNIT[accessoryType]}${ACCESSORY_META[accessoryType].name}`;
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
        const borrowed = record.borrowedItems;
        const returned = data.returnedItems;
        const accessoryTypes: AccessoryType[] = ['tarp', 'pole', 'bar', 'stake', 'bag'];

        const missingRepairs: RepairRecord[] = [];
        accessoryTypes.forEach((type) => {
          const diff = borrowed[type] - returned[type];
          if (diff > 0) {
            missingRepairs.push({
              id: generateId('rp'),
              canopyId: record.canopyId,
              borrowRecordId: record.id,
              issueType: 'missing',
              accessoryType: type,
              description: `少了${diff}${ACCESSORY_UNIT[type]}${ACCESSORY_META[type].name}`,
              status: 'pending',
              createdAt: now,
            });
          }
        });

        const hasMissing = missingRepairs.length > 0;
        let newStatus: Canopy['status'] = 'available';
        if (data.isWet) newStatus = 'drying';
        if (hasMissing) newStatus = 'repairing';

        set((state) => {
          const updatedAccessories: Record<AccessoryType, number> = {
            tarp: state.canopies.find((c) => c.id === record.canopyId)?.accessories.tarp || 0,
            pole: state.canopies.find((c) => c.id === record.canopyId)?.accessories.pole || 0,
            bar: state.canopies.find((c) => c.id === record.canopyId)?.accessories.bar || 0,
            stake: state.canopies.find((c) => c.id === record.canopyId)?.accessories.stake || 0,
            bag: state.canopies.find((c) => c.id === record.canopyId)?.accessories.bag || 0,
          };
          accessoryTypes.forEach((type) => {
            const diff = borrowed[type] - returned[type];
            if (diff > 0) {
              updatedAccessories[type] = Math.max(0, updatedAccessories[type] - diff);
            }
          });

          return {
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
              c.id === record.canopyId
                ? { ...c, status: newStatus, accessories: updatedAccessories }
                : c
            ),
            repairRecords: [...state.repairRecords, ...missingRepairs],
          };
        });
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
      version: 1,
      migrate: (persistedState: any, version) => {
        if (!persistedState) return persistedState;
        if (version < 1 && Array.isArray(persistedState.repairRecords)) {
          persistedState.repairRecords = persistedState.repairRecords.map(
            (r: RepairRecord) => ({
              ...r,
              description: formatMissingDescription(
                r.description,
                r.issueType,
                r.accessoryType
              ),
            })
          );
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.repairRecords = state.repairRecords.map((r: RepairRecord) => ({
          ...r,
          description: formatMissingDescription(
            r.description,
            r.issueType,
            r.accessoryType
          ),
        }));
      },
    }
  )
);
