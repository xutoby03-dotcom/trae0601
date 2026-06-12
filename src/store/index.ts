import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Device, Borrow, Repair, DeviceStatus, BorrowStatus, RepairStatus, AccessoryItem, AppearanceStatus } from '@/types';
import { mockDevices, mockBorrows, mockRepairs } from '@/data/mockData';

function generateId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
}

function isOverdue(borrow: Borrow): boolean {
  if (borrow.status !== 'borrowing') return false;
  const today = new Date().toISOString().split('T')[0];
  return borrow.expectedReturnDate < today;
}

interface AppState {
  devices: Device[];
  borrows: Borrow[];
  repairs: Repair[];

  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => void;
  updateDevice: (id: string, updates: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  getDevice: (id: string) => Device | undefined;

  addBorrow: (borrow: Omit<Borrow, 'id' | 'status'>) => void;
  updateBorrow: (id: string, updates: Partial<Borrow>) => void;
  getBorrow: (id: string) => Borrow | undefined;
  returnBorrow: (
    id: string,
    checklist: {
      accessories: AccessoryItem[];
      appearance: AppearanceStatus;
      note?: string;
    }
  ) => { hasIssue: boolean; missingAccessories: string[] };

  addRepair: (repair: Omit<Repair, 'id' | 'status'>) => void;
  updateRepair: (id: string, updates: Partial<Repair>) => void;
  completeRepair: (id: string, data: { afterPhoto: string; cost?: number }) => void;
  getRepair: (id: string) => Repair | undefined;
  getDeviceRepairs: (deviceId: string) => Repair[];
  getDeviceBorrows: (deviceId: string) => Borrow[];
  getMostDamagedDevices: () => { device: Device; repairCount: number }[];

  refreshOverdueStatus: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      devices: mockDevices,
      borrows: mockBorrows.map((b) => ({ ...b, status: isOverdue(b) ? 'overdue' : b.status })),
      repairs: mockRepairs,

      addDevice: (device) =>
        set((state) => ({
          devices: [
            {
              ...device,
              id: generateId('d'),
              createdAt: new Date().toISOString(),
            },
            ...state.devices,
          ],
        })),

      updateDevice: (id, updates) =>
        set((state) => ({
          devices: state.devices.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        })),

      deleteDevice: (id) =>
        set((state) => ({
          devices: state.devices.filter((d) => d.id !== id),
        })),

      getDevice: (id) => get().devices.find((d) => d.id === id),

      addBorrow: (borrow) => {
        set((state) => ({
          borrows: [
            {
              ...borrow,
              id: generateId('b'),
              status: 'borrowing' as BorrowStatus,
            },
            ...state.borrows,
          ],
          devices: state.devices.map((d) =>
            d.id === borrow.deviceId ? { ...d, status: 'borrowed' as DeviceStatus } : d
          ),
        }));
      },

      updateBorrow: (id, updates) =>
        set((state) => ({
          borrows: state.borrows.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      getBorrow: (id) => get().borrows.find((b) => b.id === id),

      returnBorrow: (id, checklist) => {
        const state = get();
        const borrow = state.borrows.find((b) => b.id === id);
        if (!borrow) return { hasIssue: false, missingAccessories: [] };

        const missingAccessories = borrow.accessories
          .filter((a) => {
            const returned = checklist.accessories.find((ra) => ra.id === a.id);
            return returned ? !returned.checked : true;
          })
          .map((a) => a.name);

        const hasIssue = missingAccessories.length > 0 || checklist.appearance !== 'good';

        const newDeviceStatus: DeviceStatus = hasIssue ? 'repairing' : 'available';

        set({
          borrows: state.borrows.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: 'returned' as BorrowStatus,
                  actualReturnDate: new Date().toISOString().split('T')[0],
                  returnChecklist: checklist,
                }
              : b
          ),
          devices: state.devices.map((d) =>
            d.id === borrow.deviceId ? { ...d, status: newDeviceStatus } : d
          ),
        });

        return { hasIssue, missingAccessories };
      },

      addRepair: (repair) => {
        set((state) => ({
          repairs: [
            {
              ...repair,
              id: generateId('r'),
              status: 'repairing' as RepairStatus,
            },
            ...state.repairs,
          ],
          devices: state.devices.map((d) =>
            d.id === repair.deviceId ? { ...d, status: 'repairing' as DeviceStatus } : d
          ),
        }));
      },

      updateRepair: (id, updates) =>
        set((state) => ({
          repairs: state.repairs.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      completeRepair: (id, data) =>
        set((state) => {
          const repair = state.repairs.find((r) => r.id === id);
          if (!repair) return state;
          return {
            repairs: state.repairs.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: 'completed' as RepairStatus,
                    completeDate: new Date().toISOString().split('T')[0],
                    afterPhoto: data.afterPhoto,
                    cost: data.cost ?? r.cost,
                  }
                : r
            ),
            devices: state.devices.map((d) =>
              d.id === repair.deviceId ? { ...d, status: 'available' as DeviceStatus } : d
            ),
          };
        }),

      getRepair: (id) => get().repairs.find((r) => r.id === id),

      getDeviceRepairs: (deviceId) =>
        get().repairs.filter((r) => r.deviceId === deviceId),

      getDeviceBorrows: (deviceId) =>
        get().borrows.filter((b) => b.deviceId === deviceId),

      getMostDamagedDevices: () => {
        const state = get();
        const repairCounts = new Map<string, number>();
        state.repairs.forEach((r) => {
          repairCounts.set(r.deviceId, (repairCounts.get(r.deviceId) || 0) + 1);
        });
        return Array.from(repairCounts.entries())
          .map(([deviceId, repairCount]) => ({
            device: state.devices.find((d) => d.id === deviceId)!,
            repairCount,
          }))
          .filter((item) => item.device)
          .sort((a, b) => b.repairCount - a.repairCount);
      },

      refreshOverdueStatus: () =>
        set((state) => ({
          borrows: state.borrows.map((b) => ({
            ...b,
            status: isOverdue(b) ? 'overdue' : b.status,
          })),
        })),
    }),
    {
      name: 'equipment-lending-storage',
    }
  )
);
