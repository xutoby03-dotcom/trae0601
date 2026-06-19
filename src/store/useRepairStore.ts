import { create } from 'zustand';
import type { Repair } from '@/types';
import { mockRepairs } from '@/utils/mockData';
import { persist } from 'zustand/middleware';

interface RepairState {
  repairs: Repair[];
  addRepair: (repair: Omit<Repair, 'id'>) => Repair;
  updateRepair: (id: string, repair: Partial<Repair>) => void;
  deleteRepair: (id: string) => void;
  getRepair: (id: string) => Repair | undefined;
  getRepairsByRoom: (roomId: string) => Repair[];
  getActiveRepairs: () => Repair[];
  getRepairsByStatus: (status: Repair['status']) => Repair[];
  getRepairsBySourceId: (sourceId: string) => Repair[];
}

export const useRepairStore = create<RepairState>()(
  persist(
    (set, get) => ({
      repairs: mockRepairs,
      addRepair: (repairData) => {
        const newRepair: Repair = {
          ...repairData,
          id: `repair-${Date.now()}`,
        };
        set((state) => ({ repairs: [newRepair, ...state.repairs] }));
        return newRepair;
      },
      updateRepair: (id, repairData) => {
        set((state) => ({
          repairs: state.repairs.map((repair) =>
            repair.id === id ? { ...repair, ...repairData } : repair
          ),
        }));
      },
      deleteRepair: (id) => {
        set((state) => ({
          repairs: state.repairs.filter((repair) => repair.id !== id),
        }));
      },
      getRepair: (id) => {
        return get().repairs.find((repair) => repair.id === id);
      },
      getRepairsByRoom: (roomId) => {
        return get()
          .repairs.filter((repair) => repair.roomId === roomId)
          .sort(
            (a, b) =>
              new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
          );
      },
      getActiveRepairs: () => {
        return get().repairs.filter(
          (repair) =>
            repair.status === 'pending' ||
            repair.status === 'assigned' ||
            repair.status === 'in_progress'
        );
      },
      getRepairsByStatus: (status) => {
        return get().repairs.filter((repair) => repair.status === status);
      },
      getRepairsBySourceId: (sourceId) => {
        return get()
          .repairs.filter((repair) => repair.sourceId === sourceId)
          .sort(
            (a, b) =>
              new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
          );
      },
    }),
    {
      name: 'water-heater-repairs',
    }
  )
);
