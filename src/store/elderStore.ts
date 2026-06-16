import { create } from 'zustand';
import type { Elder } from '@/types';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { mockElders } from '@/utils/mockData';
import { generateId } from '@/utils/format';

interface ElderState {
  elders: Elder[];
  loading: boolean;
  fetchElders: () => void;
  getElderById: (id: string) => Elder | undefined;
  addElder: (elder: Omit<Elder, 'id' | 'createdAt'>) => void;
  updateElder: (id: string, elder: Partial<Elder>) => void;
  deleteElder: (id: string) => void;
  searchElders: (keyword: string) => Elder[];
  getHomeVisitElders: () => Elder[];
}

export const useElderStore = create<ElderState>((set, get) => ({
  elders: [],
  loading: false,

  fetchElders: () => {
    const initialized = storage.get(STORAGE_KEYS.INITIALIZED, false);
    let elders: Elder[];
    
    if (!initialized) {
      elders = mockElders;
      storage.set(STORAGE_KEYS.ELDERS, elders);
    } else {
      elders = storage.get<Elder[]>(STORAGE_KEYS.ELDERS, []);
    }
    
    set({ elders });
  },

  getElderById: (id: string) => {
    return get().elders.find(e => e.id === id);
  },

  addElder: (elderData) => {
    const newElder: Elder = {
      ...elderData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const elders = [...get().elders, newElder];
    storage.set(STORAGE_KEYS.ELDERS, elders);
    set({ elders });
  },

  updateElder: (id, elderData) => {
    const elders = get().elders.map(elder =>
      elder.id === id ? { ...elder, ...elderData } : elder
    );
    storage.set(STORAGE_KEYS.ELDERS, elders);
    set({ elders });
  },

  deleteElder: (id) => {
    const elders = get().elders.filter(elder => elder.id !== id);
    storage.set(STORAGE_KEYS.ELDERS, elders);
    set({ elders });
  },

  searchElders: (keyword) => {
    if (!keyword.trim()) return get().elders;
    const lowerKeyword = keyword.toLowerCase();
    return get().elders.filter(
      elder =>
        elder.name.toLowerCase().includes(lowerKeyword) ||
        elder.phone.includes(keyword) ||
        elder.phoneModel.toLowerCase().includes(lowerKeyword)
    );
  },

  getHomeVisitElders: () => {
    return get().elders.filter(elder => elder.needHomeVisit);
  },
}));
