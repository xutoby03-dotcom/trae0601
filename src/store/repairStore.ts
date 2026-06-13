import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RepairOrder, RepairLog, RepairStatus } from "@/types";
import { STATUS_FLOW } from "@/types";
import { mockRepairs as mockRepairOrders, mockRepairLogs } from "@/mock/repairs";

interface CreateRepairInput {
  instrumentId: string;
  faultDescription: string;
  impactLevel: 1 | 2 | 3 | 4 | 5;
  affectClass: boolean;
  reporterId: string;
  faultPhoto: string;
}

interface UpdateStatusInput {
  repairId: string;
  newStatus: RepairStatus;
  handlerId: string;
  note: string;
}

interface RepairOrderWithLogs extends RepairOrder {
  logs: RepairLog[];
}

interface StatusStats {
  pending: number;
  processing: number;
  waiting_parts: number;
  completed: number;
  scrapped: number;
}

interface ClassroomStat {
  classroom: string;
  count: number;
}

interface RepeatRepairRank {
  instrumentId: string;
  count: number;
}

interface RepairState {
  repairOrders: RepairOrder[];
  repairLogs: RepairLog[];

  createRepairOrder: (input: CreateRepairInput) => RepairOrder;
  updateStatus: (input: UpdateStatusInput) => boolean;
  canTransition: (from: RepairStatus, to: RepairStatus) => boolean;

  getRepairsByPriority: () => RepairOrder[];
  getRepairsGroupedByStatus: () => Record<RepairStatus, RepairOrder[]>;
  getRepairDetail: (repairId: string) => RepairOrderWithLogs | undefined;

  getStatusStats: () => StatusStats;
  getClassroomStats: () => ClassroomStat[];
  getAverageRepairDuration: () => number;
  getRepeatRepairRank: () => RepeatRepairRank[];
  getTodayNewCount: () => number;
}

const generateRepairId = () =>
  "REP" + String(Date.now()).slice(-6) + Math.floor(Math.random() * 100);
const generateLogId = () =>
  "LOG" + String(Date.now()).slice(-6) + Math.floor(Math.random() * 100);

const isSameDay = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

export const useRepairStore = create<RepairState>()(
  persist(
    (set, get) => ({
      repairOrders: mockRepairOrders,
      repairLogs: mockRepairLogs,

      canTransition: (from, to) => {
        const allowed = STATUS_FLOW[from];
        return allowed ? allowed.includes(to) : false;
      },

      createRepairOrder: (input) => {
        const now = new Date().toISOString();
        const newOrder: RepairOrder = {
          ...input,
          id: generateRepairId(),
          status: "pending",
          createdAt: now,
        };
        const initialLog: RepairLog = {
          id: generateLogId(),
          repairId: newOrder.id,
          fromStatus: null,
          toStatus: "pending",
          handlerId: input.reporterId,
          note: input.faultDescription,
          createdAt: now,
        };
        set((state) => ({
          repairOrders: [newOrder, ...state.repairOrders],
          repairLogs: [initialLog, ...state.repairLogs],
        }));
        return newOrder;
      },

      updateStatus: ({ repairId, newStatus, handlerId, note }) => {
        const order = get().repairOrders.find((o) => o.id === repairId);
        if (!order) return false;

        if (!get().canTransition(order.status, newStatus)) {
          return false;
        }

        const now = new Date().toISOString();
        const newLog: RepairLog = {
          id: generateLogId(),
          repairId,
          fromStatus: order.status,
          toStatus: newStatus,
          handlerId,
          note,
          createdAt: now,
        };

        const closedAt =
          newStatus === "completed" || newStatus === "scrapped"
            ? now
            : order.closedAt;

        set((state) => ({
          repairOrders: state.repairOrders.map((o) =>
            o.id === repairId ? { ...o, status: newStatus, closedAt } : o
          ),
          repairLogs: [newLog, ...state.repairLogs],
        }));
        return true;
      },

      getRepairsByPriority: () => {
        return [...get().repairOrders].sort((a, b) => {
          if (b.impactLevel !== a.impactLevel) {
            return b.impactLevel - a.impactLevel;
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });
      },

      getRepairsGroupedByStatus: () => {
        const orders = get().repairOrders;
        const grouped: Record<RepairStatus, RepairOrder[]> = {
          pending: [],
          processing: [],
          waiting_parts: [],
          completed: [],
          scrapped: [],
        };
        for (const order of orders) {
          grouped[order.status].push(order);
        }
        return grouped;
      },

      getRepairDetail: (repairId) => {
        const order = get().repairOrders.find((o) => o.id === repairId);
        if (!order) return undefined;
        const logs = get()
          .repairLogs.filter((l) => l.repairId === repairId)
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        return { ...order, logs };
      },

      getStatusStats: () => {
        const grouped = get().getRepairsGroupedByStatus();
        return {
          pending: grouped.pending.length,
          processing: grouped.processing.length,
          waiting_parts: grouped.waiting_parts.length,
          completed: grouped.completed.length,
          scrapped: grouped.scrapped.length,
        };
      },

      getClassroomStats: () => {
        const { repairOrders } = get();
        const classroomMap = new Map<string, number>();
        const instruments =
          typeof window !== "undefined"
            ? (() => {
                try {
                  const saved = localStorage.getItem("instrument-store");
                  if (saved) {
                    const parsed = JSON.parse(saved);
                    return parsed.state?.instruments || [];
                  }
                } catch {
                  // ignore
                }
                return [];
              })()
            : [];

        const getClassroom = (instrumentId: string): string => {
          const ins = instruments.find((i: { id: string }) => i.id === instrumentId);
          return ins?.classroom || "未知教室";
        };

        for (const order of repairOrders) {
          const classroom = getClassroom(order.instrumentId);
          classroomMap.set(classroom, (classroomMap.get(classroom) || 0) + 1);
        }
        return Array.from(classroomMap.entries())
          .map(([classroom, count]) => ({ classroom, count }))
          .sort((a, b) => b.count - a.count);
      },

      getAverageRepairDuration: () => {
        const { repairOrders } = get();
        const closed = repairOrders.filter(
          (o) => o.closedAt && o.status !== "pending"
        );
        if (closed.length === 0) return 0;
        const totalHours = closed.reduce((sum, o) => {
          const start = new Date(o.createdAt).getTime();
          const end = new Date(o.closedAt!).getTime();
          return sum + (end - start) / (1000 * 60 * 60);
        }, 0);
        return Math.round((totalHours / closed.length) * 10) / 10;
      },

      getRepeatRepairRank: () => {
        const { repairOrders } = get();
        const countMap = new Map<string, number>();
        for (const order of repairOrders) {
          countMap.set(
            order.instrumentId,
            (countMap.get(order.instrumentId) || 0) + 1
          );
        }
        return Array.from(countMap.entries())
          .map(([instrumentId, count]) => ({ instrumentId, count }))
          .filter((item) => item.count >= 2)
          .sort((a, b) => b.count - a.count);
      },

      getTodayNewCount: () => {
        return get().repairOrders.filter((o) => isSameDay(o.createdAt)).length;
      },
    }),
    {
      name: "repair-store",
    }
  )
);
