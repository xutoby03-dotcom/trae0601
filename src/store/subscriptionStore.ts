import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addMonths, format } from 'date-fns';
import type {
  CategoryStat,
  SmartSuggestion,
  Subscription,
  SubscriptionFilters,
} from '@/types';
import {
  generateSmartSuggestions,
  getCategoryStats,
  getMonthlyTotal,
  getNextMonthStr,
  getPreviousMonthStr,
  getSubscriptionsForMonth,
  getTotalAnnual,
  getTotalMonthly,
  getUpcomingSubscriptions,
} from '@/utils/helpers';
import { mockSubscriptions } from './mockData';

interface SubscriptionState {
  subscriptions: Subscription[];
  filters: SubscriptionFilters;
  selectedMonth: string;
  modalState: { add: boolean; editId: string | null };

  addSubscription: (
    data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateSubscription: (id: string, data: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  confirmUsage: (id: string) => void;

  setFilters: (filters: Partial<SubscriptionFilters>) => void;
  setSelectedMonth: (month: string) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;

  openAddModal: () => void;
  openEditModal: (id: string) => void;
  closeModal: () => void;

  getFilteredSubscriptions: () => Subscription[];
  getSubscriptionsByDate: (date: string) => Subscription[];
  getCalendarData: () => { date: string; subs: Subscription[] }[];
  getMonthlySum: () => number;
  getPrevMonthlySum: () => number;
  getNextMonthlySum: () => number;
  getUpcoming: (days?: number) => Subscription[];
  getCategoryBreakdown: () => CategoryStat[];
  getAnnualProjection: () => number;
  getMonthlyProjection: () => number;
  getSuggestions: () => SmartSuggestion[];
  getById: (id: string) => Subscription | undefined;
}

const genId = () => `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const currentMonth = format(new Date(), 'yyyy-MM');
const nextMonth = format(addMonths(new Date(), 1), 'yyyy-MM');

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: mockSubscriptions,
      filters: {
        category: 'all',
        search: '',
        onlyUnconfirmed: false,
        onlyTrial: false,
      },
      selectedMonth: nextMonth,
      modalState: { add: false, editId: null },

      addSubscription: (data) => {
        const now = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
        const newSub: Subscription = {
          ...data,
          id: genId(),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ subscriptions: [...s.subscriptions, newSub] }));
      },

      updateSubscription: (id, data) => {
        const now = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
        set((s) => ({
          subscriptions: s.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, ...data, updatedAt: now } : sub
          ),
        }));
      },

      deleteSubscription: (id) => {
        set((s) => ({
          subscriptions: s.subscriptions.filter((sub) => sub.id !== id),
        }));
      },

      confirmUsage: (id) => {
        const now = format(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
        set((s) => ({
          subscriptions: s.subscriptions.map((sub) =>
            sub.id === id ? { ...sub, lastConfirmedAt: now, updatedAt: now } : sub
          ),
        }));
      },

      setFilters: (filters) => {
        set((s) => ({ filters: { ...s.filters, ...filters } }));
      },

      setSelectedMonth: (month) => set({ selectedMonth: month }),

      goToPrevMonth: () =>
        set((s) => ({ selectedMonth: getPreviousMonthStr(s.selectedMonth) })),

      goToNextMonth: () =>
        set((s) => ({ selectedMonth: getNextMonthStr(s.selectedMonth) })),

      goToCurrentMonth: () => set({ selectedMonth: currentMonth }),

      openAddModal: () =>
        set({ modalState: { add: true, editId: null } }),

      openEditModal: (id) =>
        set({ modalState: { add: false, editId: id } }),

      closeModal: () =>
        set({ modalState: { add: false, editId: null } }),

      getFilteredSubscriptions: () => {
        const { subscriptions, filters } = get();
        let result = subscriptions;
        if (filters.category !== 'all') {
          result = result.filter((s) => s.category === filters.category);
        }
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          result = result.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.purpose.toLowerCase().includes(q)
          );
        }
        if (filters.onlyTrial) {
          result = result.filter((s) => s.isTrial);
        }
        return result.sort(
          (a, b) =>
            new Date(a.nextBillingDate).getTime() -
            new Date(b.nextBillingDate).getTime()
        );
      },

      getSubscriptionsByDate: (date) => {
        return get().subscriptions.filter((s) => s.nextBillingDate === date);
      },

      getCalendarData: () => {
        return getSubscriptionsForMonth(get().subscriptions, get().selectedMonth);
      },

      getMonthlySum: () => {
        return getMonthlyTotal(get().subscriptions, get().selectedMonth);
      },

      getPrevMonthlySum: () => {
        return getMonthlyTotal(
          get().subscriptions,
          getPreviousMonthStr(get().selectedMonth)
        );
      },

      getNextMonthlySum: () => {
        return getMonthlyTotal(
          get().subscriptions,
          getNextMonthStr(get().selectedMonth)
        );
      },

      getUpcoming: (days = 7) => {
        return getUpcomingSubscriptions(get().subscriptions, days);
      },

      getCategoryBreakdown: () => {
        return getCategoryStats(get().subscriptions);
      },

      getAnnualProjection: () => getTotalAnnual(get().subscriptions),
      getMonthlyProjection: () => getTotalMonthly(get().subscriptions),
      getSuggestions: () => generateSmartSuggestions(get().subscriptions),
      getById: (id) => get().subscriptions.find((s) => s.id === id),
    }),
    {
      name: 'subtrack-subscriptions',
      partialize: (state) => ({
        subscriptions: state.subscriptions,
        filters: state.filters,
      }),
    }
  )
);
