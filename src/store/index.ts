import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Activity,
  Registration,
  FilterType,
  PublishFormData,
  RegisterFormData,
} from '@/types';
import { mockActivities, mockRegistrations } from '@/utils/mockData';
import { generateId, getConfirmedCount } from '@/utils/helpers';

interface AppState {
  activities: Activity[];
  registrations: Registration[];
  currentFilter: FilterType;
  searchQuery: string;

  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;

  publishActivity: (data: PublishFormData) => Activity;
  registerActivity: (activityId: string, data: RegisterFormData) => {
    success: boolean;
    status: 'confirmed' | 'waitlist';
    message: string;
  };
  cancelRegistration: (registrationId: string) => {
    success: boolean;
    promotedWaitlist?: string;
  };
  getActivityRegistrations: (activityId: string) => Registration[];
  getActivityById: (id: string) => Activity | undefined;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activities: mockActivities,
      registrations: mockRegistrations,
      currentFilter: 'all',
      searchQuery: '',

      setFilter: (filter) => set({ currentFilter: filter }),
      setSearchQuery: (query) => set({ searchQuery: query }),

      publishActivity: (data) => {
        const newActivity: Activity = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
          creatorName: '我',
        };
        set((state) => ({
          activities: [newActivity, ...state.activities],
        }));
        return newActivity;
      },

      registerActivity: (activityId, data) => {
        const activity = get().getActivityById(activityId);
        if (!activity) {
          return { success: false, status: 'confirmed', message: '活动不存在' };
        }

        const currentRegistrations = get().getActivityRegistrations(activityId);
        const confirmedCount = getConfirmedCount(currentRegistrations);
        const remaining = activity.maxParticipants - confirmedCount;
        const waitlistCount = currentRegistrations.filter(
          (r) => r.status === 'waitlist'
        ).length;

        let status: 'confirmed' | 'waitlist' = 'confirmed';
        let waitlistNumber: number | null = null;
        let message = '报名成功！';

        if (data.attendeeCount > remaining) {
          status = 'waitlist';
          waitlistNumber = waitlistCount + 1;
          message = `剩余名额不足（还需 ${data.attendeeCount} 个位，仅剩 ${remaining > 0 ? remaining : 0} 个），已加入候补第 ${waitlistNumber} 位`;
        }

        const newRegistration: Registration = {
          id: generateId(),
          activityId,
          childNickname: data.childNickname,
          allergyInfo: data.allergyInfo || '无',
          attendeeCount: data.attendeeCount,
          parentPhone: data.parentPhone,
          status,
          waitlistNumber,
          registeredAt: new Date().toISOString(),
        };

        set((state) => ({
          registrations: [...state.registrations, newRegistration],
        }));

        return { success: true, status, message };
      },

      cancelRegistration: (registrationId) => {
        const reg = get().registrations.find((r) => r.id === registrationId);
        if (!reg) {
          return { success: false };
        }

        const wasConfirmed = reg.status === 'confirmed';
        const freedCount = reg.attendeeCount;
        const activityId = reg.activityId;

        set((state) => ({
          registrations: state.registrations.map((r) => {
            if (r.id === registrationId) {
              return { ...r, status: 'cancelled' as const, waitlistNumber: null };
            }
            return r;
          }),
        }));

        if (wasConfirmed) {
          const updatedRegs = get().getActivityRegistrations(activityId);
          const currentConfirmedCount = getConfirmedCount(updatedRegs);
          const activity = get().getActivityById(activityId);
          const maxP = activity ? activity.maxParticipants : 0;
          const available = maxP - currentConfirmedCount;

          const waitlistRegs = updatedRegs
            .filter((r) => r.status === 'waitlist')
            .sort((a, b) => (a.waitlistNumber || 0) - (b.waitlistNumber || 0));

          let promotedNickname: string | undefined;
          const promotedIds = new Set<string>();

          let remainingSpace = available;
          for (const wr of waitlistRegs) {
            if (wr.attendeeCount <= remainingSpace) {
              promotedIds.add(wr.id);
              remainingSpace -= wr.attendeeCount;
              if (!promotedNickname) promotedNickname = wr.childNickname;
            }
          }

          if (promotedIds.size > 0) {
            set((state) => ({
              registrations: state.registrations.map((r) => {
                if (promotedIds.has(r.id)) {
                  return { ...r, status: 'confirmed' as const, waitlistNumber: null };
                }
                if (r.status === 'waitlist' && r.waitlistNumber) {
                  const shift = [...promotedIds].filter(
                    (pid) => {
                      const pr = state.registrations.find((x) => x.id === pid);
                      return pr && (pr.waitlistNumber || 0) < r.waitlistNumber;
                    }
                  ).length;
                  if (shift > 0) {
                    return { ...r, waitlistNumber: r.waitlistNumber - shift };
                  }
                }
                return r;
              }),
            }));

            return {
              success: true,
              promotedWaitlist: promotedIds.size === 1
                ? promotedNickname
                : `${promotedNickname} 等 ${promotedIds.size} 人`,
            };
          }
        }

        return { success: true };
      },

      getActivityRegistrations: (activityId) => {
        return get().registrations.filter((r) => r.activityId === activityId);
      },

      getActivityById: (id) => {
        return get().activities.find((a) => a.id === id);
      },
    }),
    {
      name: 'playdate-app-storage',
    }
  )
);
