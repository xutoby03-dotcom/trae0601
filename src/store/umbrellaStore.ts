import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Store, Umbrella, UmbrellaStatus } from '../types';
import { initialStores, initialUmbrellas } from './mockData';

interface UmbrellaState {
  stores: Store[];
  umbrellas: Umbrella[];
  currentStoreId: string;
  setCurrentStoreId: (id: string) => void;
  addUmbrella: (data: Omit<Umbrella, 'id' | 'createdAt'>) => void;
  updateUmbrella: (id: string, data: Partial<Umbrella>) => void;
  setUmbrellaStatus: (id: string, status: UmbrellaStatus, damageNote?: string) => void;
  getUmbrella: (id: string) => Umbrella | undefined;
  getUmbrellaByCode: (code: string) => Umbrella | undefined;
  getAvailableByStore: (storeId?: string) => Umbrella[];
  getStoreName: (id: string) => string;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useUmbrellaStore = create<UmbrellaState>()(
  persist(
    (set, get) => ({
      stores: initialStores,
      umbrellas: initialUmbrellas,
      currentStoreId: initialStores[0].id,

      setCurrentStoreId: (id) => set({ currentStoreId: id }),

      addUmbrella: (data) =>
        set((state) => ({
          umbrellas: [
            { ...data, id: uid(), createdAt: new Date().toISOString() },
            ...state.umbrellas,
          ],
        })),

      updateUmbrella: (id, data) =>
        set((state) => ({
          umbrellas: state.umbrellas.map((u) => (u.id === id ? { ...u, ...data } : u)),
        })),

      setUmbrellaStatus: (id, status, damageNote) =>
        set((state) => ({
          umbrellas: state.umbrellas.map((u) =>
            u.id === id
              ? { ...u, status, damageNote: damageNote ?? u.damageNote }
              : u
          ),
        })),

      getUmbrella: (id) => get().umbrellas.find((u) => u.id === id),
      getUmbrellaByCode: (code) =>
        get().umbrellas.find((u) => u.code.toLowerCase() === code.toLowerCase()),
      getAvailableByStore: (storeId) => {
        const { umbrellas, currentStoreId } = get();
        const sid = storeId ?? currentStoreId;
        return umbrellas.filter((u) => u.storeId === sid && u.status === 'available');
      },
      getStoreName: (id) => get().stores.find((s) => s.id === id)?.name ?? '未知门店',
    }),
    { name: 'umbrella-store' }
  )
);
