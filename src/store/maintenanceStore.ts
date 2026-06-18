import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MaintenanceRecord, MaintenanceStatus } from '../types';
import { mockMaintenanceRecords } from '../mock/data';
import { useFurnitureStore } from './furnitureStore';
import { useRepairStore } from './repairStore';

interface MaintenanceState {
  records: MaintenanceRecord[];
  addRecord: (record: Omit<MaintenanceRecord, 'id' | 'createdAt' | 'status'>) => void;
  updateRecord: (id: string, data: Partial<MaintenanceRecord>) => void;
  updateStatus: (id: string, status: MaintenanceStatus) => void;
  completeMaintenance: (
    id: string,
    data: { handler: string; parts: string; cost: number; reviewPhotos: string[] }
  ) => void;
  getRecordById: (id: string) => MaintenanceRecord | undefined;
  getRecordsByFurniture: (furnitureId: string) => MaintenanceRecord[];
  getRecordsByStatus: (status: MaintenanceStatus) => MaintenanceRecord[];
}

const generateId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `WX-${timestamp}-${random}`;
};

export const useMaintenanceStore = create<MaintenanceState>()(
  persist(
    (set, get) => ({
      records: mockMaintenanceRecords,

      addRecord: (record) => {
        const newRecord: MaintenanceRecord = {
          ...record,
          id: generateId(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          records: [newRecord, ...state.records],
        }));
        useFurnitureStore.getState().updateStatus(record.furnitureId, 'under_maintenance');
      },

      updateRecord: (id, data) => {
        set((state) => ({
          records: state.records.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
        }));
      },

      updateStatus: (id, status) => {
        set((state) => ({
          records: state.records.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        }));

        const record = get().getRecordById(id);
        if (record) {
          if (status === 'in_progress') {
            useFurnitureStore.getState().updateStatus(record.furnitureId, 'under_maintenance');
          }
        }
      },

      completeMaintenance: (id, data) => {
        set((state) => ({
          records: state.records.map((item) =>
            item.id === id
              ? {
                  ...item,
                  ...data,
                  status: 'completed',
                  finishDate: new Date().toISOString().slice(0, 10),
                }
              : item
          ),
        }));

        const record = get().getRecordById(id);
        if (record) {
          useFurnitureStore.getState().updateStatus(record.furnitureId, 'normal');
          if (record.repairOrderId) {
            useRepairStore.getState().updateStatus(record.repairOrderId, 'completed');
          }
        }
      },

      getRecordById: (id) => {
        return get().records.find((item) => item.id === id);
      },

      getRecordsByFurniture: (furnitureId) => {
        return get().records.filter((item) => item.furnitureId === furnitureId);
      },

      getRecordsByStatus: (status) => {
        return get().records.filter((item) => item.status === status);
      },
    }),
    {
      name: 'maintenance-storage-v2',
    }
  )
);
