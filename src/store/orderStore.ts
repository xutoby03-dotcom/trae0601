import { create } from 'zustand';
import type { Order } from '@/types';
import { getStorage, setStorage } from '@/utils/storage';
import { mockOrders } from '@/data/mockData';
import { generateId, startOfDay, endOfDay } from '@/utils/date';
import { useTastingStore } from './tastingStore';

interface OrderState {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  getOrdersByDate: (date: Date) => Order[];
  getOrdersByTastingId: (tastingId: string) => Order[];
}

const STORAGE_KEY = 'orders';

export const useOrderStore = create<OrderState>((set, get) => {
  const stored = getStorage<Order[]>(STORAGE_KEY, []);
  const initialOrders = stored.length > 0 ? stored : mockOrders;
  
  if (stored.length === 0) {
    setStorage(STORAGE_KEY, initialOrders);
  }

  return {
    orders: initialOrders,

    addOrder: (order) => {
      const newOrder: Order = {
        ...order,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      
      if (order.tastingId) {
        useTastingStore.getState().incrementConvertedOrders(order.tastingId);
      }
      
      set((state) => {
        const orders = [...state.orders, newOrder];
        setStorage(STORAGE_KEY, orders);
        return { orders };
      });
    },

    getOrdersByDate: (date) => {
      const start = startOfDay(date).getTime();
      const end = endOfDay(date).getTime();
      return get().orders.filter((o) => {
        const t = new Date(o.createdAt).getTime();
        return t >= start && t <= end;
      });
    },

    getOrdersByTastingId: (tastingId) => {
      return get().orders.filter((o) => o.tastingId === tastingId);
    },
  };
});
