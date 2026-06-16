import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Freezer, Zone, Product } from '@/types';
import { mockFreezers } from '@/utils/mockData';
import { generateId } from '@/utils/format';

interface FreezerStore {
  freezers: Freezer[];
  getFreezerById: (id: string) => Freezer | undefined;
  addFreezer: (freezer: Omit<Freezer, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateFreezer: (id: string, freezer: Partial<Freezer>) => void;
  deleteFreezer: (id: string) => void;
  updateFreezerStatus: (id: string, status: Freezer['status']) => void;
  getProductsByFreezer: (freezerId: string) => Product[];
  addZone: (freezerId: string, zone: Omit<Zone, 'id'>) => void;
  updateZone: (freezerId: string, zoneId: string, zone: Partial<Zone>) => void;
  deleteZone: (freezerId: string, zoneId: string) => void;
}

export const useFreezerStore = create<FreezerStore>()(
  persist(
    (set, get) => ({
      freezers: mockFreezers,

      getFreezerById: (id) => {
        return get().freezers.find((f) => f.id === id);
      },

      addFreezer: (freezer) => {
        const newFreezer: Freezer = {
          ...freezer,
          id: generateId(),
          status: 'normal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ freezers: [...get().freezers, newFreezer] });
      },

      updateFreezer: (id, freezer) => {
        set({
          freezers: get().freezers.map((f) =>
            f.id === id ? { ...f, ...freezer, updatedAt: new Date().toISOString() } : f
          ),
        });
      },

      deleteFreezer: (id) => {
        set({ freezers: get().freezers.filter((f) => f.id !== id) });
      },

      updateFreezerStatus: (id, status) => {
        set({
          freezers: get().freezers.map((f) =>
            f.id === id ? { ...f, status, updatedAt: new Date().toISOString() } : f
          ),
        });
      },

      getProductsByFreezer: (freezerId) => {
        const freezer = get().freezers.find((f) => f.id === freezerId);
        if (!freezer) return [];
        return freezer.zones.flatMap((z) => z.products);
      },

      addZone: (freezerId, zone) => {
        const newZone: Zone = {
          ...zone,
          id: generateId(),
        };
        set({
          freezers: get().freezers.map((f) =>
            f.id === freezerId
              ? { ...f, zones: [...f.zones, newZone], updatedAt: new Date().toISOString() }
              : f
          ),
        });
      },

      updateZone: (freezerId, zoneId, zone) => {
        set({
          freezers: get().freezers.map((f) =>
            f.id === freezerId
              ? {
                  ...f,
                  zones: f.zones.map((z) => (z.id === zoneId ? { ...z, ...zone } : z)),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        });
      },

      deleteZone: (freezerId, zoneId) => {
        set({
          freezers: get().freezers.map((f) =>
            f.id === freezerId
              ? {
                  ...f,
                  zones: f.zones.filter((z) => z.id !== zoneId),
                  updatedAt: new Date().toISOString(),
                }
              : f
          ),
        });
      },
    }),
    {
      name: 'freezer-storage',
    }
  )
);
