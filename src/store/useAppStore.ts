import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Material, Delivery, AfterSale } from '@/types';
import { mockMaterials, mockDeliveries, mockAfterSales } from '@/utils/mockData';
import { generateId } from '@/utils/helpers';

interface AppState {
  materials: Material[];
  deliveries: Delivery[];
  afterSales: AfterSale[];
  
  addMaterial: (material: Omit<Material, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMaterial: (id: string, material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  
  addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt'>) => void;
  updateDelivery: (id: string, delivery: Partial<Delivery>) => void;
  deleteDelivery: (id: string) => void;
  
  addAfterSale: (afterSale: Omit<AfterSale, 'id' | 'createdAt'>) => void;
  updateAfterSale: (id: string, afterSale: Partial<AfterSale>) => void;
  deleteAfterSale: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      materials: mockMaterials,
      deliveries: mockDeliveries,
      afterSales: mockAfterSales,
      
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
      
      updateMaterial: (id, material) =>
        set((state) => ({
          materials: state.materials.map((m) =>
            m.id === id
              ? { ...m, ...material, updatedAt: new Date().toISOString() }
              : m
          ),
        })),
      
      deleteMaterial: (id) =>
        set((state) => ({
          materials: state.materials.filter((m) => m.id !== id),
          deliveries: state.deliveries.filter((d) => d.materialId !== id),
          afterSales: state.afterSales.filter((a) => a.materialId !== id),
        })),
      
      addDelivery: (delivery) =>
        set((state) => ({
          deliveries: [
            ...state.deliveries,
            {
              ...delivery,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      
      updateDelivery: (id, delivery) =>
        set((state) => ({
          deliveries: state.deliveries.map((d) =>
            d.id === id ? { ...d, ...delivery } : d
          ),
        })),
      
      deleteDelivery: (id) =>
        set((state) => ({
          deliveries: state.deliveries.filter((d) => d.id !== id),
        })),
      
      addAfterSale: (afterSale) =>
        set((state) => ({
          afterSales: [
            ...state.afterSales,
            {
              ...afterSale,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      
      updateAfterSale: (id, afterSale) =>
        set((state) => ({
          afterSales: state.afterSales.map((a) =>
            a.id === id ? { ...a, ...afterSale } : a
          ),
        })),
      
      deleteAfterSale: (id) =>
        set((state) => ({
          afterSales: state.afterSales.filter((a) => a.id !== id),
        })),
    }),
    {
      name: 'material-tracker-data',
    }
  )
);
