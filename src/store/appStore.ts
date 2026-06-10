import { create } from 'zustand';
import type { Activity, Registration, ActivityStats, TypeStats, CreateActivityDto, RegisterDto } from '../../shared/types.js';
import { api } from '../lib/api.js';

interface AppState {
  activities: Activity[];
  registrations: Map<string, Registration[]>;
  stats: {
    activities: ActivityStats[];
    typeStats: TypeStats[];
    totalWaitlistPromoted: number;
  } | null;
  loading: boolean;
  error: string | null;

  fetchActivities: () => Promise<void>;
  fetchActivity: (id: string) => Promise<Activity | undefined>;
  createActivity: (dto: CreateActivityDto) => Promise<Activity>;
  fetchRegistrations: (activityId: string) => Promise<void>;
  register: (activityId: string, dto: RegisterDto) => Promise<{ registration: Registration; isWaitlist: boolean }>;
  cancelRegistration: (id: string, activityId: string) => Promise<void>;
  checkIn: (id: string, activityId: string) => Promise<void>;
  markAbsent: (id: string, activityId: string) => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  activities: [],
  registrations: new Map(),
  stats: null,
  loading: false,
  error: null,

  fetchActivities: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getActivities();
      set({ activities: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchActivity: async (id: string) => {
    const existing = get().activities.find((a) => a.id === id);
    if (existing) return existing;
    try {
      const data = await api.getActivity(id);
      set((state) => ({
        activities: [...state.activities, data],
      }));
      return data;
    } catch (err) {
      set({ error: (err as Error).message });
      return undefined;
    }
  },

  createActivity: async (dto) => {
    const data = await api.createActivity(dto);
    set((state) => ({
      activities: [...state.activities, data],
    }));
    return data;
  },

  fetchRegistrations: async (activityId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await api.getRegistrations(activityId);
      set((state) => {
        const newMap = new Map(state.registrations);
        newMap.set(activityId, data);
        return { registrations: newMap, loading: false };
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  register: async (activityId: string, dto: RegisterDto) => {
    const result = await api.register(activityId, dto);
    set((state) => {
      const newMap = new Map(state.registrations);
      const existing = newMap.get(activityId) || [];
      newMap.set(activityId, [...existing, result.registration]);
      return { registrations: newMap };
    });
    return result;
  },

  cancelRegistration: async (id: string, activityId: string) => {
    await api.cancelRegistration(id);
    await get().fetchRegistrations(activityId);
  },

  checkIn: async (id: string, activityId: string) => {
    await api.checkIn(id);
    await get().fetchRegistrations(activityId);
  },

  markAbsent: async (id: string, activityId: string) => {
    await api.markAbsent(id);
    await get().fetchRegistrations(activityId);
  },

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getStats();
      set({ stats: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));
