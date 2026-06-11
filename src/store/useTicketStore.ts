import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ticket, TicketStatus, UserRole, Message, Review, JumpReason, Stats } from '@/types';
import { INITIAL_TICKETS } from '@/data/mockData';
import { FAULT_TYPES, BUILDINGS } from '@/types';

interface TicketState {
  tickets: Ticket[];
  role: UserRole;
  currentUserName: string;
  setRole: (role: UserRole) => void;
  setCurrentUserName: (name: string) => void;
  addTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'messages' | 'jumpReasons' | 'statusHistory' | 'queuePosition' | 'status'>) => void;
  updateTicketStatus: (id: string, status: TicketStatus, operator: string) => void;
  assignWorker: (id: string, workerName: string) => void;
  addMessage: (id: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  addReview: (id: string, review: Omit<Review, 'createdAt'>) => void;
  addJumpReason: (id: string, jumpReason: Omit<JumpReason, 'timestamp'>) => void;
  getTicketById: (id: string) => Ticket | undefined;
  getStats: () => Stats;
  recalcQueuePositions: () => void;
  resetData: () => void;
}

const generateId = () => {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `T${dateStr}${rand}`;
};

const sortForQueue = (tickets: Ticket[]): Ticket[] => {
  return [...tickets].sort((a, b) => {
    if (a.urgency !== b.urgency) return a.urgency === 'urgent' ? -1 : 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
};

export const useTicketStore = create<TicketState>()(
  persist(
    (set, get) => ({
      tickets: INITIAL_TICKETS,
      role: 'student',
      currentUserName: '李明',

      setRole: (role) => set({ role }),
      setCurrentUserName: (name) => set({ currentUserName: name }),

      recalcQueuePositions: () => {
        set((state) => {
          const pending = sortForQueue(state.tickets.filter((t) => t.status === 'pending'));
          const others = state.tickets.filter((t) => t.status !== 'pending');
          const updated = pending.map((t, idx) => ({ ...t, queuePosition: idx + 1 }));
          return { tickets: [...updated, ...others] };
        });
      },

      addTicket: (ticketData) => {
        const now = new Date().toISOString();
        const id = generateId();
        const newTicket: Ticket = {
          ...ticketData,
          id,
          status: 'pending',
          createdAt: now,
          updatedAt: now,
          messages: [
            { id: 'sys-' + Date.now(), sender: 'system', senderName: '系统', content: '报修单已提交，等待维修员接单', timestamp: now },
          ],
          jumpReasons: [],
          statusHistory: [{ status: 'pending', timestamp: now, operator: '系统' }],
        };
        set((state) => {
          const pending = sortForQueue([...state.tickets.filter((t) => t.status === 'pending'), newTicket]);
          const others = state.tickets.filter((t) => t.status !== 'pending');
          const withPositions = pending.map((t, idx) => ({ ...t, queuePosition: idx + 1 }));
          return { tickets: [...withPositions, ...others] };
        });
      },

      updateTicketStatus: (id, status, operator) => {
        const now = new Date().toISOString();
        set((state) => {
          const updated = state.tickets.map((t) => {
            if (t.id !== id) return t;
            const merged: Ticket = {
              ...t,
              status,
              updatedAt: now,
              statusHistory: [...t.statusHistory, { status, timestamp: now, operator }],
            };
            if (status === 'completed') {
              merged.completedAt = now;
              merged.queuePosition = undefined;
            }
            if (status === 'pending' && t.status !== 'pending') {
              merged.estimatedArrival = undefined;
            }
            return merged;
          });
          const pending = sortForQueue(updated.filter((t) => t.status === 'pending'));
          const others = updated.filter((t) => t.status !== 'pending');
          const withPositions = pending.map((t, idx) => ({ ...t, queuePosition: idx + 1 }));
          return { tickets: [...withPositions, ...others] };
        });
      },

      assignWorker: (id, workerName) => {
        const now = new Date().toISOString();
        const eta = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  assignedWorker: workerName,
                  estimatedArrival: eta,
                  updatedAt: now,
                  messages: [
                    ...t.messages,
                    {
                      id: 'sys-' + Date.now(),
                      sender: 'system',
                      senderName: '系统',
                      content: `${workerName}已接单，预计2小时内到达`,
                      timestamp: now,
                    },
                  ],
                }
              : t,
          ),
        }));
      },

      addMessage: (id, msg) => {
        const now = new Date().toISOString();
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  updatedAt: now,
                  messages: [...t.messages, { ...msg, id: 'm-' + Date.now(), timestamp: now }],
                }
              : t,
          ),
        }));
      },

      addReview: (id, review) => {
        const now = new Date().toISOString();
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === id ? { ...t, updatedAt: now, review: { ...review, createdAt: now } } : t,
          ),
        }));
      },

      addJumpReason: (id, jr) => {
        const now = new Date().toISOString();
        set((state) => {
          const updated = state.tickets.map((t) =>
            t.id === id
              ? {
                  ...t,
                  urgency: 'urgent' as const,
                  updatedAt: now,
                  jumpReasons: [...t.jumpReasons, { ...jr, timestamp: now }],
                  messages: [
                    ...t.messages,
                    {
                      id: 'sys-' + Date.now(),
                      sender: 'system' as const,
                      senderName: '系统',
                      content: `${jr.operator}已将此单标记为紧急：${jr.reason}`,
                      timestamp: now,
                    },
                  ],
                }
              : t,
          );
          const pending = sortForQueue(updated.filter((t) => t.status === 'pending'));
          const others = updated.filter((t) => t.status !== 'pending');
          const withPositions = pending.map((t, idx) => ({ ...t, queuePosition: idx + 1 }));
          return { tickets: [...withPositions, ...others] };
        });
      },

      getTicketById: (id) => get().tickets.find((t) => t.id === id),

      getStats: () => {
        const { tickets } = get();
        const today = new Date().toDateString();
        const faultMap: Record<string, number> = {};
        const buildingMap: Record<string, number> = {};
        FAULT_TYPES.forEach((f) => (faultMap[f] = 0));
        BUILDINGS.forEach((b) => (buildingMap[b] = 0));

        let completedWithTime = 0;
        let totalHours = 0;
        let todayCompleted = 0;

        tickets.forEach((t) => {
          faultMap[t.faultType] = (faultMap[t.faultType] || 0) + 1;
          buildingMap[t.building] = (buildingMap[t.building] || 0) + 1;
          if (t.completedAt) {
            const diff = (new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime()) / 3600000;
            totalHours += diff;
            completedWithTime += 1;
            if (new Date(t.completedAt).toDateString() === today) todayCompleted += 1;
          }
        });

        return {
          avgProcessingTime: completedWithTime > 0 ? Math.round((totalHours / completedWithTime) * 10) / 10 : 0,
          pendingCount: tickets.filter((t) => t.status === 'pending').length,
          processingCount: tickets.filter((t) => t.status === 'processing').length,
          waitingPartsCount: tickets.filter((t) => t.status === 'waiting_parts').length,
          todayCompleted,
          totalCount: tickets.length,
          faultTypeDistribution: Object.entries(faultMap)
            .map(([type, count]) => ({ type, count }))
            .filter((d) => d.count > 0)
            .sort((a, b) => b.count - a.count),
          buildingDistribution: Object.entries(buildingMap)
            .map(([building, count]) => ({ building, count }))
            .filter((d) => d.count > 0)
            .sort((a, b) => b.count - a.count),
        };
      },

      resetData: () => set({ tickets: INITIAL_TICKETS }),
    }),
    {
      name: 'dorm-repair-store',
    },
  ),
);
