import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Dish, Order, OrderItem, OrderStatus, DeliveryType, MealType } from "@/types";
import { CANCEL_DEADLINES } from "@/types";
import { MOCK_DISHES, MOCK_ORDERS, HISTORY_ORDERS } from "@/data/mockData";

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const genId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

interface StoreState {
  dishes: Dish[];
  orders: Order[];
  selectedDate: string;
  selectedMealType: MealType;
  setSelectedDate: (date: string) => void;
  setSelectedMealType: (mt: MealType) => void;
  addDish: (dish: Omit<Dish, "id">) => void;
  updateDish: (id: string, dish: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  addOrder: (data: {
    elderlyName: string;
    building: string;
    mealDate: string;
    mealType: MealType;
    dietaryNote: string;
    deliveryType: DeliveryType;
    phone: string;
    items: OrderItem[];
  }) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  cancelOrder: (id: string) => { success: boolean; message: string };
  canCancelOrder: (order: Order) => { canCancel: boolean; reason?: string };
  resetStore: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      dishes: MOCK_DISHES,
      orders: [...MOCK_ORDERS, ...HISTORY_ORDERS],
      selectedDate: todayStr(),
      selectedMealType: "lunch",

      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedMealType: (mt) => set({ selectedMealType: mt }),

      addDish: (dish) =>
        set((s) => ({
          dishes: [...s.dishes, { ...dish, id: genId() }],
        })),

      updateDish: (id, dish) =>
        set((s) => ({
          dishes: s.dishes.map((d) => (d.id === id ? { ...d, ...dish } : d)),
        })),

      deleteDish: (id) =>
        set((s) => ({
          dishes: s.dishes.filter((d) => d.id !== id),
        })),

      addOrder: (data) => {
        const now = new Date();
        const [h, m] = CANCEL_DEADLINES[data.mealType].split(":").map(Number);
        const deadline = new Date(`${data.mealDate}T00:00:00`);
        deadline.setHours(h, m, 0, 0);

        set((s) => ({
          orders: [
            {
              id: genId(),
              ...data,
              status: "pending",
              createdAt: now.toISOString(),
              cancelDeadline: deadline.toISOString(),
            },
            ...s.orders,
          ],
        }));
      },

      updateOrderStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  cancelledAt:
                    status === "cancelled" ? new Date().toISOString() : o.cancelledAt,
                }
              : o
          ),
        })),

      canCancelOrder: (order) => {
        if (order.status === "cancelled") {
          return { canCancel: false, reason: "订单已取消" };
        }
        if (order.status === "completed") {
          return { canCancel: false, reason: "订单已完成，无法取消" };
        }
        const now = new Date();
        const deadline = new Date(order.cancelDeadline);
        if (now > deadline) {
          const d = new Date(order.mealDate);
          const [h, m] = CANCEL_DEADLINES[order.mealType].split(":");
          return {
            canCancel: false,
            reason: `已超过取消截止时间（${d.getMonth() + 1}月${d.getDate()}日 ${h}:${m} 前可取消）`,
          };
        }
        return { canCancel: true };
      },

      cancelOrder: (id) => {
        const state = get();
        const order = state.orders.find((o) => o.id === id);
        if (!order) return { success: false, message: "订单不存在" };

        const check = state.canCancelOrder(order);
        if (!check.canCancel) {
          return { success: false, message: check.reason || "无法取消" };
        }

        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id
              ? { ...o, status: "cancelled", cancelledAt: new Date().toISOString() }
              : o
          ),
        }));
        return { success: true, message: "取消成功" };
      },

      resetStore: () =>
        set({
          dishes: MOCK_DISHES,
          orders: [...MOCK_ORDERS, ...HISTORY_ORDERS],
        }),
    }),
    {
      name: "canteen-store",
      partialize: (s) => ({
        dishes: s.dishes,
        orders: s.orders,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.orders = state.orders.map((o) => {
          if (o.mealDate) return o;
          const d = new Date(o.createdAt);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const mealDate = `${y}-${m}-${day}`;
          const deadline = new Date(`${mealDate}T00:00:00`);
          const [h, min] = CANCEL_DEADLINES[o.mealType].split(":").map(Number);
          deadline.setHours(h, min, 0, 0);
          return { ...o, mealDate, cancelDeadline: deadline.toISOString() };
        });
      },
    }
  )
);
