import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Equipment, UsageRecord } from '@/types';
import { mockEquipment, mockUsageRecords } from '@/data/mockData';
import { generateId, today } from '@/utils/date';

interface AppState {
  equipment: Equipment[];
  usageRecords: UsageRecord[];

  addEquipment: (data: Omit<Equipment, 'id' | 'createdAt'>) => void;
  updateEquipment: (id: string, data: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  getEquipmentById: (id: string) => Equipment | undefined;
  markMaintenanceDone: (id: string) => void;

  addUsageRecord: (data: Omit<UsageRecord, 'id'>) => void;
  deleteUsageRecord: (id: string) => void;
  getUsageRecordsByEquipment: (equipmentId: string) => UsageRecord[];

  resetData: () => void;
}

const initialEquipment: Equipment[] = [...mockEquipment];
const initialUsageRecords: UsageRecord[] = [...mockUsageRecords];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      equipment: initialEquipment,
      usageRecords: initialUsageRecords,

      addEquipment: (data) =>
        set((state) => ({
          equipment: [
            {
              ...data,
              id: generateId(),
              createdAt: today(),
            },
            ...state.equipment,
          ],
        })),

      updateEquipment: (id, data) =>
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        })),

      deleteEquipment: (id) =>
        set((state) => ({
          equipment: state.equipment.filter((e) => e.id !== id),
          usageRecords: state.usageRecords.filter((r) => r.equipmentId !== id),
        })),

      getEquipmentById: (id) => get().equipment.find((e) => e.id === id),

      markMaintenanceDone: (id) =>
        set((state) => ({
          equipment: state.equipment.map((e) =>
            e.id === id
              ? { ...e, lastMaintenanceDate: today(), status: 'good' }
              : e
          ),
        })),

      addUsageRecord: (data) =>
        set((state) => ({
          usageRecords: [
            {
              ...data,
              id: generateId(),
            },
            ...state.usageRecords,
          ].sort((a, b) => (a.date < b.date ? 1 : -1)),
        })),

      deleteUsageRecord: (id) =>
        set((state) => ({
          usageRecords: state.usageRecords.filter((r) => r.id !== id),
        })),

      getUsageRecordsByEquipment: (equipmentId) =>
        get().usageRecords.filter((r) => r.equipmentId === equipmentId),

      resetData: () =>
        set({
          equipment: [...initialEquipment],
          usageRecords: [...initialUsageRecords],
        }),
    }),
    {
      name: 'sport-equipment-storage',
    }
  )
);
