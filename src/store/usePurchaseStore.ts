import { create } from 'zustand';
import type { PurchaseItem, PurchaseStatus, PurchaseType } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/date';
import { mockPurchaseItems } from '../data/mockData';
import { useCoffeeStore } from './useCoffeeStore';
import { useSupplyStore } from './useSupplyStore';
import { calculateSuggestedOrder, calculateWeeklyConsumption, calculateFlavorTotalStock } from '../utils/statistics';

interface AddPurchaseItemData {
  type: PurchaseType;
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  remark?: string;
}

interface PurchaseState {
  purchaseItems: PurchaseItem[];
  items: PurchaseItem[];
  isInitialized: boolean;
  
  initData: () => void;
  addPurchaseItem: (item: AddPurchaseItemData) => void;
  addItem: (item: Omit<PurchaseItem, 'id' | 'createdAt' | 'status'>) => void;
  updatePurchaseStatus: (id: string, status: PurchaseStatus) => void;
  updateItem: (id: string, updates: Partial<PurchaseItem>) => void;
  markAsReceived: (id: string) => void;
  markAsOrdered: (id: string, actualQuantity?: number) => void;
  deletePurchaseItem: (id: string) => void;
  removeItem: (id: string) => void;
  
  autoGeneratePurchaseList: () => { addedCount: number; message: string };
  getItemName: (item: PurchaseItem) => string;
}

export const usePurchaseStore = create<PurchaseState>((set, get) => ({
  purchaseItems: [],
  items: [],
  isInitialized: false,

  initData: () => {
    const initialized = storage.get(STORAGE_KEYS.INITIALIZED, false);
    if (initialized) {
      const items = storage.get<PurchaseItem[]>(STORAGE_KEYS.PURCHASE_ITEMS, []);
      set({ items, purchaseItems: items, isInitialized: true });
    } else {
      set({ items: mockPurchaseItems, purchaseItems: mockPurchaseItems, isInitialized: true });
      storage.set(STORAGE_KEYS.PURCHASE_ITEMS, mockPurchaseItems);
    }
  },

  addPurchaseItem: (itemData) => {
    const existing = get().purchaseItems.find(
      (i) => i.itemId === itemData.itemId && i.type === itemData.type && (i.status === 'pending' || i.status === 'ordered')
    );
    
    if (existing) {
      get().updateItem(existing.id, {
        quantity: existing.quantity + itemData.quantity,
        actualQuantity: existing.actualQuantity + itemData.quantity,
      });
      return;
    }

    const newItem: PurchaseItem = {
      id: generateId(),
      itemType: itemData.type,
      type: itemData.type,
      itemId: itemData.itemId,
      itemName: itemData.itemName,
      suggestedQuantity: itemData.quantity,
      actualQuantity: itemData.quantity,
      quantity: itemData.quantity,
      unitPrice: itemData.unitPrice,
      status: 'pending',
      supplier: itemData.supplier,
      remark: itemData.remark,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const items = [...state.purchaseItems, newItem];
      storage.set(STORAGE_KEYS.PURCHASE_ITEMS, items);
      return { purchaseItems: items, items };
    });
  },

  addItem: (item) => {
    const existing = get().purchaseItems.find(
      (i) => i.itemId === item.itemId && i.itemType === item.itemType && i.status === 'pending'
    );
    
    if (existing) {
      get().updateItem(existing.id, {
        suggestedQuantity: Math.max(existing.suggestedQuantity, item.suggestedQuantity),
        actualQuantity: Math.max(existing.actualQuantity, item.actualQuantity),
        quantity: Math.max(existing.quantity, item.quantity),
      });
      return;
    }

    const newItem: PurchaseItem = {
      ...item,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      itemName: item.itemName || '',
      quantity: item.quantity || item.actualQuantity,
      unitPrice: item.unitPrice || 0,
      type: item.type || item.itemType,
    };
    set((state) => {
      const items = [...state.purchaseItems, newItem];
      storage.set(STORAGE_KEYS.PURCHASE_ITEMS, items);
      return { purchaseItems: items, items };
    });
  },

  updateItem: (id, updates) => {
    set((state) => {
      const items = state.purchaseItems.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      );
      storage.set(STORAGE_KEYS.PURCHASE_ITEMS, items);
      return { purchaseItems: items, items };
    });
  },

  updatePurchaseStatus: (id, status) => {
    get().updateItem(id, { status });
  },

  markAsOrdered: (id, actualQuantity) => {
    const updates: Partial<PurchaseItem> = {
      status: 'ordered',
      purchasedAt: new Date().toISOString(),
    };
    if (actualQuantity !== undefined) {
      updates.actualQuantity = actualQuantity;
      updates.quantity = actualQuantity;
    }
    get().updateItem(id, updates);
  },

  markAsReceived: (id) => {
    const item = get().purchaseItems.find((i) => i.id === id);
    if (!item) return;

    get().updateItem(id, {
      status: 'received',
      receivedAt: new Date().toISOString(),
    });

    if (item.type === 'coffee' || item.itemType === 'coffee') {
      const coffeeStore = useCoffeeStore.getState();
      const flavor = coffeeStore.flavors.find((f) => f.id === item.itemId);
      if (flavor) {
        coffeeStore.addBatch({
          flavorId: item.itemId,
          quantity: item.actualQuantity,
          expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'normal',
        });
      }
    } else {
      const supplyStore = useSupplyStore.getState();
      supplyStore.restockSupply(item.itemId, item.actualQuantity);
    }
  },

  deletePurchaseItem: (id) => {
    set((state) => {
      const items = state.purchaseItems.filter((i) => i.id !== id);
      storage.set(STORAGE_KEYS.PURCHASE_ITEMS, items);
      return { purchaseItems: items, items };
    });
  },

  removeItem: (id) => {
    get().deletePurchaseItem(id);
  },

  autoGeneratePurchaseList: () => {
    const coffeeStore = useCoffeeStore.getState();
    const supplyStore = useSupplyStore.getState();
    const purchaseStore = get();
    let addedCount = 0;

    coffeeStore.flavors.forEach((flavor) => {
      const currentStock = calculateFlavorTotalStock(flavor.id, coffeeStore.batches);
      const avgWeekly = calculateWeeklyConsumption(flavor.id, coffeeStore.logs);
      const suggested = calculateSuggestedOrder(currentStock, flavor.safetyStock, avgWeekly);

      if (suggested > 0 && currentStock <= flavor.safetyStock) {
        const existing = purchaseStore.purchaseItems.find(
          (i) => i.itemId === flavor.id && (i.status === 'pending' || i.status === 'ordered')
        );
        if (!existing) {
          purchaseStore.addPurchaseItem({
            type: 'coffee',
            itemId: flavor.id,
            itemName: flavor.name,
            quantity: suggested,
            unitPrice: flavor.unitPrice,
          });
          addedCount++;
        }
      }
    });

    supplyStore.supplies.forEach((supply) => {
      const supplyConsumption = supplyStore.logs
        .filter((l) => l.supplyId === supply.id && l.type === 'consume')
        .reduce((sum, l) => sum + l.quantity, 0);
      const avgWeekly = Math.round(supplyConsumption / 4);
      const suggested = calculateSuggestedOrder(supply.quantity, supply.safetyStock, avgWeekly);

      if (suggested > 0 && supply.quantity <= supply.safetyStock) {
        const existing = purchaseStore.purchaseItems.find(
          (i) => i.itemId === supply.id && (i.status === 'pending' || i.status === 'ordered')
        );
        if (!existing) {
          purchaseStore.addPurchaseItem({
            type: 'supply',
            itemId: supply.id,
            itemName: supply.name,
            quantity: suggested,
            unitPrice: supply.unitPrice,
          });
          addedCount++;
        }
      }
    });

    if (addedCount === 0) {
      return { addedCount: 0, message: '库存充足，无需补货' };
    }
    return { addedCount, message: `已添加 ${addedCount} 项采购需求` };
  },

  getItemName: (item) => {
    if (item.type === 'coffee' || item.itemType === 'coffee') {
      const coffeeStore = useCoffeeStore.getState();
      const flavor = coffeeStore.flavors.find((f) => f.id === item.itemId);
      return flavor?.name || '未知咖啡';
    } else {
      const supplyStore = useSupplyStore.getState();
      const supply = supplyStore.supplies.find((s) => s.id === item.itemId);
      return supply?.name || '未知物品';
    }
  },
}));
