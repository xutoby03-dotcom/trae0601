import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RepairOrder, RepairStatus, IssueType, Severity } from '../types';
import { mockRepairOrders } from '../mock/data';
import { useFurnitureStore } from './furnitureStore';

interface RepairState {
  repairOrders: RepairOrder[];
  addRepairOrder: (order: Omit<RepairOrder, 'id' | 'createdAt' | 'status'>) => void;
  updateRepairOrder: (id: string, data: Partial<RepairOrder>) => void;
  updateStatus: (id: string, status: RepairStatus) => void;
  getRepairById: (id: string) => RepairOrder | undefined;
  getRepairsByFurniture: (furnitureId: string) => RepairOrder[];
  getRepairsByStatus: (status: RepairStatus) => RepairOrder[];
}

const generateId = () => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const count = mockRepairOrders.filter((o) => o.id.includes(dateStr)).length + 1;
  return `BX-${dateStr}-${String(count).padStart(3, '0')}`;
};

export const useRepairStore = create<RepairState>()(
  persist(
    (set, get) => ({
      repairOrders: mockRepairOrders,

      addRepairOrder: (order) => {
        const newOrder: RepairOrder = {
          ...order,
          id: generateId(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          repairOrders: [newOrder, ...state.repairOrders],
        }));

        if (order.severity === 'high') {
          useFurnitureStore.getState().updateStatus(order.furnitureId, 'out_of_service');
        } else {
          useFurnitureStore.getState().updateStatus(order.furnitureId, 'pending_repair');
        }
      },

      updateRepairOrder: (id, data) => {
        set((state) => ({
          repairOrders: state.repairOrders.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
        }));
      },

      updateStatus: (id, status) => {
        set((state) => ({
          repairOrders: state.repairOrders.map((item) =>
            item.id === id ? { ...item, status } : item
          ),
        }));
      },

      getRepairById: (id) => {
        return get().repairOrders.find((item) => item.id === id);
      },

      getRepairsByFurniture: (furnitureId) => {
        return get().repairOrders.filter((item) => item.furnitureId === furnitureId);
      },

      getRepairsByStatus: (status) => {
        return get().repairOrders.filter((item) => item.status === status);
      },
    }),
    {
      name: 'repair-storage-v2',
    }
  )
);
