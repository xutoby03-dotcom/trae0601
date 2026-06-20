import { create } from 'zustand';
import type { InventoryItem, MaterialType } from '@/types/index';
import { storage, delay, generateId } from '@/utils/storage';
import { mockInventory } from '@/mock/data';

interface InventoryStats {
  normal: number;
  warning: number;
  shortage: number;
}

interface InventoryStoreState {
  inventoryItems: InventoryItem[];
  loading: boolean;
  fetchInventory: () => Promise<void>;
  getInventoryByCounter: (counterId: string) => InventoryItem[];
  getInventoryByMaterial: (materialType: MaterialType) => InventoryItem[];
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  batchUpdateInventory: (updates: { id: string; quantity: number }[]) => Promise<void>;
  getInventoryStats: () => InventoryStats;
  getInventoryItemByCounterAndMaterial: (counterId: string, materialType: MaterialType) => InventoryItem | undefined;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => Promise<void>;
}

const STORAGE_KEY = 'inventory';

const loadInitialInventory = (): InventoryItem[] => {
  if (storage.has(STORAGE_KEY)) {
    return storage.get<InventoryItem[]>(STORAGE_KEY, []);
  }
  storage.set(STORAGE_KEY, mockInventory);
  return mockInventory;
};

const calcStatus = (item: InventoryItem): 'normal' | 'warning' | 'shortage' => {
  const ratio = item.quantity / item.threshold;
  if (ratio <= 0) return 'shortage';
  if (ratio < 0.5) return 'shortage';
  if (ratio < 0.8) return 'warning';
  return 'normal';
};

export const useInventoryStore = create<InventoryStoreState>((set, get) => ({
  inventoryItems: loadInitialInventory(),
  loading: false,

  fetchInventory: async () => {
    set({ loading: true });
    await delay();
    const data = storage.has(STORAGE_KEY)
      ? storage.get<InventoryItem[]>(STORAGE_KEY, [])
      : mockInventory;
    set({ inventoryItems: data, loading: false });
  },

  getInventoryByCounter: (counterId) => {
    return get().inventoryItems.filter((i) => i.counterId === counterId);
  },

  getInventoryByMaterial: (materialType) => {
    return get().inventoryItems.filter((i) => i.materialType === materialType);
  },

  getInventoryItemByCounterAndMaterial: (counterId, materialType) => {
    return get().inventoryItems.find(
      (i) => i.counterId === counterId && i.materialType === materialType
    );
  },

  updateInventoryItem: async (id, updates) => {
    set({ loading: true });
    await delay();
    const updated = get().inventoryItems.map((i) => {
      if (i.id === id) {
        return { ...i, ...updates, lastUpdated: new Date().toISOString() };
      }
      return i;
    });
    storage.set(STORAGE_KEY, updated);
    set({ inventoryItems: updated, loading: false });
  },

  batchUpdateInventory: async (updates) => {
    set({ loading: true });
    await delay();
    const updateMap = new Map(updates.map((u) => [u.id, u.quantity]));
    const updatedItems = get().inventoryItems.map((i) => {
      if (updateMap.has(i.id)) {
        return { ...i, quantity: updateMap.get(i.id)!, lastUpdated: new Date().toISOString() };
      }
      return i;
    });
    storage.set(STORAGE_KEY, updatedItems);
    set({ inventoryItems: updatedItems, loading: false });
  },

  getInventoryStats: () => {
    const items = get().inventoryItems;
    let normal = 0;
    let warning = 0;
    let shortage = 0;
    items.forEach((item) => {
      const status = calcStatus(item);
      if (status === 'normal') normal++;
      else if (status === 'warning') warning++;
      else shortage++;
    });
    return { normal, warning, shortage };
  },

  addInventoryItem: async (item) => {
    set({ loading: true });
    await delay();
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      lastUpdated: new Date().toISOString(),
    };
    const updated = [...get().inventoryItems, newItem];
    storage.set(STORAGE_KEY, updated);
    set({ inventoryItems: updated, loading: false });
  },
}));
