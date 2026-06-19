import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order, PickupPoint } from "@/types";
import { generateMockOrders } from "@/utils/mockData";
import { uid } from "@/utils/formatters";
import { useEmployeeStore } from "./employee";

interface OrderStore {
  orders: Order[];
  initialized: boolean;
  initMockData: () => void;
  addOrder: (
    data: Omit<Order, "id" | "packingStatus" | "pickupStatus">
  ) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  getByDate: (date: string) => Order[];
  getByEmployee: (employeeId: string) => Order[];
  getByPaymentStatus: (status: string | "all") => Order[];
  getByRestaurant: (restaurant: string | "all", date?: string) => Order[];
  getByPickupPoint: (point: PickupPoint | "all", date?: string) => Order[];
  markPacked: (id: string) => void;
  markPicked: (id: string) => void;
  markException: (id: string) => void;
  markPaid: (ids: string[]) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      initialized: false,

      initMockData: () => {
        if (get().initialized && get().orders.length > 0) return;
        const emps = useEmployeeStore.getState().employees;
        const orders = emps.length > 0 ? generateMockOrders(emps) : [];
        set({ orders, initialized: true });
      },

      addOrder: (data) => {
        const order: Order = {
          ...data,
          id: uid(),
          packingStatus: "pending",
          pickupStatus: "pending",
        };
        set((s) => ({ orders: [order, ...s.orders] }));
      },

      updateOrder: (id, data) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
        }));
      },

      deleteOrder: (id) => {
        set((s) => ({ orders: s.orders.filter((o) => o.id !== id) }));
      },

      getByDate: (date) => get().orders.filter((o) => o.orderDate === date),

      getByEmployee: (employeeId) =>
        get().orders.filter((o) => o.employeeId === employeeId),

      getByPaymentStatus: (status) => {
        if (status === "all") return get().orders;
        return get().orders.filter((o) => o.paymentStatus === status);
      },

      getByRestaurant: (restaurant, date) => {
        let list = get().orders;
        if (restaurant !== "all")
          list = list.filter((o) => o.restaurant === restaurant);
        if (date) list = list.filter((o) => o.orderDate === date);
        return list;
      },

      getByPickupPoint: (point, date) => {
        const emps = useEmployeeStore.getState().employees;
        const pointEmpIds =
          point === "all"
            ? emps.map((e) => e.id)
            : emps.filter((e) => e.pickupPoint === point).map((e) => e.id);
        let list = get().orders.filter((o) => pointEmpIds.includes(o.employeeId));
        if (date) list = list.filter((o) => o.orderDate === date);
        return list;
      },

      markPacked: (id) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, packingStatus: "packed" } : o
          ),
        }));
      },

      markPicked: (id) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, pickupStatus: "picked" } : o
          ),
        }));
      },

      markException: (id) => {
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, packingStatus: "exception" } : o
          ),
        }));
      },

      markPaid: (ids) => {
        const setIds = new Set(ids);
        set((s) => ({
          orders: s.orders.map((o) =>
            setIds.has(o.id) ? { ...o, paymentStatus: "paid" } : o
          ),
        }));
      },
    }),
    { name: "lunch-orders" }
  )
);
