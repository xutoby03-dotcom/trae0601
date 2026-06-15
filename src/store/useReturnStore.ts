import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReturnOrder, ReturnStatus } from '@/types/return';
import { mockOrders } from '@/data/mockData';

interface ReturnState {
  orders: ReturnOrder[];
  addOrder: (order: Omit<ReturnOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOrder: (id: string, updates: Partial<ReturnOrder>) => void;
  deleteOrder: (id: string) => void;
  updateStatus: (id: string, status: ReturnStatus) => void;
  addPhoto: (orderId: string, photoUrl: string) => void;
  removePhoto: (orderId: string, photoIndex: number) => void;
}

export const useReturnStore = create<ReturnState>()(
  persist(
    (set) => ({
      orders: mockOrders,

      addOrder: (orderData) =>
        set((state) => {
          const newOrder: ReturnOrder = {
            ...orderData,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { orders: [...state.orders, newOrder] };
        }),

      updateOrder: (id, updates) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? { ...order, ...updates, updatedAt: new Date().toISOString() }
              : order
          ),
        })),

      deleteOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
        })),

      updateStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  status,
                  updatedAt: new Date().toISOString(),
                  refundApplyDate:
                    status === 'refund_pending' && !order.refundApplyDate
                      ? new Date().toISOString().split('T')[0]
                      : order.refundApplyDate,
                }
              : order
          ),
        })),

      addPhoto: (orderId, photoUrl) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  photos: [...order.photos, photoUrl],
                  updatedAt: new Date().toISOString(),
                }
              : order
          ),
        })),

      removePhoto: (orderId, photoIndex) =>
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  photos: order.photos.filter((_, i) => i !== photoIndex),
                  updatedAt: new Date().toISOString(),
                }
              : order
          ),
        })),
    }),
    {
      name: 'return-orders-storage',
    }
  )
);
