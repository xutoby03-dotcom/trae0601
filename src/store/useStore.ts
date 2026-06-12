import { create } from 'zustand';
import type {
  Item,
  ReplenishRequest,
  Purchase,
  StockLog,
  AppState,
  UrgencyLevel,
  RequestStatus,
  PurchaseStatus,
  StockLogType,
} from '@/types';
import { generateId } from '@/utils/id';
import { loadState, saveState } from '@/utils/storage';
import { initialMockState } from '@/data/mockData';

interface StoreActions {
  addItem: (data: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, data: Partial<Item>) => void;
  deleteItem: (id: string) => void;

  addRequest: (data: Omit<ReplenishRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateRequestStatus: (id: string, status: RequestStatus) => void;

  addPurchase: (data: Omit<Purchase, 'id' | 'status' | 'createdAt' | 'confirmedAt'>) => void;
  confirmPurchaseArrival: (id: string, receiptPhotoUrl?: string) => void;

  addStockLog: (itemId: string, type: StockLogType, changeAmount: number, remark: string) => void;
}

type Store = AppState & StoreActions;

const getInitialState = (): AppState => {
  const saved = loadState();
  return saved || initialMockState;
};

export const useStore = create<Store>((set, get) => ({
  ...getInitialState(),

  addItem: (data) => {
    const now = new Date().toISOString();
    const newItem: Item = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const newState = { ...state, items: [...state.items, newItem] };
      saveState(newState);
      return newState;
    });
  },

  updateItem: (id, data) => {
    const now = new Date().toISOString();
    set((state) => {
      const newItems = state.items.map((item) =>
        item.id === id ? { ...item, ...data, updatedAt: now } : item
      );
      const newState = { ...state, items: newItems };
      saveState(newState);
      return newState;
    });
  },

  deleteItem: (id) => {
    set((state) => {
      const newState = {
        ...state,
        items: state.items.filter((i) => i.id !== id),
        requests: state.requests.filter((r) => r.itemId !== id),
        purchases: state.purchases.filter((p) => p.itemId !== id),
        stockLogs: state.stockLogs.filter((l) => l.itemId !== id),
      };
      saveState(newState);
      return newState;
    });
  },

  addRequest: (data) => {
    const now = new Date().toISOString();
    const newRequest: ReplenishRequest = {
      ...data,
      id: generateId(),
      status: 'pending',
      createdAt: now,
    };
    set((state) => {
      const newState = { ...state, requests: [newRequest, ...state.requests] };
      saveState(newState);
      return newState;
    });
  },

  updateRequestStatus: (id, status) => {
    set((state) => {
      const newRequests = state.requests.map((r) =>
        r.id === id ? { ...r, status } : r
      );
      const newState = { ...state, requests: newRequests };
      saveState(newState);
      return newState;
    });
  },

  addPurchase: (data) => {
    const now = new Date().toISOString();
    const newPurchase: Purchase = {
      ...data,
      id: generateId(),
      status: 'ordered',
      createdAt: now,
      confirmedAt: null,
    };
    set((state) => {
      let newRequests = state.requests;
      if (data.requestId) {
        newRequests = state.requests.map((r) =>
          r.id === data.requestId ? { ...r, status: 'processing' as RequestStatus } : r
        );
      }
      const newState = {
        ...state,
        purchases: [newPurchase, ...state.purchases],
        requests: newRequests,
      };
      saveState(newState);
      return newState;
    });
  },

  confirmPurchaseArrival: (id, receiptPhotoUrl = '') => {
    const now = new Date().toISOString();
    const { purchases, items, addStockLog, updateRequestStatus } = get();
    const purchase = purchases.find((p) => p.id === id);
    if (!purchase) return;

    const item = items.find((i) => i.id === purchase.itemId);
    if (item) {
      get().updateItem(purchase.itemId, {
        currentStock: item.currentStock + purchase.quantity,
      });
      get().addStockLog(purchase.itemId, 'purchase', purchase.quantity, '采购入库');
    }

    if (purchase.requestId) {
      get().updateRequestStatus(purchase.requestId, 'completed');
    }

    set((state) => {
      const newPurchases = state.purchases.map((p) =>
        p.id === id
          ? { ...p, status: 'arrived' as PurchaseStatus, confirmedAt: now, receiptPhotoUrl }
          : p
      );
      const newState = { ...state, purchases: newPurchases };
      saveState(newState);
      return newState;
    });
  },

  addStockLog: (itemId, type, changeAmount, remark) => {
    const { items } = get();
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const now = new Date().toISOString();
    const newLog: StockLog = {
      id: generateId(),
      itemId,
      type,
      changeAmount,
      balanceAfter: item.currentStock,
      remark,
      createdAt: now,
    };
    set((state) => {
      const newState = { ...state, stockLogs: [newLog, ...state.stockLogs] };
      saveState(newState);
      return newState;
    });
  },
}));
