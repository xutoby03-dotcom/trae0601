import { create } from "zustand";
import {
  studentsApi,
  productsApi,
  ordersApi,
  purchasesApi,
} from "@/api";
import type {
  Student,
  Product,
  Order,
  Purchase,
  Size,
  OrderStatus,
  PaymentStatus,
  CreateOrderDto,
  UpdateOrderDto,
  CreateStudentDto,
  UpdateStudentDto,
  UpdateProductDto,
  CreatePurchaseDto,
  UpdatePurchaseDto,
} from "@/types";

interface LoadingState {
  students: boolean;
  products: boolean;
  orders: boolean;
  purchases: boolean;
  [key: string]: boolean;
}

interface AppState {
  students: Student[];
  products: Product[];
  orders: Order[];
  purchases: Purchase[];
  loading: LoadingState;
  error: string | null;

  fetchStudents: (params?: { className?: string; search?: string }) => Promise<void>;
  fetchProducts: (params?: { category?: string }) => Promise<void>;
  fetchOrders: (params?: {
    orderStatus?: OrderStatus;
    paymentStatus?: PaymentStatus;
    className?: string;
    search?: string;
  }) => Promise<void>;
  fetchPurchases: (params?: { status?: string; search?: string }) => Promise<void>;
  fetchAll: () => Promise<void>;

  addStudent: (data: CreateStudentDto) => Promise<void>;
  updateStudent: (id: string, data: UpdateStudentDto) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  updateProductStock: (productId: string, size: Size, delta: number) => Promise<void>;
  updateProduct: (id: string, data: UpdateProductDto) => Promise<void>;

  addOrder: (data: CreateOrderDto) => Promise<void>;
  updateOrder: (id: string, data: UpdateOrderDto) => Promise<void>;
  updateOrderPayment: (id: string, status: PaymentStatus) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;

  addPurchase: (data: CreatePurchaseDto) => Promise<void>;
  completePurchase: (id: string) => Promise<void>;
  updatePurchase: (id: string, data: UpdatePurchaseDto) => Promise<void>;
  deletePurchase: (id: string) => Promise<void>;

  setLoading: (key: string, value: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  students: [],
  products: [],
  orders: [],
  purchases: [],
  loading: {
    students: false,
    products: false,
    orders: false,
    purchases: false,
  },
  error: null,

  setLoading: (key, value) =>
    set((state) => ({
      loading: { ...state.loading, [key]: value },
    })),

  setError: (error) => set({ error }),

  fetchStudents: async (params) => {
    set((state) => ({ loading: { ...state.loading, students: true } }));
    try {
      const data = await studentsApi.getAll(params);
      set({ students: data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set((state) => ({ loading: { ...state.loading, students: false } }));
    }
  },

  fetchProducts: async (params) => {
    set((state) => ({ loading: { ...state.loading, products: true } }));
    try {
      const data = await productsApi.getAll(params);
      set({ products: data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set((state) => ({ loading: { ...state.loading, products: false } }));
    }
  },

  fetchOrders: async (params) => {
    set((state) => ({ loading: { ...state.loading, orders: true } }));
    try {
      const data = await ordersApi.getAll(params);
      set({ orders: data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set((state) => ({ loading: { ...state.loading, orders: false } }));
    }
  },

  fetchPurchases: async (params) => {
    set((state) => ({ loading: { ...state.loading, purchases: true } }));
    try {
      const data = await purchasesApi.getAll(params);
      set({ purchases: data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set((state) => ({ loading: { ...state.loading, purchases: false } }));
    }
  },

  fetchAll: async () => {
    await Promise.all([
      get().fetchStudents(),
      get().fetchProducts(),
      get().fetchOrders(),
      get().fetchPurchases(),
    ]);
  },

  addStudent: async (data) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      const newStudent = await studentsApi.create(data);
      set((state) => ({
        students: [...state.students, newStudent],
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  updateStudent: async (id, data) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      const updated = await studentsApi.update(id, data);
      set((state) => ({
        students: state.students.map((s) => (s.id === id ? updated : s)),
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  deleteStudent: async (id) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      await studentsApi.delete(id);
      set((state) => ({
        students: state.students.filter((s) => s.id !== id),
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  updateProductStock: async (productId, size, delta) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      const updated = await productsApi.updateStock(productId, size, delta);
      set((state) => ({
        products: state.products.map((p) => (p.id === productId ? updated : p)),
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  updateProduct: async (id, data) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      const updated = await productsApi.update(id, data);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  addOrder: async (data) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      const newOrder = await ordersApi.create(data);
      set((state) => ({
        orders: [newOrder, ...state.orders],
        error: null,
      }));
      await get().fetchProducts();
      await get().fetchPurchases();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  updateOrder: async (id, data) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      const updated = await ordersApi.update(id, data);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updated : o)),
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  updateOrderPayment: async (id, status) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      const updated = await ordersApi.updatePayment(id, status);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updated : o)),
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  updateOrderStatus: async (id, status) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      const updated = await ordersApi.updateStatus(id, status);
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? updated : o)),
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  deleteOrder: async (id) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      await ordersApi.delete(id);
      set((state) => ({
        orders: state.orders.filter((o) => o.id !== id),
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  addPurchase: async (data) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      const newPurchase = await purchasesApi.create(data);
      set((state) => ({
        purchases: [newPurchase, ...state.purchases],
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  completePurchase: async (id) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      const result = await purchasesApi.complete(id);
      set((state) => ({
        purchases: state.purchases.map((p) =>
          p.id === id ? result.purchase : p
        ),
        products: state.products.map((pr) =>
          pr.id === result.product.id ? result.product : pr
        ),
        orders: state.orders.map((o) => {
          if (
            o.productId === result.product.id &&
            o.orderStatus === "purchasing"
          ) {
            const currentStock = result.product.stock[o.size] || 0;
            if (currentStock >= o.quantity) {
              return { ...o, orderStatus: "ready" as OrderStatus };
            }
          }
          return o;
        }),
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  updatePurchase: async (id, data) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      const updated = await purchasesApi.update(id, data);
      set((state) => ({
        purchases: state.purchases.map((p) => (p.id === id ? updated : p)),
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },

  deletePurchase: async (id) => {
    set((state) => ({ loading: { ...state.loading, mutate: true } }));
    try {
      await purchasesApi.delete(id);
      set((state) => ({
        purchases: state.purchases.filter((p) => p.id !== id),
        error: null,
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set((state) => ({ loading: { ...state.loading, mutate: false } }));
    }
  },
}));
