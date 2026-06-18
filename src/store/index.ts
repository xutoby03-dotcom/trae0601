import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Room, SupplyItem, Inspection, Task, Feedback, SupplyType } from '@/types';
import { mockRooms, mockSupplies, mockInspections, mockTasks, mockFeedbacks } from '@/data/mockData';
import { generateId } from '@/utils/helpers';
import { LOW_STOCK_THRESHOLDS } from '@/utils/constants';

interface AppState {
  rooms: Room[];
  supplies: SupplyItem[];
  inspections: Inspection[];
  tasks: Task[];
  feedbacks: Feedback[];

  addRoom: (room: Omit<Room, 'id' | 'createdAt'>) => void;
  updateRoom: (id: string, data: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  updateSupply: (id: string, data: Partial<SupplyItem>) => void;
  checkLowStock: () => void;

  addInspection: (inspection: Omit<Inspection, 'id'>) => void;

  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;

  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'status'>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      rooms: mockRooms,
      supplies: mockSupplies,
      inspections: mockInspections,
      tasks: mockTasks,
      feedbacks: mockFeedbacks,

      addRoom: (room) => {
        const newRoom: Room = {
          ...room,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        const supplyTypes: SupplyType[] = ['blackPen', 'redPen', 'bluePen', 'eraser', 'cleaner', 'magnet'];
        const newSupplies: SupplyItem[] = supplyTypes.map((type) => ({
          id: generateId(),
          roomId: newRoom.id,
          type,
          quantity: type === 'cleaner' ? 1 : type === 'magnet' ? 10 : type === 'eraser' ? 2 : 3,
          remainingPercent: type === 'cleaner' ? 100 : undefined,
          location: '白板槽/储物柜',
          updatedAt: new Date().toISOString(),
        }));
        set((state) => ({
          rooms: [...state.rooms, newRoom],
          supplies: [...state.supplies, ...newSupplies],
        }));
      },

      updateRoom: (id, data) => {
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }));
      },

      deleteRoom: (id) => {
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== id),
          supplies: state.supplies.filter((s) => s.roomId !== id),
          tasks: state.tasks.filter((t) => t.roomId !== id),
          inspections: state.inspections.filter((i) => i.roomId !== id),
          feedbacks: state.feedbacks.filter((f) => f.roomId !== id),
        }));
      },

      updateSupply: (id, data) => {
        set((state) => ({
          supplies: state.supplies.map((s) =>
            s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s
          ),
        }));
        setTimeout(() => get().checkLowStock(), 0);
      },

      checkLowStock: () => {
        const { supplies, tasks, addTask } = get();
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

        supplies.forEach((supply) => {
          const threshold = LOW_STOCK_THRESHOLDS[supply.type];
          const isLow =
            supply.type === 'cleaner'
              ? (supply.remainingPercent ?? 0) <= threshold
              : supply.quantity <= threshold;

          if (isLow) {
            const existingTask = tasks.find(
              (t) =>
                t.roomId === supply.roomId &&
                t.supplyType === supply.type &&
                t.status !== 'completed' &&
                new Date(t.createdAt) > twoDaysAgo
            );

            if (!existingTask) {
              const priority = supply.quantity === 0 || (supply.remainingPercent ?? 100) <= 10 ? 'urgent' : supply.quantity <= 1 ? 'high' : 'medium';
              addTask({
                roomId: supply.roomId,
                source: 'low_stock',
                supplyType: supply.type,
                priority,
                status: 'pending',
                description:
                  supply.type === 'cleaner'
                    ? `清洁液余量仅剩${supply.remainingPercent}%，请补充`
                    : `${supply.type.includes('Pen') ? '白板笔' : supply.type === 'eraser' ? '板擦' : '磁钉'}库存仅${supply.quantity}个，请补充`,
                assignee: '',
              });
            }
          }
        });
      },

      addInspection: (inspection) => {
        const newInspection: Inspection = {
          ...inspection,
          id: generateId(),
        };
        set((state) => ({
          inspections: [newInspection, ...state.inspections],
        }));

        const { supplies, updateSupply } = get();
        Object.entries(inspection.penStatus).forEach(([penType, isWorking]) => {
          if (!isWorking) {
            const supply = supplies.find(
              (s) => s.roomId === inspection.roomId && s.type === penType
            );
            if (supply && supply.quantity > 0) {
              updateSupply(supply.id, { quantity: supply.quantity - 1 });
            }
          }
        });

        if (inspection.eraserStatus === 'replace') {
          const supply = supplies.find(
            (s) => s.roomId === inspection.roomId && s.type === 'eraser'
          );
          if (supply && supply.quantity > 0) {
            updateSupply(supply.id, { quantity: supply.quantity - 1 });
          }
        }

        const cleanerSupply = supplies.find(
          (s) => s.roomId === inspection.roomId && s.type === 'cleaner'
        );
        if (cleanerSupply) {
          updateSupply(cleanerSupply.id, { remainingPercent: inspection.cleanerLevel });
        }

        setTimeout(() => get().checkLowStock(), 0);
      },

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },

      updateTask: (id, data) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === id);
          if (!task) return state;

          let newSupplies = state.supplies;
          if (data.status === 'completed' && task.status !== 'completed') {
            const supply = state.supplies.find(
              (s) => s.roomId === task.roomId && s.type === task.supplyType
            );
            if (supply) {
              const refillQty =
                task.supplyType === 'cleaner'
                  ? supply.quantity
                  : task.supplyType === 'magnet'
                  ? Math.max(0, 10 - supply.quantity)
                  : task.supplyType === 'eraser'
                  ? Math.max(0, 2 - supply.quantity)
                  : Math.max(0, 5 - supply.quantity);

              newSupplies = state.supplies.map((s) =>
                s.id === supply.id
                  ? {
                      ...s,
                      quantity: task.supplyType === 'cleaner' ? s.quantity : s.quantity + refillQty,
                      remainingPercent: task.supplyType === 'cleaner' ? 100 : s.remainingPercent,
                      updatedAt: new Date().toISOString(),
                    }
                  : s
              );
            }
          }

          return {
            tasks: state.tasks.map((t) =>
              t.id === id
                ? {
                    ...t,
                    ...data,
                    completedAt: data.status === 'completed' ? new Date().toISOString() : t.completedAt,
                  }
                : t
            ),
            supplies: newSupplies,
          };
        });
      },

      addFeedback: (feedback) => {
        const newFeedback: Feedback = {
          ...feedback,
          id: generateId(),
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        set((state) => ({
          feedbacks: [newFeedback, ...state.feedbacks],
        }));

        let supplyType: SupplyType | null = null;
        if (feedback.type === 'pen_empty') supplyType = 'blackPen';
        if (feedback.type === 'supply_missing') supplyType = 'eraser';

        if (supplyType) {
          setTimeout(() => {
            get().addTask({
              roomId: feedback.roomId,
              source: 'feedback',
              supplyType: supplyType!,
              priority: 'high',
              status: 'pending',
              description: `员工反馈：${feedback.description}`,
              assignee: '',
            });
          }, 0);
        }
      },
    }),
    {
      name: 'whiteboard-supply-store',
    }
  )
);
