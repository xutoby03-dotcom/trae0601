import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Badge, Visitor, LossRecord, DashboardStats, BadgeStatus, VisitorStatus } from '../types';
import { mockBadges, mockVisitors } from '../data/mockData';
import { generateId } from '../utils/id';
import { isToday, isOvertime, getDurationMs, getAverageDuration } from '../utils/time';

interface BadgeStore {
  badges: Badge[];
  visitors: Visitor[];
  lossRecords: LossRecord[];

  addBadge: (badge: Omit<Badge, 'id' | 'createdAt' | 'status'> & { status?: BadgeStatus }) => void;
  updateBadge: (id: string, data: Partial<Badge>) => void;
  deleteBadge: (id: string) => void;
  toggleBadgeStatus: (id: string) => void;

  checkInVisitor: (visitor: Omit<Visitor, 'id' | 'checkInTime' | 'status'>) => void;
  confirmReturn: (visitorId: string) => void;
  updateOvertimeStatus: () => void;
  reportLost: (data: Omit<LossRecord, 'id' | 'reportedAt' | 'status'>) => void;

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
        }));
      },

      updateOvertimeStatus: () => {
        set((state) => ({
          visitors: state.visitors.map((v) =>
            v.status === 'visiting' && isOvertime(v.expectedLeaveTime)
              ? { ...v, status: 'overtime' as VisitorStatus }
              : v
          ),
        }));
      },

      reportLost: (data) => {
        const record: LossRecord = {
          ...data,
          id: generateId(),
          reportedAt: new Date().toISOString(),
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
        }));
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
        set({ badges: mockBadges, visitors: mockVisitors, lossRecords: [] });
      },
    }),
    {
      name: 'badge-management-storage',
    }
  )
);
