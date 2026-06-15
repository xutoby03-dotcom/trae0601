import { create } from 'zustand';
import type { Order, Chef } from '@/types';
import { OrderStatus, ContactStatus } from '@/types';
import { mockOrders, mockChefs } from '@/data/mockData';

interface OrderStore {
  orders: Order[];
  chefs: Chef[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignChef: (orderId: string, chefId: string) => void;
  unassignChef: (orderId: string) => void;
  toggleContactStatus: (orderId: string) => void;
  updateContactNote: (orderId: string, note: string) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: mockOrders,
  chefs: mockChefs,

  updateOrderStatus: (orderId: string, status: OrderStatus) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    })),

  assignChef: (orderId: string, chefId: string) =>
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId);
      const chef = state.chefs.find((c) => c.id === chefId);
      if (!order || !chef) return state;
      if (!order.referenceImageUrl && chef.isRookie) {
        return state;
      }
      return {
        orders: state.orders.map((o) => (o.id === orderId ? { ...o, chefId } : o)),
      };
    }),

  unassignChef: (orderId: string) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, chefId: undefined } : o)),
    })),

  toggleContactStatus: (orderId: string) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        if (o.contactStatus === ContactStatus.CONTACTED) {
          return { ...o, contactStatus: ContactStatus.PENDING, contactTime: undefined };
        }
        return { ...o, contactStatus: ContactStatus.CONTACTED, contactTime: new Date().toISOString() };
      }),
    })),

  updateContactNote: (orderId: string, note: string) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, contactNote: note } : o)),
    })),
}));
