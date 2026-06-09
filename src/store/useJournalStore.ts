import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Material, UsageRecord, UsageItem, Inspiration, InspirationItem } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

interface JournalStore {
  materials: Material[];
  usageRecords: UsageRecord[];
  usageItems: UsageItem[];
  inspirations: Inspiration[];
  inspirationItems: InspirationItem[];

  addMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMaterial: (id: string, data: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;

  addUsageRecord: (record: Omit<UsageRecord, 'id' | 'createdAt'>, items: { materialId: string; quantityUsed: number }[]) => void;
  deleteUsageRecord: (id: string) => void;

  addInspiration: (inspiration: Omit<Inspiration, 'id' | 'createdAt'>, materialIds: string[]) => void;
  updateInspiration: (id: string, data: Partial<Inspiration>, materialIds?: string[]) => void;
  deleteInspiration: (id: string) => void;
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set) => ({
      materials: [],
      usageRecords: [],
      usageItems: [],
      inspirations: [],
      inspirationItems: [],

      addMaterial: (material) =>
        set((state) => ({
          materials: [
            ...state.materials,
            {
              ...material,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateMaterial: (id, data) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
          ),
        })),

      deleteMaterial: (id) =>
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
          usageItems: state.usageItems.filter((ui) => ui.materialId !== id),
          inspirationItems: state.inspirationItems.filter((ii) => ii.materialId !== id),
        })),

      addUsageRecord: (record, items) =>
        set((state) => {
          const recordId = generateId();
          const newUsageItems: UsageItem[] = items.map((item) => {
            const material = state.materials.find((m) => m.id === item.materialId);
            const capped = material ? Math.min(item.quantityUsed, material.quantity) : item.quantityUsed;
            return {
              id: generateId(),
              usageRecordId: recordId,
              materialId: item.materialId,
              quantityUsed: capped,
            };
          });

          const updatedMaterials = state.materials.map((m) => {
            const usageItem = newUsageItems.find((ui) => ui.materialId === m.id);
            if (usageItem && usageItem.quantityUsed > 0) {
              return { ...m, quantity: m.quantity - usageItem.quantityUsed, updatedAt: new Date().toISOString() };
            }
            return m;
          });

          return {
            usageRecords: [
              { ...record, id: recordId, createdAt: new Date().toISOString() },
              ...state.usageRecords,
            ],
            usageItems: [...newUsageItems, ...state.usageItems],
            materials: updatedMaterials,
          };
        }),

      deleteUsageRecord: (id) =>
        set((state) => {
          const itemsToRemove = state.usageItems.filter((ui) => ui.usageRecordId === id);
          const updatedMaterials = state.materials.map((m) => {
            const restoreItem = itemsToRemove.find((ui) => ui.materialId === m.id);
            if (restoreItem) {
              return { ...m, quantity: m.quantity + restoreItem.quantityUsed, updatedAt: new Date().toISOString() };
            }
            return m;
          });
          return {
            usageRecords: state.usageRecords.filter((r) => r.id !== id),
            usageItems: state.usageItems.filter((ui) => ui.usageRecordId !== id),
            materials: updatedMaterials,
          };
        }),

      addInspiration: (inspiration, materialIds) =>
        set((state) => {
          const inspirationId = generateId();
          return {
            inspirations: [
              { ...inspiration, id: inspirationId, createdAt: new Date().toISOString() },
              ...state.inspirations,
            ],
            inspirationItems: [
              ...materialIds.map((mid) => ({
                id: generateId(),
                inspirationId,
                materialId: mid,
              })),
              ...state.inspirationItems,
            ],
          };
        }),

      updateInspiration: (id, data, materialIds) =>
        set((state) => ({
          inspirations: state.inspirations.map((i) =>
            i.id === id ? { ...i, ...data } : i
          ),
          inspirationItems: materialIds
            ? [
                ...state.inspirationItems.filter((ii) => ii.inspirationId !== id),
                ...materialIds.map((mid) => ({
                  id: generateId(),
                  inspirationId: id,
                  materialId: mid,
                })),
              ]
            : state.inspirationItems,
        })),

      deleteInspiration: (id) =>
        set((state) => ({
          inspirations: state.inspirations.filter((i) => i.id !== id),
          inspirationItems: state.inspirationItems.filter((ii) => ii.inspirationId !== id),
        })),
    }),
    {
      name: 'journal-inventory-storage',
    }
  )
);
