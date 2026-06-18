import { create } from 'zustand';
import type { CoffeeFlavor, InventoryBatch, ConsumptionLog, FlavorWithStock, Department } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/date';
import { calculateFlavorTotalStock, getFlavorStockStatus, getNearestExpiry } from '../utils/statistics';
import { mockFlavors, mockInventoryBatches, mockConsumptionLogs } from '../data/mockData';

interface CoffeeState {
  flavors: CoffeeFlavor[];
  batches: InventoryBatch[];
  logs: ConsumptionLog[];
  inventoryBatches: InventoryBatch[];
  consumptionLogs: ConsumptionLog[];
  departments: Department[];
  isInitialized: boolean;
  
  initData: () => void;
  addFlavor: (flavor: Omit<CoffeeFlavor, 'id' | 'createdAt'>) => void;
  updateFlavor: (id: string, flavor: Partial<CoffeeFlavor>) => void;
  deleteFlavor: (id: string) => void;
  
  addBatch: (batch: Omit<InventoryBatch, 'id' | 'createdAt'>) => void;
  addInventoryBatch: (batch: InventoryBatch) => void;
  updateBatch: (id: string, batch: Partial<InventoryBatch>) => void;
  markBatchStatus: (id: string, status: 'expired' | 'damp' | 'normal') => void;
  
  consumeCoffee: (flavorId: string, quantity: number, department: string) => { success: boolean; message: string };
  
  getFlavorWithStock: (flavorId: string) => FlavorWithStock | null;
  getAllFlavorsWithStock: () => FlavorWithStock[];
  getLowStockFlavors: () => FlavorWithStock[];
}

const mockDepartments: Department[] = [
  { id: '1', name: '技术部' },
  { id: '2', name: '产品部' },
  { id: '3', name: '设计部' },
  { id: '4', name: '市场部' },
  { id: '5', name: '运营部' },
  { id: '6', name: '人事部' },
  { id: '7', name: '财务部' },
  { id: '8', name: '行政部' },
];

export const useCoffeeStore = create<CoffeeState>((set, get) => ({
  flavors: [],
  batches: [],
  logs: [],
  inventoryBatches: [],
  consumptionLogs: [],
  departments: mockDepartments,
  isInitialized: false,

  initData: () => {
    const initialized = storage.get(STORAGE_KEYS.INITIALIZED, false);
    if (initialized) {
      const flavors = storage.get<CoffeeFlavor[]>(STORAGE_KEYS.COFFEE_FLAVORS, []);
      const batches = storage.get<InventoryBatch[]>(STORAGE_KEYS.INVENTORY_BATCHES, []);
      const logs = storage.get<ConsumptionLog[]>(STORAGE_KEYS.CONSUMPTION_LOGS, []);
      set({ flavors, batches, logs, inventoryBatches: batches, consumptionLogs: logs, isInitialized: true });
    } else {
      set({
        flavors: mockFlavors,
        batches: mockInventoryBatches,
        logs: mockConsumptionLogs,
        inventoryBatches: mockInventoryBatches,
        consumptionLogs: mockConsumptionLogs,
        isInitialized: true,
      });
      storage.set(STORAGE_KEYS.COFFEE_FLAVORS, mockFlavors);
      storage.set(STORAGE_KEYS.INVENTORY_BATCHES, mockInventoryBatches);
      storage.set(STORAGE_KEYS.CONSUMPTION_LOGS, mockConsumptionLogs);
      storage.set(STORAGE_KEYS.INITIALIZED, true);
    }
  },

  addFlavor: (flavor) => {
    const newFlavor: CoffeeFlavor = {
      ...flavor,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const flavors = [...state.flavors, newFlavor];
      storage.set(STORAGE_KEYS.COFFEE_FLAVORS, flavors);
      return { flavors };
    });
  },

  updateFlavor: (id, updates) => {
    set((state) => {
      const flavors = state.flavors.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      );
      storage.set(STORAGE_KEYS.COFFEE_FLAVORS, flavors);
      return { flavors };
    });
  },

  deleteFlavor: (id) => {
    set((state) => {
      const flavors = state.flavors.filter((f) => f.id !== id);
      const batches = state.batches.filter((b) => b.flavorId !== id);
      storage.set(STORAGE_KEYS.COFFEE_FLAVORS, flavors);
      storage.set(STORAGE_KEYS.INVENTORY_BATCHES, batches);
      return { flavors, batches, inventoryBatches: batches };
    });
  },

  addBatch: (batch) => {
    const newBatch: InventoryBatch = {
      ...batch,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const batches = [...state.batches, newBatch];
      storage.set(STORAGE_KEYS.INVENTORY_BATCHES, batches);
      return { batches, inventoryBatches: batches };
    });
  },

  addInventoryBatch: (batch) => {
    set((state) => {
      const batches = [...state.batches, batch];
      storage.set(STORAGE_KEYS.INVENTORY_BATCHES, batches);
      return { batches, inventoryBatches: batches };
    });
  },

  updateBatch: (id, updates) => {
    set((state) => {
      const batches = state.batches.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      );
      storage.set(STORAGE_KEYS.INVENTORY_BATCHES, batches);
      return { batches, inventoryBatches: batches };
    });
  },

  markBatchStatus: (id, status) => {
    get().updateBatch(id, { status });
  },

  consumeCoffee: (flavorId, quantity, department) => {
    const state = get();
    const flavor = state.flavors.find((f) => f.id === flavorId);
    if (!flavor) return { success: false, message: '口味不存在' };

    const availableBatches = state.batches
      .filter((b) => b.flavorId === flavorId && b.status === 'normal' && b.quantity > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    const totalAvailable = availableBatches.reduce((sum, b) => sum + b.quantity, 0);
    if (totalAvailable < quantity) {
      return { success: false, message: `库存不足，当前可用 ${totalAvailable} 颗` };
    }

    let remaining = quantity;
    const updatedBatches = [...state.batches];
    
    for (const batch of availableBatches) {
      if (remaining <= 0) break;
      const take = Math.min(batch.quantity, remaining);
      const idx = updatedBatches.findIndex((b) => b.id === batch.id);
      if (idx !== -1) {
        updatedBatches[idx] = {
          ...updatedBatches[idx],
          quantity: updatedBatches[idx].quantity - take,
        };
      }
      remaining -= take;
    }

    const log: ConsumptionLog = {
      id: generateId(),
      flavorId,
      quantity,
      department,
      consumedAt: new Date().toISOString(),
    };

    const updatedLogs = [...state.logs, log];

    set({ batches: updatedBatches, logs: updatedLogs, inventoryBatches: updatedBatches, consumptionLogs: updatedLogs });
    storage.set(STORAGE_KEYS.INVENTORY_BATCHES, updatedBatches);
    storage.set(STORAGE_KEYS.CONSUMPTION_LOGS, updatedLogs);

    return { success: true, message: `成功取用 ${quantity} 颗 ${flavor.name}` };
  },

  getFlavorWithStock: (flavorId) => {
    const state = get();
    const flavor = state.flavors.find((f) => f.id === flavorId);
    if (!flavor) return null;

    const totalStock = calculateFlavorTotalStock(flavorId, state.batches);
    const stockStatus = getFlavorStockStatus(totalStock, flavor.safetyStock, state.batches);
    const nearestExpiry = getNearestExpiry(flavorId, state.batches);

    return { ...flavor, totalStock, stockStatus, nearestExpiry };
  },

  getAllFlavorsWithStock: () => {
    const state = get();
    return state.flavors.map((flavor) => {
      const totalStock = calculateFlavorTotalStock(flavor.id, state.batches);
      const stockStatus = getFlavorStockStatus(totalStock, flavor.safetyStock, state.batches);
      const nearestExpiry = getNearestExpiry(flavor.id, state.batches);
      return { ...flavor, totalStock, stockStatus, nearestExpiry };
    });
  },

  getLowStockFlavors: () => {
    return get().getAllFlavorsWithStock().filter((f) => 
      f.stockStatus === 'low' || f.stockStatus === 'out_of_stock'
    );
  },
}));
