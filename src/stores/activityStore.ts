import { create } from 'zustand';
import type { Activity } from '@/types/index';
import { storage, delay, generateId } from '@/utils/storage';
import { mockActivities } from '@/mock/data';
import dayjs from 'dayjs';

interface ActivityStoreState {
  activities: Activity[];
  loading: boolean;
  fetchActivities: () => Promise<void>;
  getActivityByDate: (counterId: string, date?: string | Date) => Activity | undefined;
  addActivity: (activity: Omit<Activity, 'id'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  getUpcomingActivities: (days?: number) => Activity[];
  isActivityDay: (counterId: string, date?: string | Date) => boolean;
  getActivityMultiplier: (counterId: string, date?: string | Date) => number;
}

const STORAGE_KEY = 'activities';

const loadInitialActivities = (): Activity[] => {
  if (storage.has(STORAGE_KEY)) {
    return storage.get<Activity[]>(STORAGE_KEY, []);
  }
  storage.set(STORAGE_KEY, mockActivities);
  return mockActivities;
};

const normalizeDate = (date?: string | Date): dayjs.Dayjs => {
  return date ? dayjs(date) : dayjs();
};

export const useActivityStore = create<ActivityStoreState>((set, get) => ({
  activities: loadInitialActivities(),
  loading: false,

  fetchActivities: async () => {
    set({ loading: true });
    await delay();
    const data = storage.has(STORAGE_KEY)
      ? storage.get<Activity[]>(STORAGE_KEY, [])
      : mockActivities;
    set({ activities: data, loading: false });
  },

  getActivityByDate: (counterId, date) => {
    const targetDate = normalizeDate(date);
    const targetDateStr = targetDate.format('YYYY-MM-DD');
    return get().activities.find(
      (a) =>
        a.counterIds.includes(counterId) &&
        targetDateStr >= a.startDate &&
        targetDateStr <= a.endDate
    );
  },

  isActivityDay: (counterId, date) => {
    return get().getActivityByDate(counterId, date) !== undefined;
  },

  getActivityMultiplier: (counterId, date) => {
    const activity = get().getActivityByDate(counterId, date);
    return activity ? activity.thresholdMultiplier : 1;
  },

  addActivity: async (activity) => {
    set({ loading: true });
    await delay();
    const newActivity: Activity = {
      ...activity,
      id: generateId(),
    };
    const updated = [...get().activities, newActivity];
    storage.set(STORAGE_KEY, updated);
    set({ activities: updated, loading: false });
  },

  updateActivity: async (id, updates) => {
    set({ loading: true });
    await delay();
    const updated = get().activities.map((a) => {
      if (a.id === id) {
        return { ...a, ...updates };
      }
      return a;
    });
    storage.set(STORAGE_KEY, updated);
    set({ activities: updated, loading: false });
  },

  deleteActivity: async (id) => {
    set({ loading: true });
    await delay();
    const updated = get().activities.filter((a) => a.id !== id);
    storage.set(STORAGE_KEY, updated);
    set({ activities: updated, loading: false });
  },

  getUpcomingActivities: (days = 30) => {
    const today = dayjs();
    const endDate = today.add(days, 'day');
    return get().activities.filter((a) => {
      const activityEnd = dayjs(a.endDate);
      const activityStart = dayjs(a.startDate);
      return activityStart.isBefore(endDate) && activityEnd.isAfter(today.subtract(1, 'day'));
    });
  },
}));
