import { create } from 'zustand';
import { db } from '@/db';
import type { Furniture, FurnitureArea, FurnitureType, FurnitureMaterial, FurnitureStatus } from '@/types';
import { generateId } from '@/utils/id';

interface FurnitureFilters {
  area?: FurnitureArea;
  type?: FurnitureType;
  material?: FurnitureMaterial;
  status?: FurnitureStatus;
  keyword?: string;
}

interface FurnitureState {
  furniture: Furniture[];
  filteredFurniture: Furniture[];
  filters: FurnitureFilters;
  loading: boolean;
  error: string | null;
}

interface FurnitureActions {
  fetchFurniture: () => Promise<void>;
  addFurniture: (furniture: Omit<Furniture, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Furniture>;
  updateFurniture: (id: string, updates: Partial<Furniture>) => Promise<void>;
  deleteFurniture: (id: string) => Promise<void>;
  getFurnitureById: (id: string) => Furniture | undefined;
  setFilters: (filters: Partial<FurnitureFilters>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  clearError: () => void;
}

export type FurnitureStore = FurnitureState & FurnitureActions;

const defaultFilters: FurnitureFilters = {
  area: undefined,
  type: undefined,
  material: undefined,
  status: undefined,
  keyword: undefined,
};

export const useFurnitureStore = create<FurnitureStore>((set, get) => ({
  furniture: [],
  filteredFurniture: [],
  filters: defaultFilters,
  loading: false,
  error: null,

  fetchFurniture: async () => {
    set({ loading: true, error: null });
    try {
      const furniture = await db.furniture.orderBy('createdAt').reverse().toArray();
      set({ furniture, filteredFurniture: furniture, loading: false });
      get().applyFilters();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取桌椅列表失败', loading: false });
    }
  },

  addFurniture: async (furnitureData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      const newFurniture: Furniture = {
        ...furnitureData,
        id: generateId('furniture'),
        createdAt: now,
        updatedAt: now,
      };
      await db.furniture.add(newFurniture);
      
      const furniture = await db.furniture.orderBy('createdAt').reverse().toArray();
      set({ furniture, loading: false });
      get().applyFilters();
      return newFurniture;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '添加桌椅失败', loading: false });
      throw error;
    }
  },

  updateFurniture: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      await db.furniture.update(id, { ...updates, updatedAt: now });
      
      const furniture = await db.furniture.orderBy('createdAt').reverse().toArray();
      set({ furniture, loading: false });
      get().applyFilters();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新桌椅失败', loading: false });
      throw error;
    }
  },

  deleteFurniture: async (id) => {
    set({ loading: true, error: null });
    try {
      await db.furniture.delete(id);
      const furniture = await db.furniture.orderBy('createdAt').reverse().toArray();
      set({ furniture, loading: false });
      get().applyFilters();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '删除桌椅失败', loading: false });
      throw error;
    }
  },

  getFurnitureById: (id) => {
    return get().furniture.find(f => f.id === id);
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFilters();
  },

  clearFilters: () => {
    set({ filters: defaultFilters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { furniture, filters } = get();
    let filtered = [...furniture];

    if (filters.area) {
      filtered = filtered.filter(f => f.area === filters.area);
    }
    if (filters.type) {
      filtered = filtered.filter(f => f.type === filters.type);
    }
    if (filters.material) {
      filtered = filtered.filter(f => f.material === filters.material);
    }
    if (filters.status) {
      filtered = filtered.filter(f => f.status === filters.status);
    }
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(f => 
        f.code.toLowerCase().includes(keyword) ||
        f.name?.toLowerCase().includes(keyword) ||
        f.storagePoint.toLowerCase().includes(keyword)
      );
    }

    set({ filteredFurniture: filtered });
  },

  clearError: () => {
    set({ error: null });
  },
}));
