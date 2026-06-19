import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OrderException, ExceptionType } from "@/types";
import { generateMockExceptions } from "@/utils/mockData";
import { uid, formatDate } from "@/utils/formatters";
import { useOrderStore } from "./order";
import { useEmployeeStore } from "./employee";

interface ExceptionStore {
  exceptions: OrderException[];
  initialized: boolean;
  initMockData: () => void;
  addException: (
    data: Omit<OrderException, "id" | "createdAt" | "status" | "refundStatus"> & {
      refundStatus?: OrderException["refundStatus"];
    }
  ) => void;
  updateException: (id: string, data: Partial<OrderException>) => void;
  getByOrderId: (orderId: string) => OrderException | undefined;
  getByStatus: (status: string | "all") => OrderException[];
  getByType: (type: ExceptionType | "all") => OrderException[];
  getPendingRefunds: () => OrderException[];
  getByDateRange: (start: string, end: string) => OrderException[];
}

export const useExceptionStore = create<ExceptionStore>()(
  persist(
    (set, get) => ({
      exceptions: [],
      initialized: false,

      initMockData: () => {
        if (get().initialized && get().exceptions.length > 0) return;
        const orders = useOrderStore.getState().orders;
        const emps = useEmployeeStore.getState().employees;
        const list =
          orders.length > 0 ? generateMockExceptions(orders, emps) : [];
        set({ exceptions: list, initialized: true });
      },

      addException: (data) => {
        const ex: OrderException = {
          id: uid(),
          status: "pending",
          refundStatus: data.refundStatus ?? "pending",
          createdAt: formatDate(new Date()),
          ...data,
        };
        set((s) => ({ exceptions: [ex, ...s.exceptions] }));
      },

      updateException: (id, data) => {
        set((s) => ({
          exceptions: s.exceptions.map((e) =>
            e.id === id ? { ...e, ...data } : e
          ),
        }));
      },

      getByOrderId: (orderId) =>
        get().exceptions.find((e) => e.orderId === orderId),

      getByStatus: (status) => {
        if (status === "all") return get().exceptions;
        return get().exceptions.filter((e) => e.status === status);
      },

      getByType: (type) => {
        if (type === "all") return get().exceptions;
        return get().exceptions.filter((e) => e.type === type);
      },

      getPendingRefunds: () =>
        get().exceptions.filter((e) => e.refundStatus === "pending"),

      getByDateRange: (start, end) =>
        get().exceptions.filter(
          (e) => e.createdAt >= start && e.createdAt <= end
        ),
    }),
    { name: "lunch-exceptions" }
  )
);
