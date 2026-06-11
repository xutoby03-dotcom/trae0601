import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ConcertPlan,
  Member,
  TicketRecord,
  AppState,
  Statistics,
  PlatformStat,
  PlatformType,
} from '../types';
import { mockInitialState } from '../data/mockData';
import { generateId } from '../utils/date';
import { calculateOverBudget } from '../utils/money';

interface StoreActions {
  addPlan: (plan: Omit<ConcertPlan, 'id' | 'createdAt'>) => void;
  updatePlan: (id: string, updates: Partial<ConcertPlan>) => void;
  deletePlan: (id: string) => void;
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  addTicket: (ticket: Omit<TicketRecord, 'id' | 'obtainedAt'>) => void;
  updateTicket: (id: string, updates: Partial<TicketRecord>) => void;
  deleteTicket: (id: string) => void;
  calculateStats: () => Statistics;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  resetData: () => void;
}

type Store = AppState & StoreActions;

const STORAGE_KEY = 'concert-ticket-app-data';

const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...mockInitialState,

      addPlan: (plan) =>
        set((state) => ({
          plans: [
            ...state.plans,
            {
              ...plan,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updatePlan: (id, updates) =>
        set((state) => ({
          plans: state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deletePlan: (id) =>
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
          tickets: state.tickets.filter((t) => t.planId !== id),
        })),

      addMember: (member) =>
        set((state) => ({
          members: [...state.members, { ...member, id: generateId() }],
        })),

      updateMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      deleteMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
          plans: state.plans.map((p) => ({
            ...p,
            memberIds: p.memberIds.filter((mid) => mid !== id),
          })),
        })),

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [
            ...state.tickets,
            {
              ...ticket,
              id: generateId(),
              obtainedAt: new Date().toISOString(),
            },
          ],
        })),

      updateTicket: (id, updates) =>
        set((state) => ({
          tickets: state.tickets.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id !== id),
        })),

      calculateStats: () => {
        const state = get();
        const { tickets, plans } = state;

        const successTickets = tickets.filter((t) => t.status === 'success');
        const pendingTickets = tickets.filter((t) => t.status === 'pending_transfer');
        const totalAttempts = tickets.length;
        const successCount = successTickets.length;
        const successRate = totalAttempts > 0 ? successCount / totalAttempts : 0;

        let overBudgetAmount = 0;
        tickets.forEach((ticket) => {
          const plan = plans.find((p) => p.id === ticket.planId);
          if (plan && plan.budgetTiers.length > 0) {
            const maxBudget = Math.max(...plan.budgetTiers.map((b) => b.maxPrice));
            overBudgetAmount += calculateOverBudget(ticket.price, maxBudget);
          }
        });

        const platformMap = new Map<PlatformType, { attempts: number; success: number }>();
        const platforms: PlatformType[] = ['damai', 'maoyan', 'piaoxingqiu', 'fenwandao', 'others'];
        
        platforms.forEach((p) => platformMap.set(p, { attempts: 0, success: 0 }));

        tickets.forEach((ticket) => {
          const stats = platformMap.get(ticket.platform) || { attempts: 0, success: 0 };
          stats.attempts++;
          if (ticket.status === 'success') {
            stats.success++;
          }
          platformMap.set(ticket.platform, stats);
        });

        const platformStats: PlatformStat[] = Array.from(platformMap.entries()).map(
          ([platform, stats]) => ({
            platform,
            attempts: stats.attempts,
            success: stats.success,
            successRate: stats.attempts > 0 ? stats.success / stats.attempts : 0,
          })
        );

        return {
          totalAttempts,
          successCount,
          successRate,
          overBudgetAmount,
          platformStats,
        };
      },

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      resetData: () => set(mockInitialState),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useStore;
