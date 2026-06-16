import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FoodItem, DiscardRecord, FoodFormData, StorageZone, DiscardReason } from '@/types';
import { initialFoods, initialDiscards } from '@/data/mockData';
import { addDaysDateOnly, todayStr, nowIso, isThisMonth, toDatePart } from '@/utils/date';
import {
  getEffectiveExpiry,
  getFoodStatus,
  compareByUrgency,
  getOpenedShelfLifeDays,
} from '@/utils/food';
import { daysUntil, hoursUntil } from '@/utils/date';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

interface FoodStore {
  foods: FoodItem[];
  discards: DiscardRecord[];

  addFood: (data: FoodFormData) => void;
  updateFood: (id: string, data: Partial<FoodItem>) => void;
  deleteFood: (id: string) => void;

  markOpened: (id: string, openedAt?: string) => void;
  deductPortion: (id: string, portion: number) => void;

  discardFood: (id: string, reason: DiscardReason) => void;
  clearDiscardHistory: () => void;

  getUrgentFoods: () => FoodItem[];
  getWarningFoods: () => FoodItem[];
  getTotalWaste: () => number;
  getMonthlyWaste: () => number;
  getTopDiscardReason: () => DiscardReason | null;
  getFoodsByZone: (zone: StorageZone) => FoodItem[];
  getWasteByReason: () => Record<DiscardReason, { count: number; amount: number }>;
  getPendingCount: () => number;
}

export const useFoodStore = create<FoodStore>()(
  persist(
    (set, get) => ({
      foods: initialFoods,
      discards: initialDiscards,

      addFood: (data) => {
        const today = todayStr();
        const expiryDate = addDaysDateOnly(data.purchaseDate, data.shelfLifeDays);
        let openedAt: string | null = null;
        if (data.isOpened) {
          if (data.openedAt && data.openedAt.includes('T')) {
            openedAt = data.openedAt;
          } else if (data.openedAt) {
            openedAt = new Date(`${data.openedAt}T12:00:00`).toISOString();
          } else {
            openedAt = nowIso();
          }
        }
        const { days: resolvedOpenedDays } = getOpenedShelfLifeDays(
          data.name,
          data.category,
          data.openedShelfLifeDays
        );

        const newFood: FoodItem = {
          id: generateId(),
          name: data.name,
          emoji: data.emoji,
          category: data.category,
          zone: data.zone,
          quantity: data.quantity,
          unit: data.unit,
          remaining: 1,
          purchaseDate: data.purchaseDate,
          expiryDate,
          openedAt,
          shelfLifeDays: data.shelfLifeDays,
          openedShelfLifeDays: resolvedOpenedDays,
          price: data.price,
          notes: data.notes,
          createdAt: nowIso(),
        };

        set((state) => ({ foods: [...state.foods, newFood] }));
      },

      updateFood: (id, data) => {
        set((state) => ({
          foods: state.foods.map((f) => {
            if (f.id !== id) return f;
            const merged = { ...f, ...data };
            const nameOrCategoryChanged =
              data.name !== undefined || data.category !== undefined;
            if (nameOrCategoryChanged) {
              const { days } = getOpenedShelfLifeDays(
                merged.name,
                merged.category,
                merged.openedShelfLifeDays
              );
              merged.openedShelfLifeDays = days;
            }
            return merged;
          }),
        }));
      },

      deleteFood: (id) => {
        set((state) => ({
          foods: state.foods.filter((f) => f.id !== id),
        }));
      },

      markOpened: (id, openedAt) => {
        const finalOpenedAt = openedAt ?? nowIso();
        const food = get().foods.find((f) => f.id === id);
        if (!food) return;

        const { days } = getOpenedShelfLifeDays(
          food.name,
          food.category,
          food.openedShelfLifeDays
        );
        const updates: Partial<FoodItem> = {
          openedAt: finalOpenedAt,
          openedShelfLifeDays: days,
        };

        set((state) => ({
          foods: state.foods.map((f) => (f.id === id ? { ...f, ...updates } : f)),
        }));
      },

      deductPortion: (id, portion) => {
        const state = get();
        const food = state.foods.find((f) => f.id === id);
        if (!food) return;

        const newRemaining = Math.max(0, food.remaining - portion);
        if (newRemaining <= 0) {
          set((s) => ({
            foods: s.foods.filter((f) => f.id !== id),
          }));
        } else {
          set((s) => ({
            foods: s.foods.map((f) => (f.id === id ? { ...f, remaining: newRemaining } : f)),
          }));
        }
      },

      discardFood: (id, reason) => {
        const food = get().foods.find((f) => f.id === id);
        if (!food) return;

        const wastedAmount = food.price * food.remaining;
        const wastedQuantity = food.quantity * food.remaining;

        const record: DiscardRecord = {
          id: generateId(),
          foodId: food.id,
          foodName: food.name,
          wastedAmount,
          wastedQuantity,
          reason,
          discardedAt: todayStr(),
        };

        set((state) => ({
          foods: state.foods.filter((f) => f.id !== id),
          discards: [record, ...state.discards],
        }));
      },

      clearDiscardHistory: () => {
        set({ discards: [] });
      },

      getUrgentFoods: () => {
        return get()
          .foods.filter((f) => {
            const expiry = getEffectiveExpiry(f);
            return hoursUntil(expiry) <= 24;
          })
          .sort(compareByUrgency);
      },

      getWarningFoods: () => {
        return get()
          .foods.filter((f) => {
            const expiry = getEffectiveExpiry(f);
            const hours = hoursUntil(expiry);
            return hours > 24 && hours <= 24 * 3;
          })
          .sort(compareByUrgency);
      },

      getTotalWaste: () => {
        return get().discards.reduce((sum, d) => sum + d.wastedAmount, 0);
      },

      getMonthlyWaste: () => {
        return get()
          .discards.filter((d) => isThisMonth(d.discardedAt))
          .reduce((sum, d) => sum + d.wastedAmount, 0);
      },

      getTopDiscardReason: () => {
        const byReason = get().getWasteByReason();
        let top: DiscardReason | null = null;
        let maxCount = 0;
        (Object.keys(byReason) as DiscardReason[]).forEach((reason) => {
          if (byReason[reason].count > maxCount) {
            maxCount = byReason[reason].count;
            top = reason;
          }
        });
        return top;
      },

      getFoodsByZone: (zone) => {
        return get()
          .foods.filter((f) => f.zone === zone)
          .sort(compareByUrgency);
      },

      getWasteByReason: () => {
        const result: Record<DiscardReason, { count: number; amount: number }> = {
          spoiled: { count: 0, amount: 0 },
          bought_too_much: { count: 0, amount: 0 },
          forgot: { count: 0, amount: 0 },
          bad_taste: { count: 0, amount: 0 },
        };
        get().discards.forEach((d) => {
          result[d.reason].count++;
          result[d.reason].amount += d.wastedAmount;
        });
        return result;
      },

      getPendingCount: () => {
        return get().foods.filter((f) => {
          const status = getFoodStatus(f);
          return status === 'danger' || status === 'warning';
        }).length;
      },
    }),
    {
      name: 'fridge-food-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
