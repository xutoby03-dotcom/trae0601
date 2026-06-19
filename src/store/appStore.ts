import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Student,
  Product,
  Order,
  Purchase,
  Size,
  OrderStatus,
  PaymentStatus,
  PurchaseStatus,
} from "@/types";
import { mockStudents, mockProducts, mockOrders, mockPurchases } from "@/data/mockData";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface AppState {
  students: Student[];
  products: Product[];
  orders: Order[];
  purchases: Purchase[];

  addStudent: (data: Omit<Student, "id" | "createdAt">) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  updateProductStock: (productId: string, size: Size, delta: number) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;

  addOrder: (
    data: Omit<Order, "id" | "createdAt" | "orderStatus"> & {
      orderStatus?: OrderStatus;
    }
  ) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;
  updateOrderPayment: (id: string, status: PaymentStatus) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;

  addPurchase: (data: Omit<Purchase, "id" | "createdAt" | "status">) => void;
  completePurchase: (id: string) => void;
  updatePurchase: (id: string, data: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      students: mockStudents,
      products: mockProducts,
      orders: mockOrders,
      purchases: mockPurchases,

      addStudent: (data) =>
        set((state) => ({
          students: [
            ...state.students,
            { ...data, id: generateId("stu"), createdAt: new Date().toISOString() },
          ],
        })),

      updateStudent: (id, data) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),

      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        })),

      updateProductStock: (productId, size, delta) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  stock: {
                    ...p.stock,
                    [size]: Math.max(0, (p.stock[size] || 0) + delta),
                  },
                }
              : p
          ),
        })),

      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      addOrder: (data) => {
        const state = get();
        const product = state.products.find((p) => p.id === data.productId);
        const currentStock = product?.stock[data.size] || 0;
        const needPurchase = currentStock < data.quantity;

        const orderStatus: OrderStatus = data.orderStatus ?? (
          needPurchase ? "purchasing" : "ready"
        );

        const newOrder: Order = {
          ...data,
          orderStatus,
          id: generateId("ord"),
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedOrders = [...state.orders, newOrder];
          let updatedProducts = state.products;
          let updatedPurchases = state.purchases;

          if (!needPurchase) {
            updatedProducts = state.products.map((p) =>
              p.id === data.productId
                ? {
                    ...p,
                    stock: {
                      ...p.stock,
                      [data.size]: Math.max(0, (p.stock[data.size] || 0) - data.quantity),
                    },
                  }
                : p
            );
          } else if (product) {
            const shortage = data.quantity - currentStock;
            const existingPurchase = state.purchases.find(
              (pur) =>
                pur.productId === data.productId &&
                pur.size === data.size &&
                pur.status === "pending"
            );
            if (!existingPurchase) {
              updatedPurchases = [
                ...state.purchases,
                {
                  id: generateId("pur"),
                  productId: data.productId,
                  size: data.size,
                  quantity: Math.max(shortage, 5),
                  supplier: product.supplier,
                  status: "pending" as PurchaseStatus,
                  createdAt: new Date().toISOString(),
                },
              ];
            }
          }

          return {
            orders: updatedOrders,
            products: updatedProducts,
            purchases: updatedPurchases,
          };
        });
      },

      updateOrder: (id, data) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, ...data } : o
          ),
        })),

      updateOrderPayment: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, paymentStatus: status } : o
          ),
        })),

      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, orderStatus: status } : o
          ),
        })),

      deleteOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
        })),

      addPurchase: (data) =>
        set((state) => ({
          purchases: [
            ...state.purchases,
            {
              ...data,
              id: generateId("pur"),
              status: "pending",
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      completePurchase: (id) => {
        const state = get();
        const purchase = state.purchases.find((p) => p.id === id);
        if (!purchase) return;

        const updatedProducts = state.products.map((p) =>
          p.id === purchase.productId
            ? {
                ...p,
                stock: {
                  ...p.stock,
                  [purchase.size]:
                    (p.stock[purchase.size] || 0) + purchase.quantity,
                },
              }
            : p
        );

        const updatedOrders = state.orders.map((o) => {
          if (
            o.productId === purchase.productId &&
            o.size === purchase.size &&
            o.orderStatus === "purchasing"
          ) {
            const prod = updatedProducts.find((p) => p.id === o.productId);
            if (prod && (prod.stock[o.size] || 0) >= o.quantity) {
              return { ...o, orderStatus: "ready" as OrderStatus };
            }
          }
          return o;
        });

        set({
          purchases: state.purchases.map((p) =>
            p.id === id
              ? { ...p, status: "completed", completedAt: new Date().toISOString() }
              : p
          ),
          products: updatedProducts,
          orders: updatedOrders,
        });
      },

      updatePurchase: (id, data) =>
        set((state) => ({
          purchases: state.purchases.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deletePurchase: (id) =>
        set((state) => ({
          purchases: state.purchases.filter((p) => p.id !== id),
        })),
    }),
    {
      name: "uniform-ordering-store",
    }
  )
);
