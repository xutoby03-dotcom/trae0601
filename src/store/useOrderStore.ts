import { create } from 'zustand';
import type { Order, BalloonType } from '@/types';
import { mockOrders, mockBalloonTypes } from '@/data/mockData';

interface OrderState {
  orders: Order[];
  balloonTypes: BalloonType[];
  getOrderById: (id: string) => Order | undefined;
  getBalloonTypeById: (id: string) => BalloonType | undefined;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: mockOrders,
  balloonTypes: mockBalloonTypes,

  getOrderById: (id) => {
    return get().orders.find((o) => o.id === id);
  },

  getBalloonTypeById: (id) => {
    return get().balloonTypes.find((b) => b.id === id);
  },
}));
