import { create } from 'zustand';
import { Clothing, Material, AppState } from '@/types';
import { getFromStorage, setToStorage } from '@/utils/storage';
import { getInitialMockData } from '@/utils/mockData';
import { generateId } from '@/utils/dateUtils';

interface AppActions {
  addClothing: (clothing: Omit<Clothing, 'id' | 'createdAt' | 'status'>) => void;
  updateClothing: (id: string, updates: Partial<Clothing>) => void;
  deleteClothing: (id: string) => void;
  startClothing: (id: string) => void;
  completeClothing: (id: string, data: { photoAfter?: string; timeSpent: number; notes?: string }) => void;
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  updateMaterialQuantity: (id: string, delta: number) => void;
  initializeData: () => void;
}

const STORAGE_KEY = 'sewing-queue-data';

const useAppStore = create<AppState & AppActions>((set, get) => ({
  clothings: [],
  materials: [],

  initializeData: () => {
    const stored = getFromStorage<AppState | null>(STORAGE_KEY, null);
    if (stored && stored.clothings.length > 0) {
      set(stored);
    } else {
      const mockData = getInitialMockData();
      set(mockData);
      setToStorage(STORAGE_KEY, mockData);
    }
  },

  addClothing: (clothingData) => {
    const newClothing: Clothing = {
      ...clothingData,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const newState = {
      ...get(),
      clothings: [...get().clothings, newClothing],
    };
    set(newState);
    setToStorage(STORAGE_KEY, newState);
  },

  updateClothing: (id, updates) => {
    const newState = {
      ...get(),
      clothings: get().clothings.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    };
    set(newState);
    setToStorage(STORAGE_KEY, newState);
  },

  deleteClothing: (id) => {
    const newState = {
      ...get(),
      clothings: get().clothings.filter((c) => c.id !== id),
    };
    set(newState);
    setToStorage(STORAGE_KEY, newState);
  },

  startClothing: (id) => {
    const clothing = get().clothings.find((c) => c.id === id);
    if (!clothing) return;

    const materialUpdates: Material[] = [...get().materials];
    clothing.materialsNeeded.forEach((materialId) => {
      const idx = materialUpdates.findIndex((m) => m.id === materialId);
      if (idx !== -1 && materialUpdates[idx].quantity > 0) {
        materialUpdates[idx] = {
          ...materialUpdates[idx],
          quantity: materialUpdates[idx].quantity - 1,
        };
      }
    });

    const newState = {
      ...get(),
      clothings: get().clothings.map((c) =>
        c.id === id
          ? { ...c, status: 'in_progress' as const, startedAt: new Date().toISOString() }
          : c
      ),
      materials: materialUpdates,
    };
    set(newState);
    setToStorage(STORAGE_KEY, newState);
  },

  completeClothing: (id, data) => {
    const newState = {
      ...get(),
      clothings: get().clothings.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'completed' as const,
              completedAt: new Date().toISOString(),
              photoAfter: data.photoAfter,
              timeSpent: data.timeSpent,
              notes: data.notes || c.notes,
            }
          : c
      ),
    };
    set(newState);
    setToStorage(STORAGE_KEY, newState);
  },

  addMaterial: (materialData) => {
    const newMaterial: Material = {
      ...materialData,
      id: generateId(),
    };
    const newState = {
      ...get(),
      materials: [...get().materials, newMaterial],
    };
    set(newState);
    setToStorage(STORAGE_KEY, newState);
  },

  updateMaterial: (id, updates) => {
    const newState = {
      ...get(),
      materials: get().materials.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    };
    set(newState);
    setToStorage(STORAGE_KEY, newState);
  },

  deleteMaterial: (id) => {
    const newState = {
      ...get(),
      materials: get().materials.filter((m) => m.id !== id),
    };
    set(newState);
    setToStorage(STORAGE_KEY, newState);
  },

  updateMaterialQuantity: (id, delta) => {
    const newState = {
      ...get(),
      materials: get().materials.map((m) =>
        m.id === id
          ? {
              ...m,
              quantity: Math.max(0, m.quantity + delta),
              lastPurchased:
                delta > 0 ? new Date().toISOString().split('T')[0] : m.lastPurchased,
            }
          : m
      ),
    };
    set(newState);
    setToStorage(STORAGE_KEY, newState);
  },
}));

export default useAppStore;
