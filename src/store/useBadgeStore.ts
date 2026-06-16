import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Badge,
  Visitor,
  LossRecord,
  OvertimeReminder,
  DashboardStats,
  BadgeStatus,
  VisitorStatus,
  ReminderStatus,
} from '../types';
import { mockBadges, mockVisitors } from '../data/mockData';
import { generateId } from '../utils/id';
import { isToday, isOvertime, getDurationMs, getAverageDuration } from '../utils/time';

interface BadgeStore {
  badges: Badge[];
  visitors: Visitor[];
  lossRecords: LossRecord[];
  overtimeReminders: OvertimeReminder[];

  addBadge: (badge: Omit<Badge, 'id' | 'createdAt' | 'status'> & { status?: BadgeStatus }) => void;
  updateBadge: (id: string, data: Partial<Badge>) => void;
  deleteBadge: (id: string) => void;
  toggleBadgeStatus: (id: string) => void;

  checkInVisitor: (visitor: Omit<Visitor, 'id' | 'checkInTime' | 'status'>) => void;
  confirmReturn: (visitorId: string) => void;
  updateOvertimeStatus: () => void;
  reportLost: (data: Omit<LossRecord, 'id' | 'reportedAt' | 'status'>) => void;

  handleReminder: (reminderId: string, note?: string) => void;
  getPendingReminders: () => OvertimeReminder[];
  getHandledReminders: () => OvertimeReminder[];

  getDashboardStats: () => DashboardStats;
  getUnreturnedVisitors: () => Visitor[];
  getTodayVisitors: () => Visitor[];
  getAvailableBadges: () => Badge[];
  getBadgeById: (id: string) => Badge | undefined;

  resetToMock: () => void;
}

export const useBadgeStore = create<BadgeStore>()(
  persist(
    (set, get) => ({
      badges: mockBadges,
      visitors: mockVisitors,
      lossRecords: [],
      overtimeReminders: [],

      addBadge: (badge) => {
        const newBadge: Badge = {
          ...badge,
          id: generateId(),
          status: badge.status ?? 'active',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ badges: [...state.badges, newBadge] }));
      },

      updateBadge: (id, data) => {
        set((state) => ({
          badges: state.badges.map((b) => (b.id === id ? { ...b, ...data } : b)),
        }));
      },

      deleteBadge: (id) => {
        set((state) => ({ badges: state.badges.filter((b) => b.id !== id) }));
      },

      toggleBadgeStatus: (id) => {
        set((state) => ({
          badges: state.badges.map((b) =>
            b.id === id
              ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' }
              : b
          ),
        }));
      },

      checkInVisitor: (visitor) => {
        const now = new Date().toISOString();
        const newVisitor: Visitor = {
          ...visitor,
          id: generateId(),
          checkInTime: now,
          status: 'visiting',
        };
        set((state) => ({ visitors: [...state.visitors, newVisitor] }));
      },

      confirmReturn: (visitorId) => {
        const now = new Date().toISOString();
        set((state) => ({
          visitors: state.visitors.map((v) =>
            v.id === visitorId
              ? { ...v, actualLeaveTime: now, status: 'returned' as VisitorStatus }
              : v
          ),
          overtimeReminders: state.overtimeReminders.map((r) =>
            r.visitorId === visitorId && r.status === 'pending'
              ? {
                  ...r,
                  status: 'handled' as ReminderStatus,
                  handledAt: now,
                  handledNote: r.handledNote || '工牌已归还',
                }
              : r
          ),
        }));
      },

      updateOvertimeStatus: () => {
        const { visitors, badges, overtimeReminders } = get();
        const remindedVisitorIds = new Set(
          overtimeReminders.map((r) => r.visitorId)
        );

        const newReminders: OvertimeReminder[] = [];
        const updatedVisitors = visitors.map((v) => {
          const isVisitorOvertime = isOvertime(v.expectedLeaveTime);
          const isActiveUnreturned = v.status === 'visiting' || v.status === 'overtime';

          if (isActiveUnreturned && isVisitorOvertime && !remindedVisitorIds.has(v.id)) {
            const badge = badges.find((b) => b.id === v.badgeId);
            newReminders.push({
              id: generateId(),
              visitorId: v.id,
              visitorName: v.name,
              visitorCompany: v.company,
              visitorPhone: v.phone,
              hostName: v.hostName,
              expectedLeaveTime: v.expectedLeaveTime,
              badgeNumber: badge?.number || '未知',
              badgeColor: badge?.color || '未知',
              badgeColorHex: badge?.colorHex || '#6b7280',
              overtimeAt: v.expectedLeaveTime,
              status: 'pending',
            });
          }

          if (v.status === 'visiting' && isVisitorOvertime) {
            return { ...v, status: 'overtime' as VisitorStatus };
          }
          return v;
        });

        if (newReminders.length > 0) {
          set((state) => ({
            visitors: updatedVisitors,
            overtimeReminders: [...state.overtimeReminders, ...newReminders],
          }));
        } else {
          set({ visitors: updatedVisitors });
        }
      },

      reportLost: (data) => {
        const now = new Date().toISOString();
        const record: LossRecord = {
          ...data,
          id: generateId(),
          reportedAt: now,
          status: 'completed',
        };
        set((state) => ({
          lossRecords: [...state.lossRecords, record],
          badges: state.badges.map((b) =>
            b.id === data.badgeId ? { ...b, status: 'lost' as BadgeStatus } : b
          ),
          visitors: state.visitors.map((v) =>
            v.id === data.visitorId ? { ...v, status: 'lost' as VisitorStatus } : v
          ),
          overtimeReminders: state.overtimeReminders.map((r) =>
            r.visitorId === data.visitorId && r.status === 'pending'
              ? {
                  ...r,
                  status: 'handled' as ReminderStatus,
                  handledAt: now,
                  handledNote: r.handledNote || '工牌已遗失登记',
                }
              : r
          ),
        }));
      },

      handleReminder: (reminderId, note) => {
        const now = new Date().toISOString();
        set((state) => ({
          overtimeReminders: state.overtimeReminders.map((r) =>
            r.id === reminderId
              ? {
                  ...r,
                  status: 'handled' as ReminderStatus,
                  handledAt: now,
                  handledNote: note || '已处理',
                }
              : r
          ),
        }));
      },

      getPendingReminders: () => {
        const { overtimeReminders, visitors } = get();
        const activeVisitorIds = new Set(
          visitors
            .filter((v) => v.status === 'overtime' || v.status === 'visiting')
            .map((v) => v.id)
        );
        return overtimeReminders.filter(
          (r) => r.status === 'pending' && activeVisitorIds.has(r.visitorId)
        );
      },

      getHandledReminders: () => {
        return get().overtimeReminders.filter((r) => r.status === 'handled');
      },

      getDashboardStats: () => {
        const { visitors, badges } = get();
        const todayVisitors = visitors.filter((v) => isToday(v.checkInTime));
        const notReturned = todayVisitors.filter(
          (v) => v.status === 'visiting' || v.status === 'overtime'
        );
        const overtimeCount = todayVisitors.filter((v) => v.status === 'overtime').length;
        const returnedVisitors = todayVisitors.filter((v) => v.status === 'returned');
        const durations = returnedVisitors.map((v) =>
          getDurationMs(v.checkInTime, v.actualLeaveTime)
        );

        const areaMap = new Map<string, number>();
        notReturned.forEach((v) => {
          const badge = badges.find((b) => b.id === v.badgeId);
          if (badge) {
            const count = areaMap.get(badge.allowedArea) ?? 0;
            areaMap.set(badge.allowedArea, count + 1);
          }
        });
        const areaDistribution = Array.from(areaMap.entries())
          .map(([area, count]) => ({ area, count }))
          .sort((a, b) => b.count - a.count);

        return {
          todayTotal: todayVisitors.length,
          notReturned: notReturned.length,
          overtimeCount,
          avgStayDuration: getAverageDuration(durations),
          areaDistribution,
        };
      },

      getUnreturnedVisitors: () => {
        const { visitors } = get();
        return visitors.filter(
          (v) =>
            isToday(v.checkInTime) &&
            (v.status === 'visiting' || v.status === 'overtime')
        );
      },

      getTodayVisitors: () => {
        const { visitors } = get();
        return visitors.filter((v) => isToday(v.checkInTime));
      },

      getAvailableBadges: () => {
        const { badges, visitors } = get();
        const usedBadgeIds = new Set(
          visitors
            .filter((v) => v.status === 'visiting' || v.status === 'overtime')
            .map((v) => v.badgeId)
        );
        return badges.filter((b) => b.status === 'active' && !usedBadgeIds.has(b.id));
      },

      getBadgeById: (id) => {
        return get().badges.find((b) => b.id === id);
      },

      resetToMock: () => {
        set({
          badges: mockBadges,
          visitors: mockVisitors,
          lossRecords: [],
          overtimeReminders: [],
        });
      },
    }),
    {
      name: 'badge-management-storage',
      onRehydrateStorage: (state) => {
        return () => {
          if (!state) return;
          const { overtimeReminders, visitors, badges } = state;
          const remindedVisitorIds = new Set(
            overtimeReminders.map((r) => r.visitorId)
          );

          const missing: OvertimeReminder[] = [];
          visitors.forEach((v) => {
            const isVisitorOvertime = isOvertime(v.expectedLeaveTime);
            const isActiveUnreturned =
              v.status === 'visiting' || v.status === 'overtime';

            if (isActiveUnreturned && isVisitorOvertime && !remindedVisitorIds.has(v.id)) {
              const badge = badges.find((b) => b.id === v.badgeId);
              missing.push({
                id: generateId(),
                visitorId: v.id,
                visitorName: v.name,
                visitorCompany: v.company,
                visitorPhone: v.phone,
                hostName: v.hostName,
                expectedLeaveTime: v.expectedLeaveTime,
                badgeNumber: badge?.number || '未知',
                badgeColor: badge?.color || '未知',
                badgeColorHex: badge?.colorHex || '#6b7280',
                overtimeAt: v.expectedLeaveTime,
                status: 'pending',
              });
            }
          });

          if (missing.length > 0) {
            state.overtimeReminders = [...overtimeReminders, ...missing];
          }

          visitors.forEach((v, idx) => {
            if (v.status === 'visiting' && isOvertime(v.expectedLeaveTime)) {
              state.visitors[idx] = { ...v, status: 'overtime' };
            }
          });
        };
      },
    }
  )
);
