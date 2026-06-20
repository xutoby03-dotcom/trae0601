import { create } from 'zustand';
import type { Product, Order, Inspection, PickupRecord } from '@/types';
import { generateId } from '@/utils/helpers';
import { mockProducts, mockOrders, mockInspections, mockPickupRecords } from '@/utils/mockData';

interface AppState {
  products: Product[];
  orders: Order[];
  inspections: Inspection[];
  pickupRecords: PickupRecord[];

  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  markOrderPicked: (orderId: string, hasException: boolean, exceptionNote?: string, photos?: string[]) => void;
  markOrderTimeout: (orderId: string) => void;

  addInspection: (inspection: Omit<Inspection, 'id' | 'inspectedAt'>) => void;
  updateInspection: (id: string, data: Partial<Inspection>) => void;

  getProductInspection: (productId: string) => Inspection | undefined;
  getOrdersByProduct: (productId: string) => Order[];
  searchOrders: (query: string) => Order[];
}

const STORAGE_KEY = 'frozen-delivery-state';

function loadFromStorage(): Partial<AppState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }
  return null;
}

function saveToStorage(state: Partial<AppState>) {
  try {
    const toSave = {
      products: state.products,
      orders: state.orders,
      inspections: state.inspections,
      pickupRecords: state.pickupRecords,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

const stored = loadFromStorage();

export const useAppStore = create<AppState>((set, get) => ({
  products: stored?.products ?? mockProducts,
  orders: stored?.orders ?? mockOrders,
  inspections: stored?.inspections ?? mockInspections,
  pickupRecords: stored?.pickupRecords ?? mockPickupRecords,

  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const newState = { products: [...state.products, newProduct] };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  updateProduct: (id, data) => {
    set((state) => {
      const newState = {
        products: state.products.map((p) => (p.id === id ? { ...p, ...data } : p)),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  deleteProduct: (id) => {
    set((state) => {
      const newState = {
        products: state.products.filter((p) => p.id !== id),
        orders: state.orders.filter((o) => o.productId !== id),
        inspections: state.inspections.filter((i) => i.productId !== id),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  addOrder: (order) => {
    const newOrder: Order = {
      ...order,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const newState = { orders: [...state.orders, newOrder] };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  updateOrder: (id, data) => {
    set((state) => {
      const newState = {
        orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  deleteOrder: (id) => {
    set((state) => {
      const newState = {
        orders: state.orders.filter((o) => o.id !== id),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  markOrderPicked: (orderId, hasException, exceptionNote, photos = []) => {
    const record: PickupRecord = {
      id: generateId(),
      orderId,
      pickedAt: new Date().toISOString(),
      hasException,
      exceptionNote,
      photos,
    };
    set((state) => {
      const newState = {
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: 'picked' as const } : o
        ),
        pickupRecords: [...state.pickupRecords, record],
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  markOrderTimeout: (orderId) => {
    set((state) => {
      const newState = {
        orders: state.orders.map((o) =>
          o.id === orderId ? { ...o, status: 'timeout' as const } : o
        ),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  addInspection: (inspection) => {
    const newInspection: Inspection = {
      ...inspection,
      id: generateId(),
      inspectedAt: new Date().toISOString(),
    };
    set((state) => {
      const existingIndex = state.inspections.findIndex((i) => i.productId === inspection.productId);
      let newInspections;
      if (existingIndex >= 0) {
        newInspections = [...state.inspections];
        newInspections[existingIndex] = { ...newInspections[existingIndex], ...inspection };
      } else {
        newInspections = [...state.inspections, newInspection];
      }
      const newState = { inspections: newInspections };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  updateInspection: (id, data) => {
    set((state) => {
      const newState = {
        inspections: state.inspections.map((i) =>
          i.id === id ? { ...i, ...data } : i
        ),
      };
      saveToStorage({ ...state, ...newState });
      return newState;
    });
  },

  getProductInspection: (productId) => {
    return get().inspections.find((i) => i.productId === productId);
  },

  getOrdersByProduct: (productId) => {
    return get().orders.filter((o) => o.productId === productId);
  },

  searchOrders: (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return get().orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.phoneLast4.includes(q) ||
        o.id.toLowerCase().includes(q)
    );
  },
}));
