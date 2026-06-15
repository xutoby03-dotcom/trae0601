import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order, Item, Participant, Adjustment, AllocationMethod } from '@/types';
import { generateId } from '@/types';
import { mockOrders, mockPayments, mockPickupStatus } from '@/utils/mockData';

interface OrderState {
  orders: Order[];
  payments: Record<string, Record<string, number>>;
  pickupStatus: Record<string, Record<string, boolean>>;
  getOrder: (id: string) => Order | undefined;
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addItem: (orderId: string, item: Omit<Item, 'id' | 'orderId'>) => void;
  updateItem: (orderId: string, itemId: string, updates: Partial<Item>) => void;
  deleteItem: (orderId: string, itemId: string) => void;
  addParticipant: (orderId: string, name: string) => void;
  removeParticipant: (orderId: string, participantId: string) => void;
  addAdjustment: (orderId: string, adjustment: Omit<Adjustment, 'id' | 'orderId' | 'createdAt'>) => void;
  updateAdjustment: (orderId: string, adjId: string, updates: Partial<Adjustment>) => void;
  deleteAdjustment: (orderId: string, adjId: string) => void;
  setAllocationMethod: (orderId: string, method: AllocationMethod) => void;
  setPayment: (orderId: string, participantId: string, amount: number) => void;
  setPickupStatus: (orderId: string, participantId: string, pickedUp: boolean) => void;
  resetWithMockData: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      payments: {},
      pickupStatus: {},

      getOrder: (id) => get().orders.find((o) => o.id === id),

      addOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: generateId(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          orders: [newOrder, ...state.orders],
          payments: { ...state.payments, [newOrder.id]: {} },
          pickupStatus: { ...state.pickupStatus, [newOrder.id]: {} },
        }));
        return newOrder;
      },

      updateOrder: (id, updates) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, ...updates, updatedAt: Date.now() } : o
          ),
        })),

      deleteOrder: (id) =>
        set((state) => {
          const { [id]: _, ...payments } = state.payments;
          const { [id]: __, ...pickup } = state.pickupStatus;
          return {
            orders: state.orders.filter((o) => o.id !== id),
            payments,
            pickupStatus: pickup,
          };
        }),

      addItem: (orderId, itemData) => {
        const newItem: Item = {
          ...itemData,
          id: generateId(),
          orderId,
        };
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, items: [...o.items, newItem], updatedAt: Date.now() }
              : o
          ),
        }));
      },

      updateItem: (orderId, itemId, updates) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  items: o.items.map((i) =>
                    i.id === itemId ? { ...i, ...updates } : i
                  ),
                  updatedAt: Date.now(),
                }
              : o
          ),
        })),

      deleteItem: (orderId, itemId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  items: o.items.filter((i) => i.id !== itemId),
                  updatedAt: Date.now(),
                }
              : o
          ),
        })),

      addParticipant: (orderId, name) => {
        const newParticipant: Participant = {
          id: generateId(),
          name,
        };
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  participants: [...o.participants, newParticipant],
                  updatedAt: Date.now(),
                }
              : o
          ),
        }));
      },

      removeParticipant: (orderId, participantId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  participants: o.participants.filter((p) => p.id !== participantId),
                  items: o.items.filter((i) => i.buyerId !== participantId),
                  updatedAt: Date.now(),
                }
              : o
          ),
        })),

      addAdjustment: (orderId, adjData) => {
        const newAdj: Adjustment = {
          ...adjData,
          id: generateId(),
          orderId,
          createdAt: Date.now(),
        };
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  adjustments: [...o.adjustments, newAdj],
                  updatedAt: Date.now(),
                }
              : o
          ),
        }));
      },

      updateAdjustment: (orderId, adjId, updates) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  adjustments: o.adjustments.map((a) =>
                    a.id === adjId ? { ...a, ...updates } : a
                  ),
                  updatedAt: Date.now(),
                }
              : o
          ),
        })),

      deleteAdjustment: (orderId, adjId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  adjustments: o.adjustments.filter((a) => a.id !== adjId),
                  updatedAt: Date.now(),
                }
              : o
          ),
        })),

      setAllocationMethod: (orderId, method) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, allocationMethod: method, updatedAt: Date.now() }
              : o
          ),
        })),

      setPayment: (orderId, participantId, amount) =>
        set((state) => ({
          payments: {
            ...state.payments,
            [orderId]: {
              ...state.payments[orderId],
              [participantId]: amount,
            },
          },
        })),

      setPickupStatus: (orderId, participantId, pickedUp) =>
        set((state) => ({
          pickupStatus: {
            ...state.pickupStatus,
            [orderId]: {
              ...state.pickupStatus[orderId],
              [participantId]: pickedUp,
            },
          },
        })),

      resetWithMockData: () => {
        const paymentsObj: Record<string, Record<string, number>> = {};
        mockPayments.forEach((innerMap, orderId) => {
          paymentsObj[orderId] = Object.fromEntries(innerMap);
        });

        const pickupObj: Record<string, Record<string, boolean>> = {};
        mockPickupStatus.forEach((innerMap, orderId) => {
          pickupObj[orderId] = Object.fromEntries(innerMap);
        });

        set({
          orders: mockOrders,
          payments: paymentsObj,
          pickupStatus: pickupObj,
        });
      },
    }),
    {
      name: 'haitao-order-storage',
    }
  )
);
