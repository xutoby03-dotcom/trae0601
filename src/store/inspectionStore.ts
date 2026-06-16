import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Inspection, LossItem } from '@/types';
import { mockInspections } from '@/utils/mockData';
import { generateId } from '@/utils/format';
import { useFreezerStore } from './freezerStore';

interface InspectionStore {
  inspections: Inspection[];
  getInspectionById: (id: string) => Inspection | undefined;
  getInspectionsByFreezer: (freezerId: string) => Inspection[];
  addInspection: (inspection: Omit<Inspection, 'id' | 'isAbnormal' | 'createdAt'>) => void;
  generateAffectedItems: (freezerId: string, softeningLevel: string) => LossItem[];
}

export const useInspectionStore = create<InspectionStore>()(
  persist(
    (set, get) => ({
      inspections: mockInspections,

      getInspectionById: (id) => {
        return get().inspections.find((i) => i.id === id);
      },

      getInspectionsByFreezer: (freezerId) => {
        return get().inspections
          .filter((i) => i.freezerId === freezerId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      addInspection: (inspection) => {
        const freezer = useFreezerStore.getState().getFreezerById(inspection.freezerId);
        const isAbnormal = freezer
          ? inspection.temperature > freezer.maxTemp || inspection.temperature < freezer.minTemp
          : false;

        const newInspection: Inspection = {
          ...inspection,
          id: generateId(),
          isAbnormal,
          createdAt: new Date().toISOString(),
        };

        set({ inspections: [newInspection, ...get().inspections] });

        if (isAbnormal && freezer) {
          const status = inspection.temperature > freezer.maxTemp + 3 ? 'abnormal' : 'warning';
          useFreezerStore.getState().updateFreezerStatus(inspection.freezerId, status);
        }
      },

      generateAffectedItems: (freezerId, softeningLevel) => {
        const freezer = useFreezerStore.getState().getFreezerById(freezerId);
        if (!freezer) return [];

        const ratioMap: Record<string, number> = {
          mild: 0.2,
          moderate: 0.5,
          severe: 0.8,
        };

        const ratio = ratioMap[softeningLevel] || 0.3;
        const items: LossItem[] = [];

        freezer.zones.forEach((zone) => {
          zone.products.forEach((product) => {
            const affectedQty = Math.ceil(product.stock * ratio);
            if (affectedQty > 0) {
              items.push({
                id: generateId(),
                productId: product.id,
                brand: product.brand,
                flavor: product.flavor,
                category: product.category,
                quantity: affectedQty,
                unitPrice: product.costPrice,
                subtotal: product.costPrice * affectedQty,
              });
            }
          });
        });

        return items;
      },
    }),
    {
      name: 'inspection-storage',
    }
  )
);
