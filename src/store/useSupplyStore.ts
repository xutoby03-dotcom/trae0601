import { create } from 'zustand';
import type { SupplyItem, SupplyLog, SupplyItemWithStatus, Department } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateId, isExpired } from '../utils/date';
import { mockSupplies, mockSupplyLogs, mockDepartments } from '../data/mockData';

interface SupplyState {
  supplies: SupplyItem[];
  logs: SupplyLog[];
  departments: Department[];
  
  initData: () => void;
  
  addSupply: (supply: Omit<SupplyItem, 'id' | 'createdAt'>) => void;
  updateSupply: (id: string, supply: Partial<SupplyItem>) => void;
  deleteSupply: (id: string) => void;
  
  consumeSupply: (supplyId: string, quantity: number, department?: string) => { success: boolean; message: string };
  restockSupply: (supplyId: string, quantity: number, expiryDate?: string) => { success: boolean; message: string };
  
  getSupplyWithStatus: (supplyId: string) => SupplyItemWithStatus | null;
  getAllSuppliesWithStatus: () => SupplyItemWithStatus[];
  getLowStockSupplies: () => SupplyItemWithStatus[];
}

export const useSupplyStore = create<SupplyState>((set, get) => ({
  supplies: [],
  logs: [],
  departments: mockDepartments,

  initData: () => {
    const initialized = storage.get(STORAGE_KEYS.INITIALIZED, false);
    if (initialized) {
      const supplies = storage.get<SupplyItem[]>(STORAGE_KEYS.SUPPLY_ITEMS, []);
      const logs = storage.get<SupplyLog[]>(STORAGE_KEYS.SUPPLY_LOGS, []);
      const departments = storage.get<Department[]>(STORAGE_KEYS.DEPARTMENTS, mockDepartments);
      set({ supplies, logs, departments });
    } else {
      set({
        supplies: mockSupplies,
        logs: mockSupplyLogs,
        departments: mockDepartments,
      });
      storage.set(STORAGE_KEYS.SUPPLY_ITEMS, mockSupplies);
      storage.set(STORAGE_KEYS.SUPPLY_LOGS, mockSupplyLogs);
      storage.set(STORAGE_KEYS.DEPARTMENTS, mockDepartments);
    }
  },

  addSupply: (supply) => {
    const newSupply: SupplyItem = {
      ...supply,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const supplies = [...state.supplies, newSupply];
      storage.set(STORAGE_KEYS.SUPPLY_ITEMS, supplies);
      return { supplies };
    });
  },

  updateSupply: (id, updates) => {
    set((state) => {
      const supplies = state.supplies.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      );
      storage.set(STORAGE_KEYS.SUPPLY_ITEMS, supplies);
      return { supplies };
    });
  },

  deleteSupply: (id) => {
    set((state) => {
      const supplies = state.supplies.filter((s) => s.id !== id);
      storage.set(STORAGE_KEYS.SUPPLY_ITEMS, supplies);
      return { supplies };
    });
  },

  consumeSupply: (supplyId, quantity, department) => {
    const state = get();
    const supply = state.supplies.find((s) => s.id === supplyId);
    if (!supply) return { success: false, message: '物品不存在' };
    if (supply.quantity < quantity) {
      return { success: false, message: `库存不足，当前可用 ${supply.quantity}` };
    }

    const updatedSupplies = state.supplies.map((s) =>
      s.id === supplyId ? { ...s, quantity: s.quantity - quantity } : s
    );

    const log: SupplyLog = {
      id: generateId(),
      supplyId,
      quantity,
      type: 'consume',
      department,
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [...state.logs, log];

    set({ supplies: updatedSupplies, logs: updatedLogs });
    storage.set(STORAGE_KEYS.SUPPLY_ITEMS, updatedSupplies);
    storage.set(STORAGE_KEYS.SUPPLY_LOGS, updatedLogs);

    return { success: true, message: `成功领用 ${quantity} ${supply.name}` };
  },

  restockSupply: (supplyId, quantity, expiryDate) => {
    const state = get();
    const supply = state.supplies.find((s) => s.id === supplyId);
    if (!supply) return { success: false, message: '物品不存在' };

    const updates: Partial<SupplyItem> = {
      quantity: supply.quantity + quantity,
    };
    if (expiryDate) {
      updates.expiryDate = expiryDate;
    }

    const updatedSupplies = state.supplies.map((s) =>
      s.id === supplyId ? { ...s, ...updates } : s
    );

    const log: SupplyLog = {
      id: generateId(),
      supplyId,
      quantity,
      type: 'restock',
      createdAt: new Date().toISOString(),
    };

    const updatedLogs = [...state.logs, log];

    set({ supplies: updatedSupplies, logs: updatedLogs });
    storage.set(STORAGE_KEYS.SUPPLY_ITEMS, updatedSupplies);
    storage.set(STORAGE_KEYS.SUPPLY_LOGS, updatedLogs);

    return { success: true, message: `成功补充 ${quantity} ${supply.name}` };
  },

  getSupplyWithStatus: (supplyId) => {
    const state = get();
    const supply = state.supplies.find((s) => s.id === supplyId);
    if (!supply) return null;

    let stockStatus: SupplyItemWithStatus['stockStatus'] = 'normal';
    if (supply.quantity === 0) {
      stockStatus = 'out_of_stock';
    } else if (supply.expiryDate && isExpired(supply.expiryDate)) {
      stockStatus = 'expired';
    } else if (supply.quantity <= supply.safetyStock) {
      stockStatus = 'low';
    }

    return { ...supply, stockStatus };
  },

  getAllSuppliesWithStatus: () => {
    return get().supplies.map((s) => get().getSupplyWithStatus(s.id)!);
  },

  getLowStockSupplies: () => {
    return get().getAllSuppliesWithStatus().filter((s) =>
      s.stockStatus === 'low' || s.stockStatus === 'out_of_stock'
    );
  },
}));
