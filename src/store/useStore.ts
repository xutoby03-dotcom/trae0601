import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Pitcher,
  FilterReplacement,
  WaterRefill,
  WaterQualityAlert,
  FilterStock,
  DashboardStats,
  ReplaceFilterData,
  FilterStatus,
} from '../types';
import {
  mockPitchers,
  mockFilterReplacements,
  mockWaterRefills,
  mockAlerts,
  mockStocks,
} from '../data/mockData';
import {
  calculateFilterLifePercent,
  calculateFilterDaysLeft,
  getFilterStatus,
  calculateRefillCountInDays,
  generateId,
} from '../utils/calculations';
import { getToday, daysBetween } from '../utils/date';

interface AppState {
  pitchers: Pitcher[];
  filterReplacements: FilterReplacement[];
  waterRefills: WaterRefill[];
  alerts: WaterQualityAlert[];
  stocks: FilterStock[];

  addPitcher: (pitcher: Omit<Pitcher, 'id' | 'createdAt'>) => void;
  updatePitcher: (id: string, data: Partial<Pitcher>) => void;
  deletePitcher: (id: string) => void;

  replaceFilter: (pitcherId: string, data: ReplaceFilterData) => void;
  getCurrentFilter: (pitcherId: string) => FilterReplacement | null;
  getFilterLifePercent: (pitcherId: string) => number;
  getFilterDaysLeft: (pitcherId: string) => number;
  getFilterStatus: (pitcherId: string) => FilterStatus;

  addRefill: (pitcherId: string, count?: number, note?: string) => void;
  getRefillCount: (pitcherId: string, days?: number) => number;

  addAlert: (alert: Omit<WaterQualityAlert, 'id'>) => void;
  resolveAlert: (id: string) => void;
  getUnresolvedAlerts: () => WaterQualityAlert[];

  updateStock: (filterModel: string, quantity: number) => void;
  getStock: (filterModel: string) => number;

  getDashboardStats: () => DashboardStats;

  resetData: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      pitchers: mockPitchers,
      filterReplacements: mockFilterReplacements,
      waterRefills: mockWaterRefills,
      alerts: mockAlerts,
      stocks: mockStocks,

      addPitcher: (pitcher) =>
        set((state) => ({
          pitchers: [
            ...state.pitchers,
            {
              ...pitcher,
              id: generateId(),
              createdAt: getToday(),
            },
          ],
        })),

      updatePitcher: (id, data) =>
        set((state) => ({
          pitchers: state.pitchers.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deletePitcher: (id) =>
        set((state) => ({
          pitchers: state.pitchers.filter((p) => p.id !== id),
          filterReplacements: state.filterReplacements.filter(
            (r) => r.pitcherId !== id
          ),
          waterRefills: state.waterRefills.filter((r) => r.pitcherId !== id),
          alerts: state.alerts.filter((a) => a.pitcherId !== id),
        })),

      replaceFilter: (pitcherId, data) => {
        const state = get();
        const pitcher = state.pitchers.find((p) => p.id === pitcherId);
        if (!pitcher) return;

        const currentStock = state.getStock(pitcher.filterModel);
        const newStock = Math.max(0, currentStock - 1);

        const replacement: FilterReplacement = {
          id: generateId(),
          pitcherId,
          ...data,
          stockAfter: newStock,
          createdAt: getToday(),
        };

        set((state) => ({
          filterReplacements: [...state.filterReplacements, replacement],
          stocks: state.stocks.map((s) =>
            s.filterModel === pitcher.filterModel
              ? { ...s, quantity: newStock, lastUpdated: getToday() }
              : s
          ),
        }));
      },

      getCurrentFilter: (pitcherId) => {
        const state = get();
        const replacements = state.filterReplacements
          .filter((r) => r.pitcherId === pitcherId)
          .sort((a, b) => new Date(b.installDate).getTime() - new Date(a.installDate).getTime());
        return replacements[0] || null;
      },

      getFilterLifePercent: (pitcherId) => {
        const currentFilter = get().getCurrentFilter(pitcherId);
        return calculateFilterLifePercent(currentFilter);
      },

      getFilterDaysLeft: (pitcherId) => {
        const currentFilter = get().getCurrentFilter(pitcherId);
        return calculateFilterDaysLeft(currentFilter);
      },

      getFilterStatus: (pitcherId) => {
        const lifePercent = get().getFilterLifePercent(pitcherId);
        return getFilterStatus(lifePercent);
      },

      addRefill: (pitcherId, count = 1, note) =>
        set((state) => {
          const today = getToday();
          const existingRefill = state.waterRefills.find(
            (r) => r.pitcherId === pitcherId && r.date === today
          );

          if (existingRefill) {
            return {
              waterRefills: state.waterRefills.map((r) =>
                r.id === existingRefill.id
                  ? { ...r, count: r.count + count }
                  : r
              ),
            };
          }

          return {
            waterRefills: [
              ...state.waterRefills,
              {
                id: generateId(),
                pitcherId,
                date: today,
                count,
                note,
              },
            ],
          };
        }),

      getRefillCount: (pitcherId, days = 30) => {
        const state = get();
        const pitcherRefills = state.waterRefills.filter(
          (r) => r.pitcherId === pitcherId
        );
        return calculateRefillCountInDays(pitcherRefills, days);
      },

      addAlert: (alert) =>
        set((state) => ({
          alerts: [...state.alerts, { ...alert, id: generateId() }],
        })),

      resolveAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, resolved: true } : a
          ),
        })),

      getUnresolvedAlerts: () => {
        return get().alerts.filter((a) => !a.resolved);
      },

      updateStock: (filterModel, quantity) =>
        set((state) => {
          const existingStock = state.stocks.find(
            (s) => s.filterModel === filterModel
          );

          if (existingStock) {
            return {
              stocks: state.stocks.map((s) =>
                s.filterModel === filterModel
                  ? { ...s, quantity, lastUpdated: getToday() }
                  : s
              ),
            };
          }

          return {
            stocks: [
              ...state.stocks,
              {
                id: generateId(),
                filterModel,
                quantity,
                lastUpdated: getToday(),
              },
            ],
          };
        }),

      getStock: (filterModel) => {
        const stock = get().stocks.find((s) => s.filterModel === filterModel);
        return stock?.quantity ?? 0;
      },

      getDashboardStats: () => {
        const state = get();
        const { pitchers } = state;

        let healthyFilters = 0;
        let warningFilters = 0;
        let expiredFilters = 0;
        let lowStockCount = 0;

        const pitcherUsageStats = pitchers.map((pitcher) => {
          const status = state.getFilterStatus(pitcher.id);
          const stock = state.getStock(pitcher.filterModel);
          const lifePercent = state.getFilterLifePercent(pitcher.id);

          if (status === 'healthy' || status === 'normal') healthyFilters++;
          if (status === 'warning') warningFilters++;
          if (status === 'expired') expiredFilters++;

          if (stock <= 1 && lifePercent < 30) {
            lowStockCount++;
          }
          if (status === 'expired' && stock === 0) {
            lowStockCount++;
          }

          return {
            pitcherId: pitcher.id,
            pitcherName: pitcher.name,
            refillCount: state.getRefillCount(pitcher.id, 30),
          };
        });

        const unresolvedAlerts = state.getUnresolvedAlerts();
        const recentAlerts = [...state.alerts]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        let earliestExpiry = Infinity;
        let totalStock = 0;
        pitchers.forEach((pitcher) => {
          const daysLeft = state.getFilterDaysLeft(pitcher.id);
          if (daysLeft < earliestExpiry) {
            earliestExpiry = daysLeft;
          }
          totalStock += state.getStock(pitcher.filterModel);
        });

        const averageLifeDays = 45;
        const suggestedQuantity = Math.max(
          0,
          Math.ceil((90 / averageLifeDays) * pitchers.length) - totalStock
        );

        return {
          totalPitchers: pitchers.length,
          healthyFilters,
          warningFilters,
          expiredFilters,
          lowStockCount,
          unresolvedAlerts: unresolvedAlerts.length,
          purchaseSuggestion: {
            needPurchase: lowStockCount > 0 || totalStock < pitchers.length,
            suggestedQuantity: Math.max(1, suggestedQuantity),
            estimatedDaysLeft: earliestExpiry === Infinity ? 0 : earliestExpiry,
          },
          recentAlerts,
          pitcherUsageStats,
        };
      },

      resetData: () => {
        set({
          pitchers: mockPitchers,
          filterReplacements: mockFilterReplacements,
          waterRefills: mockWaterRefills,
          alerts: mockAlerts,
          stocks: mockStocks,
        });
      },
    }),
    {
      name: 'water-filter-app-state',
    }
  )
);
