import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Material, InventoryLog, InventoryLogType } from '../types';
import { mockMaterials, mockInventoryLogs } from '../data/mockData';

interface MaterialState {
  materials: Material[];
  inventoryLogs: InventoryLog[];
  addMaterial: (material: Omit<Material, 'id' | 'createdAt'>) => void;
  updateMaterial: (id: string, data: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  adjustInventory: (materialId: string, type: InventoryLogType, quantity: number, reason: string, operator: string) => void;
  getMaterialById: (id: string) => Material | undefined;
  decrementInventory: (materialId: string, quantity: number) => void;
}

export const useMaterialStore = create<MaterialState>()(
  persist(
    (set, get) => ({
      materials: mockMaterials,
      inventoryLogs: mockInventoryLogs,

      addMaterial: (material) => set((state) => ({
        materials: [
          ...state.materials,
          {
            ...material,
            id: `m-${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
        ],
      })),

      updateMaterial: (id, data) => set((state) => ({
        materials: state.materials.map((m) =>
          m.id === id ? { ...m, ...data } : m
        ),
      })),

      deleteMaterial: (id) => set((state) => ({
        materials: state.materials.filter((m) => m.id !== id),
      })),

      adjustInventory: (materialId, type, quantity, reason, operator) => {
        const state = get();
        const material = state.materials.find((m) => m.id === materialId);
        if (!material) return;

        const adjustment = type === 'reissue' ? -quantity : -quantity;

        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === materialId
              ? { ...m, remainingQuantity: Math.max(0, m.remainingQuantity + adjustment) }
              : m
          ),
          inventoryLogs: [
            {
              id: `log-${Date.now()}`,
              materialId,
              type,
              quantity,
              reason,
              operator,
              createdAt: new Date().toISOString(),
            },
            ...state.inventoryLogs,
          ],
        }));
      },

      getMaterialById: (id) => get().materials.find((m) => m.id === id),

      decrementInventory: (materialId, quantity) => set((state) => ({
        materials: state.materials.map((m) =>
          m.id === materialId
            ? { ...m, remainingQuantity: Math.max(0, m.remainingQuantity - quantity) }
            : m
        ),
      })),
    }),
    {
      name: 'material-storage',
    }
  )
);
