import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Queue, Ticket, TicketFormData, BusinessType } from '@/types';
import {
  generateId,
  getWaitingList,
  getCallingTicket,
  getPassedList,
} from '@/utils/helpers';

interface QueueStore {
  queue: Queue | null;
  tickets: Ticket[];
  initializeQueue: (businessType: BusinessType, businessName: string, estimatedTime: number) => void;
  updateQueueSettings: (settings: Partial<Queue>) => void;
  togglePause: () => void;
  createTicket: (formData: TicketFormData) => Ticket;
  callNext: () => Ticket | null;
  completeCurrent: () => Ticket | null;
  passCurrent: () => Ticket | null;
  callSpecificTicket: (ticketId: string) => Ticket | null;
  getTicketById: (ticketId: string) => Ticket | undefined;
  resetQueue: () => void;
  clearOldTickets: () => void;
}

const initialQueue: Omit<Queue, 'id' | 'createdAt' | 'updatedAt'> = {
  businessType: 'haircut',
  businessName: '理发店',
  estimatedTimePerPerson: 30,
  isPaused: false,
  currentNumber: 0,
};

export const useQueueStore = create<QueueStore>()(
  persist(
    (set, get) => ({
      queue: null,
      tickets: [],

      initializeQueue: (businessType, businessName, estimatedTime) => {
        const now = new Date().toISOString();
        set({
          queue: {
            id: generateId(),
            businessType,
            businessName,
            estimatedTimePerPerson: estimatedTime,
            isPaused: false,
            currentNumber: 0,
            createdAt: now,
            updatedAt: now,
          },
          tickets: [],
        });
      },

      updateQueueSettings: (settings) => {
        set((state) => ({
          queue: state.queue
            ? {
                ...state.queue,
                ...settings,
                updatedAt: new Date().toISOString(),
              }
            : null,
        }));
      },

      togglePause: () => {
        set((state) => ({
          queue: state.queue
            ? {
                ...state.queue,
                isPaused: !state.queue.isPaused,
                updatedAt: new Date().toISOString(),
              }
            : null,
        }));
      },

      createTicket: (formData) => {
        const { queue, tickets } = get();
        if (!queue || queue.isPaused) {
          throw new Error('当前暂不接单');
        }

        const newNumber = queue.currentNumber + 1;
        const newTicket: Ticket = {
          id: generateId(),
          queueId: queue.id,
          number: newNumber,
          nickname: formData.nickname,
          phoneLast4: formData.phoneLast4,
          peopleCount: formData.peopleCount,
          note: formData.note,
          allowSkip: formData.allowSkip,
          status: 'waiting',
          passedCount: 0,
          createdAt: new Date().toISOString(),
        };

        set({
          queue: {
            ...queue,
            currentNumber: newNumber,
            updatedAt: new Date().toISOString(),
          },
          tickets: [...tickets, newTicket],
        });

        return newTicket;
      },

      callNext: () => {
        const { tickets } = get();
        const currentCalling = getCallingTicket(tickets);
        
        if (currentCalling) {
          return null;
        }

        const waiting = getWaitingList(tickets);
        if (waiting.length === 0) {
          return null;
        }

        const nextTicket = waiting[0];
        set({
          tickets: tickets.map((t) =>
            t.id === nextTicket.id
              ? { ...t, status: 'calling', calledAt: new Date().toISOString() }
              : t
          ),
        });

        return nextTicket;
      },

      completeCurrent: () => {
        const { tickets } = get();
        const currentCalling = getCallingTicket(tickets);
        
        if (!currentCalling) {
          return null;
        }

        const completedTicket: Ticket = {
          ...currentCalling,
          status: 'served',
          completedAt: new Date().toISOString(),
        };

        set({
          tickets: tickets.map((t) =>
            t.id === currentCalling.id ? completedTicket : t
          ),
        });

        return completedTicket;
      },

      passCurrent: () => {
        const { tickets } = get();
        const currentCalling = getCallingTicket(tickets);
        
        if (!currentCalling) {
          return null;
        }

        const now = new Date().toISOString();
        const passedTicket: Ticket = {
          ...currentCalling,
          status: 'passed',
          passedCount: currentCalling.passedCount + 1,
          lastPassedAt: now,
        };

        set({
          tickets: tickets.map((t) =>
            t.id === currentCalling.id ? passedTicket : t
          ),
        });

        return passedTicket;
      },

      callSpecificTicket: (ticketId) => {
        const { tickets } = get();
        const ticket = tickets.find((t) => t.id === ticketId);
        
        if (!ticket || (ticket.status !== 'waiting' && ticket.status !== 'passed')) {
          return null;
        }

        set({
          tickets: tickets.map((t) => {
            if (t.id === ticketId) {
              return { ...t, status: 'calling', calledAt: new Date().toISOString() };
            }
            if (t.status === 'calling') {
              return { ...t, status: 'waiting' };
            }
            return t;
          }),
        });

        return ticket;
      },

      getTicketById: (ticketId) => {
        const { tickets } = get();
        return tickets.find((t) => t.id === ticketId);
      },

      resetQueue: () => {
        const { queue } = get();
        if (!queue) return;
        
        const now = new Date().toISOString();
        set({
          queue: {
            ...queue,
            currentNumber: 0,
            isPaused: false,
            updatedAt: now,
          },
          tickets: [],
        });
      },

      clearOldTickets: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          tickets: state.tickets.filter((t) => t.createdAt.startsWith(today)),
        }));
      },
    }),
    {
      name: 'queue-storage',
    }
  )
);
