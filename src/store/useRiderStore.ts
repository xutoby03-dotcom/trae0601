import { create } from 'zustand';
import type { Rider } from '../types';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/helpers';

interface RiderState {
  riders: Rider[];
  loading: boolean;
  fetchRiders: () => void;
  addRider: (rider: Omit<Rider, 'id' | 'createdAt'>) => void;
  updateRider: (id: string, rider: Partial<Rider>) => void;
  deleteRider: (id: string) => void;
  getRiderById: (id: string) => Rider | undefined;
}

export const useRiderStore = create<RiderState>((set, get) => ({
  riders: [],
  loading: false,

  fetchRiders: () => {
    const riders = getFromStorage<Rider[]>(STORAGE_KEYS.RIDERS, []);
    set({ riders });
  },

  addRider: (riderData) => {
    const newRider: Rider = {
      ...riderData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const riders = [...get().riders, newRider];
    set({ riders });
    setToStorage(STORAGE_KEYS.RIDERS, riders);
  },

  updateRider: (id, riderData) => {
    const riders = get().riders.map((r) =>
      r.id === id ? { ...r, ...riderData } : r
    );
    set({ riders });
    setToStorage(STORAGE_KEYS.RIDERS, riders);
  },

  deleteRider: (id) => {
    const riders = get().riders.filter((r) => r.id !== id);
    set({ riders });
    setToStorage(STORAGE_KEYS.RIDERS, riders);
  },

  getRiderById: (id) => {
    return get().riders.find((r) => r.id === id);
  },
}));
