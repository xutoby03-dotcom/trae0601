import { create } from 'zustand';
import type { Session, Guest, Feedback, OverviewStats, Reminder } from '../../shared/types';
import { sessionsApi, guestsApi, feedbackApi, statsApi, remindersApi } from '../utils/api';

interface AppState {
  sessions: Session[];
  guests: Guest[];
  feedbackList: Feedback[];
  overviewStats: OverviewStats | null;
  reminders: Reminder[];
  reminderCount: { unconfirmed: number; no_show: number; follow_up: number; total: number };
  loading: boolean;
  error: string | null;
  
  fetchSessions: () => Promise<void>;
  fetchGuests: (params?: { sessionId?: string; status?: string; search?: string; isVIP?: boolean }) => Promise<void>;
  fetchFeedback: (params?: { sessionId?: string; guestId?: string; isFollowedUp?: boolean }) => Promise<void>;
  fetchOverviewStats: () => Promise<void>;
  fetchReminders: () => Promise<void>;
  fetchReminderCount: () => Promise<void>;
  
  addGuest: (guest: Omit<Guest, 'id' | 'createdAt'>) => Promise<Guest>;
  updateGuest: (id: string, updates: Partial<Guest>) => Promise<Guest | undefined>;
  deleteGuest: (id: string) => Promise<void>;
  confirmGuest: (id: string) => Promise<void>;
  checkInGuest: (id: string) => Promise<void>;
  checkOutGuest: (id: string) => Promise<void>;
  markNoShow: (id: string, reason?: string) => Promise<void>;
  
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt'>) => Promise<Feedback>;
  markFeedbackFollowedUp: (id: string) => Promise<void>;
  
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  sessions: [],
  guests: [],
  feedbackList: [],
  overviewStats: null,
  reminders: [],
  reminderCount: { unconfirmed: 0, no_show: 0, follow_up: 0, total: 0 },
  loading: false,
  error: null,

  fetchSessions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await sessionsApi.getAll();
      set({ sessions: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchGuests: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await guestsApi.getAll(params);
      set({ guests: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchFeedback: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await feedbackApi.getAll(params);
      set({ feedbackList: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchOverviewStats: async () => {
    set({ loading: true, error: null });
    try {
      const data = await statsApi.getOverview();
      set({ overviewStats: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchReminders: async () => {
    set({ loading: true, error: null });
    try {
      const data = await remindersApi.getAll();
      set({ reminders: data });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchReminderCount: async () => {
    try {
      const data = await remindersApi.getCount();
      set({ reminderCount: data });
    } catch (error) {
      console.error('Failed to fetch reminder count:', error);
    }
  },

  addGuest: async (guest) => {
    set({ loading: true, error: null });
    try {
      const newGuest = await guestsApi.create(guest);
      set((state) => ({ guests: [...state.guests, newGuest] }));
      return newGuest;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateGuest: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const updatedGuest = await guestsApi.update(id, updates);
      if (updatedGuest) {
        set((state) => ({
          guests: state.guests.map((g) => (g.id === id ? updatedGuest : g)),
        }));
      }
      return updatedGuest;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteGuest: async (id) => {
    set({ loading: true, error: null });
    try {
      await guestsApi.delete(id);
      set((state) => ({
        guests: state.guests.filter((g) => g.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  confirmGuest: async (id) => {
    try {
      const updatedGuest = await guestsApi.confirm(id);
      set((state) => ({
        guests: state.guests.map((g) => (g.id === id ? updatedGuest : g)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  checkInGuest: async (id) => {
    try {
      const updatedGuest = await guestsApi.checkIn(id);
      set((state) => ({
        guests: state.guests.map((g) => (g.id === id ? updatedGuest : g)),
      }));
      get().fetchReminderCount();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  checkOutGuest: async (id) => {
    try {
      const updatedGuest = await guestsApi.checkOut(id);
      set((state) => ({
        guests: state.guests.map((g) => (g.id === id ? updatedGuest : g)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  markNoShow: async (id, reason) => {
    try {
      const updatedGuest = await guestsApi.markNoShow(id, reason);
      set((state) => ({
        guests: state.guests.map((g) => (g.id === id ? updatedGuest : g)),
      }));
      get().fetchReminderCount();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  addFeedback: async (feedback) => {
    set({ loading: true, error: null });
    try {
      const newFeedback = await feedbackApi.create(feedback);
      set((state) => ({ feedbackList: [...state.feedbackList, newFeedback] }));
      get().fetchReminderCount();
      return newFeedback;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  markFeedbackFollowedUp: async (id) => {
    try {
      const updated = await feedbackApi.markFollowedUp(id);
      set((state) => ({
        feedbackList: state.feedbackList.map((f) => (f.id === id ? updated : f)),
      }));
      get().fetchReminderCount();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  setError: (error) => set({ error }),
}));
