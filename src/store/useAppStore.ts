import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GroupBatch,
  CustomerOrder,
  QueueState,
  DashboardStats,
  HourlyPressure,
} from '../types';
import { generateId, generatePickupCode } from '../utils/pickupCode';
import { enqueueOrder, handleTimeout, isCallTimedOut } from '../utils/queue';
import { generateMockBatches, generateMockOrders } from '../utils/mockData';
import { speakQueueNumber, speakPriorityReminder } from '../utils/speech';

interface AppState {
  batches: GroupBatch[];
  orders: CustomerOrder[];
  queueState: QueueState;
  selectedBatchId: string | null;
  initialized: boolean;

  initMockData: () => void;

  addBatch: (batch: Omit<GroupBatch, 'id' | 'createdAt'>) => void;
  updateBatch: (id: string, data: Partial<GroupBatch>) => void;
  deleteBatch: (id: string) => void;
  setSelectedBatchId: (id: string | null) => void;

  addOrder: (
    order: Omit<
      CustomerOrder,
      'id' | 'pickupCode' | 'queueStatus' | 'callCount' | 'isPriority'
    >
  ) => void;
  updateOrder: (id: string, data: Partial<CustomerOrder>) => void;
  deleteOrder: (id: string) => void;

  enqueue: (orderId: string) => void;
  callNext: () => void;
  markPicked: (orderId: string) => void;
  checkAndHandleTimeout: () => void;

  getOrdersByBatchId: (batchId: string) => CustomerOrder[];
  getBatchById: (batchId: string) => GroupBatch | undefined;
  findOrderByPhoneOrCode: (
    phoneOrCode: string,
    batchId?: string
  ) => CustomerOrder | undefined;
  getDashboardStats: () => DashboardStats;
}

const initialQueueState: QueueState = {
  currentNumber: 0,
  waitingQueue: [],
  calledOrder: null,
  lastCalledAt: null,
};

const initializeData = () => {
  const mockBatches = generateMockBatches();
  const mockOrders = generateMockOrders(mockBatches);

  const waitingQueue = mockOrders
    .filter((o) => o.queueStatus === 'waiting')
    .sort((a, b) => {
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      return (a.queueNumber || 0) - (b.queueNumber || 0);
    });

  const calledOrder = mockOrders.find((o) => o.queueStatus === 'called') || null;
  const maxNumber = Math.max(
    0,
    ...mockOrders.map((o) => o.queueNumber || 0)
  );

  return {
    batches: mockBatches,
    orders: mockOrders,
    queueState: {
      currentNumber: maxNumber,
      waitingQueue,
      calledOrder,
      lastCalledAt: calledOrder?.calledAt || null,
    },
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      batches: [],
      orders: [],
      queueState: initialQueueState,
      selectedBatchId: null,
      initialized: false,

      initMockData: () => {
        if (get().initialized) return;
        const data = initializeData();
        set({
          ...data,
          initialized: true,
        });
      },

      addBatch: (batch) => {
        const newBatch: GroupBatch = {
          ...batch,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          batches: [...state.batches, newBatch],
        }));
      },

      updateBatch: (id, data) => {
        set((state) => ({
          batches: state.batches.map((b) =>
            b.id === id ? { ...b, ...data } : b
          ),
        }));
      },

      deleteBatch: (id) => {
        set((state) => ({
          batches: state.batches.filter((b) => b.id !== id),
          orders: state.orders.filter((o) => o.batchId !== id),
        }));
      },

      setSelectedBatchId: (id) => {
        set({ selectedBatchId: id });
      },

      addOrder: (order) => {
        const batch = get().getBatchById(order.batchId);
        const newOrder: CustomerOrder = {
          ...order,
          id: generateId(),
          pickupCode: generatePickupCode(),
          queueStatus: 'not_queued',
          callCount: 0,
          isPriority: batch?.needRefrigeration || false,
        };
        set((state) => ({
          orders: [...state.orders, newOrder],
        }));
      },

      updateOrder: (id, data) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id ? { ...o, ...data } : o
          ),
        }));
      },

      deleteOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
          queueState: {
            ...state.queueState,
            waitingQueue: state.queueState.waitingQueue.filter(
              (o) => o.id !== id
            ),
            calledOrder:
              state.queueState.calledOrder?.id === id
                ? null
                : state.queueState.calledOrder,
          },
        }));
      },

      enqueue: (orderId) => {
        const state = get();
        const order = state.orders.find((o) => o.id === orderId);
        if (!order || order.queueStatus === 'waiting' || order.queueStatus === 'called') {
          return;
        }
        if (order.paymentStatus === 'unpaid') {
          return;
        }

        const newNumber = state.queueState.currentNumber + 1;
        const updatedOrder: CustomerOrder = {
          ...order,
          queueNumber: newNumber,
          queueStatus: 'waiting',
          queuedAt: new Date().toISOString(),
        };

        const newQueue = enqueueOrder(updatedOrder, state.queueState.waitingQueue);

        set({
          orders: state.orders.map((o) =>
            o.id === orderId ? updatedOrder : o
          ),
          queueState: {
            ...state.queueState,
            currentNumber: newNumber,
            waitingQueue: newQueue,
          },
        });

        if (updatedOrder.isPriority) {
          speakPriorityReminder();
        }
      },

      callNext: () => {
        const state = get();
        if (state.queueState.calledOrder) return;
        if (state.queueState.waitingQueue.length === 0) return;

        const [nextOrder, ...remainingQueue] = state.queueState.waitingQueue;
        const calledAt = new Date().toISOString();

        const updatedOrder: CustomerOrder = {
          ...nextOrder,
          queueStatus: 'called',
          calledAt,
          callCount: nextOrder.callCount + 1,
        };

        set({
          orders: state.orders.map((o) =>
            o.id === nextOrder.id ? updatedOrder : o
          ),
          queueState: {
            ...state.queueState,
            waitingQueue: remainingQueue,
            calledOrder: updatedOrder,
            lastCalledAt: calledAt,
          },
        });

        if (updatedOrder.queueNumber) {
          speakQueueNumber(updatedOrder.queueNumber, updatedOrder.customerName);
        }
      },

      markPicked: (orderId) => {
        const state = get();
        const updatedOrder: CustomerOrder = {
          ...state.orders.find((o) => o.id === orderId)!,
          queueStatus: 'picked',
          pickedAt: new Date().toISOString(),
        };

        set({
          orders: state.orders.map((o) =>
            o.id === orderId ? updatedOrder : o
          ),
          queueState: {
            ...state.queueState,
            calledOrder:
              state.queueState.calledOrder?.id === orderId
                ? null
                : state.queueState.calledOrder,
          },
        });
      },

      checkAndHandleTimeout: () => {
        const state = get();
        const { calledOrder } = state.queueState;

        if (!calledOrder || !isCallTimedOut(calledOrder.calledAt)) return;

        const { updatedOrder, newQueue } = handleTimeout(
          calledOrder,
          state.queueState.waitingQueue
        );

        set({
          orders: state.orders.map((o) =>
            o.id === calledOrder.id ? updatedOrder : o
          ),
          queueState: {
            ...state.queueState,
            waitingQueue: newQueue,
            calledOrder: null,
            lastCalledAt: null,
          },
        });
      },

      getOrdersByBatchId: (batchId) => {
        return get().orders.filter((o) => o.batchId === batchId);
      },

      getBatchById: (batchId) => {
        return get().batches.find((b) => b.id === batchId);
      },

      findOrderByPhoneOrCode: (phoneOrCode, batchId) => {
        return get().orders.find((o) => {
          const matches =
            o.phone.includes(phoneOrCode) ||
            o.pickupCode.toLowerCase() === phoneOrCode.toLowerCase();
          if (batchId) {
            return matches && o.batchId === batchId;
          }
          return matches;
        });
      },

      getDashboardStats: () => {
        const state = get();
        const { orders, queueState } = state;

        const pickedCount = orders.filter(
          (o) => o.queueStatus === 'picked'
        ).length;
        const waitingCount = queueState.waitingQueue.length;
        const notPickedCount = orders.filter(
          (o) => o.queueStatus !== 'picked' && o.queueStatus !== 'not_queued'
        ).length;
        const abnormalCount = orders.filter(
          (o) => o.callCount > 1 || o.paymentStatus === 'unpaid'
        ).length;

        const hourlyMap = new Map<string, number>();
        orders.forEach((o) => {
          if (o.pickedAt) {
            const hour = new Date(o.pickedAt).getHours().toString().padStart(2, '0') + ':00';
            hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1);
          }
        });

        const hourlyPressure: HourlyPressure[] = Array.from(hourlyMap.entries())
          .map(([hour, count]) => ({ hour, count }))
          .sort((a, b) => a.hour.localeCompare(b.hour));

        return {
          currentCalled: queueState.calledOrder?.queueNumber || null,
          waitingCount,
          pickedCount,
          notPickedCount,
          abnormalCount,
          hourlyPressure,
        };
      },
    }),
    {
      name: 'pickup-queue-storage',
      partialize: (state) => ({
        batches: state.batches,
        orders: state.orders,
        queueState: state.queueState,
        initialized: state.initialized,
      }),
    }
  )
);
