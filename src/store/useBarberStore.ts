import { create } from "zustand";
import type { Barber } from "../types/barber";
import { mockBarbers } from "../data/barbers";
import { getFromStorage, saveToStorage } from "../utils/storage";

interface BarberState {
  barbers: Barber[];
  loading: boolean;
  getBarber: (id: string) => Barber | undefined;
  loadBarbers: () => void;
}

const STORAGE_KEY = "elderly-haircut-barbers";

export const useBarberStore = create<BarberState>((set, get) => ({
  barbers: [],
  loading: true,

  loadBarbers: () => {
    const stored = getFromStorage<Barber[]>(STORAGE_KEY, []);
    if (stored.length > 0) {
      set({ barbers: stored, loading: false });
    } else {
      set({ barbers: mockBarbers, loading: false });
      saveToStorage(STORAGE_KEY, mockBarbers);
    }
  },

  getBarber: (id: string) => {
    return get().barbers.find((b) => b.id === id);
  },
}));
