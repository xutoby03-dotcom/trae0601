import { create } from 'zustand';
import type { Fabric } from '@/types';
import { storage, generateId } from '@/utils/storage';
import { MOCK_FABRICS } from '@/utils/mockData';

interface FabricState {
  fabrics: Fabric[];
  loading: boolean;
  initialized: boolean;
  init: () => void;
  addFabric: (fabric: Omit<Fabric, 'id' | 'createdAt' | 'updatedAt'>) => Fabric;
  updateFabric: (id: string, updates: Partial<Fabric>) => void;
  deleteFabric: (id: string) => void;
  getFabricById: (id: string) => Fabric | undefined;
}

export const useFabricStore = create<FabricState>((set, get) => ({
  fabrics: [],
  loading: false,
  initialized: false,

  init: () => {
    if (get().initialized) return;
    
    let fabrics = storage.getFabrics() as Fabric[];
    
    if (!storage.isInitialized() || fabrics.length === 0) {
      fabrics = MOCK_FABRICS;
      storage.setFabrics(fabrics);
      storage.setInitialized(true);
    }
    
    set({ fabrics, initialized: true });
  },

  addFabric: (fabricData) => {
    const now = new Date().toISOString();
    const newFabric: Fabric = {
      ...fabricData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    
    const fabrics = [...get().fabrics, newFabric];
    set({ fabrics });
    storage.setFabrics(fabrics);
    
    return newFabric;
  },

  updateFabric: (id, updates) => {
    const fabrics = get().fabrics.map((f) =>
      f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
    );
    set({ fabrics });
    storage.setFabrics(fabrics);
  },

  deleteFabric: (id) => {
    const fabrics = get().fabrics.filter((f) => f.id !== id);
    set({ fabrics });
    storage.setFabrics(fabrics);
  },

  getFabricById: (id) => {
    return get().fabrics.find((f) => f.id === id);
  },
}));
