import { create } from 'zustand';
import type { Order, Chef } from '@/types';
import { OrderStatus } from '@/types';
import { mockOrders, mockChefs } from '@/data/mockData';

interface OrderStore {
  orders: Order[];
  chefs: Chef[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignChef: (orderId: string, chefId: string) => void;
  unassignChef: (orderId: string) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: mockOrders,
  chefs: mockChefs,

  updateOrderStatus: (orderId: string, status: OrderStatus) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    })),

  assignChef: (orderId: string, chefId: string) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, chefId } : o)),
    })),

  unassignChef: (orderId: string) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, chefId: undefined } : o)),
    })),
}));
