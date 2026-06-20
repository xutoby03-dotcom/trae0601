import { create } from "zustand";
import type { Elder } from "../types/elder";
import { mockElders } from "../data/elders";
import { generateId } from "../utils/date";
import { getFromStorage, saveToStorage } from "../utils/storage";

interface ElderState {
  elders: Elder[];
  loading: boolean;
  getElder: (id: string) => Elder | undefined;
  addElder: (elder: Omit<Elder, "id" | "createdAt" | "updatedAt">) => void;
  updateElder: (id: string, elder: Partial<Elder>) => void;
  deleteElder: (id: string) => void;
  searchElders: (query: string) => Elder[];
  loadElders: () => void;
}

const STORAGE_KEY = "elderly-haircut-elders";

export const useElderStore = create<ElderState>((set, get) => ({
  elders: [],
  loading: true,

  loadElders: () => {
    const stored = getFromStorage<Elder[]>(STORAGE_KEY, []);
    if (stored.length > 0) {
      set({ elders: stored, loading: false });
    } else {
      set({ elders: mockElders, loading: false });
      saveToStorage(STORAGE_KEY, mockElders);
    }
  },

  getElder: (id: string) => {
    return get().elders.find((e) => e.id === id);
  },

  addElder: (elderData) => {
    const now = new Date().toISOString();
    const newElder: Elder = {
      ...elderData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const newElders = [...get().elders, newElder];
    set({ elders: newElders });
    saveToStorage(STORAGE_KEY, newElders);
  },

  updateElder: (id, elderData) => {
    const now = new Date().toISOString();
    const newElders = get().elders.map((e) =>
      e.id === id ? { ...e, ...elderData, updatedAt: now } : e
    );
    set({ elders: newElders });
    saveToStorage(STORAGE_KEY, newElders);
  },

  deleteElder: (id) => {
    const newElders = get().elders.filter((e) => e.id !== id);
    set({ elders: newElders });
    saveToStorage(STORAGE_KEY, newElders);
  },

  searchElders: (query) => {
    if (!query.trim()) return get().elders;
    const lowerQuery = query.toLowerCase();
    return get().elders.filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQuery) ||
        e.address.toLowerCase().includes(lowerQuery)
    );
  },
}));
