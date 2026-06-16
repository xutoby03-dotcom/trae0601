import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CoffeeBean, Grinder, WasteRecord, WasteType } from '../types';
import { mockBeans, mockGrinders, mockWasteRecords } from '../utils/mockData';
import { canSetAsTodayPick } from '../utils/flavorUtils';
import { getToday } from '../utils/dateUtils';

interface CoffeeState {
  beans: CoffeeBean[];
  grinders: Grinder[];
  wasteRecords: WasteRecord[];

  setTodayPick: (beanId: string) => void;
  dispenseCoffee: (grinderId: string, grams: number) => boolean;
  recordWaste: (beanId: string, type: WasteType, grams: number, note?: string) => void;
  bindGrinder: (grinderId: string, beanId: string) => void;
  updateRecommendationOrder: (beanIds: string[]) => void;
  addBean: (bean: Omit<CoffeeBean, 'id' | 'createdAt'>) => void;
  getBeanById: (id: string) => CoffeeBean | undefined;
}

function sanitizeTodayPick(beans: CoffeeBean[]): CoffeeBean[] {
  const pickBeans = beans.filter((b) => b.isTodayPick && canSetAsTodayPick(b));
  const validPickId = pickBeans.length > 0 ? pickBeans[0].id : null;
  return beans.map((b) => ({
    ...b,
    isTodayPick: validPickId !== null && b.id === validPickId,
  }));
}

export const useCoffeeStore = create<CoffeeState>()(
  persist(
    (set, get) => ({
      beans: sanitizeTodayPick(mockBeans),
      grinders: mockGrinders,
      wasteRecords: mockWasteRecords,

      getBeanById: (id: string) => {
        return get().beans.find((b) => b.id === id);
      },

      setTodayPick: (beanId: string) => {
        set((state) => {
          const bean = state.beans.find((b) => b.id === beanId);
          const sanitized = sanitizeTodayPick(state.beans);
          if (!bean || !canSetAsTodayPick(bean)) {
            return { beans: sanitized };
          }
          return {
            beans: sanitized.map((b) => ({
              ...b,
              isTodayPick: b.id === beanId,
            })),
          };
        });
      },

      dispenseCoffee: (grinderId: string, grams: number) => {
        const state = get();
        const grinder = state.grinders.find((g) => g.id === grinderId);
        if (!grinder || !grinder.beanId) return false;

        const bean = state.beans.find((b) => b.id === grinder.beanId);
        if (!bean || bean.remainingWeight < grams) return false;

        set((state) => ({
          beans: state.beans.map((b) =>
            b.id === grinder.beanId
              ? { ...b, remainingWeight: Math.max(0, b.remainingWeight - grams) }
              : b
          ),
          grinders: state.grinders.map((g) =>
            g.id === grinderId ? { ...g, lastUsed: getToday() } : g
          ),
        }));
        return true;
      },

      recordWaste: (beanId: string, type: WasteType, grams: number, note?: string) => {
        set((state) => {
          const bean = state.beans.find((b) => b.id === beanId);
          if (!bean || bean.remainingWeight < grams) return state;

          const newRecord: WasteRecord = {
            id: `waste-${Date.now()}`,
            beanId,
            wasteType: type,
            weight: grams,
            note,
            createdAt: new Date().toISOString(),
          };

          return {
            wasteRecords: [newRecord, ...state.wasteRecords],
            beans: state.beans.map((b) =>
              b.id === beanId
                ? { ...b, remainingWeight: Math.max(0, b.remainingWeight - grams) }
                : b
            ),
          };
        });
      },

      bindGrinder: (grinderId: string, beanId: string) => {
        set((state) => ({
          grinders: state.grinders.map((g) =>
            g.id === grinderId ? { ...g, beanId } : g
          ),
        }));
      },

      updateRecommendationOrder: (beanIds: string[]) => {
        set((state) => ({
          beans: state.beans.map((b) => {
            const index = beanIds.indexOf(b.id);
            return {
              ...b,
              recommendationOrder: index >= 0 ? index + 1 : 0,
            };
          }),
        }));
      },

      addBean: (bean: Omit<CoffeeBean, 'id' | 'createdAt'>) => {
        const newBean: CoffeeBean = {
          ...bean,
          id: `bean-${Date.now()}`,
          createdAt: getToday(),
        };
        set((state) => ({
          beans: [...state.beans, newBean],
        }));
      },
    }),
    {
      name: 'coffee-bean-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.beans = sanitizeTodayPick(state.beans);
        }
      },
    }
  )
);
