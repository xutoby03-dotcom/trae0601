import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import type {
  Ingredient,
  OpenRecord,
  UsageRecord,
  AlertItem,
  DailyUsage,
  PurchaseSuggestion,
  DiscardReason,
} from '../types';
import { generateId, loadData, saveData } from '../utils/storage';
import { generateAlerts, daysBetween } from '../utils/dateUtils';

interface IngredientStore {
  ingredients: Ingredient[];
  openRecords: OpenRecord[];
  usageRecords: UsageRecord[];
  alerts: AlertItem[];
  currentOperator: string;

  addIngredient: (data: Omit<Ingredient, 'id' | 'createdAt'>) => void;
  updateIngredient: (id: string, data: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;

  openIngredient: (data: {
    ingredientId: string;
    operator: string;
    openDate: string;
    remainingWeight: number;
    sealingMethod: OpenRecord['sealingMethod'];
    freezerLocation: OpenRecord['freezerLocation'];
    actualTemp?: number;
  }) => void;

  useIngredient: (data: {
    openRecordId: string;
    ingredientId: string;
    amount: number;
    productBatch: string;
    resealed: boolean;
    operator: string;
    usageDate: string;
    note?: string;
  }) => void;

  discardOpenRecord: (data: {
    openRecordId: string;
    reason: DiscardReason;
    operator: string;
    note?: string;
  }) => void;

  acknowledgeAlert: (alertId: string) => void;
  acknowledgeAllAlerts: () => void;
  refreshAlerts: () => void;
  setCurrentOperator: (name: string) => void;

  getDailyUsage: (days?: number) => DailyUsage[];
  getExpiringSoon: (days?: number) => (OpenRecord & { ingredient: Ingredient; daysLeft: number })[];
  getDiscardStats: () => { reason: DiscardReason; count: number; weight: number }[];
  getPurchaseSuggestions: () => PurchaseSuggestion[];
  getActiveOpenRecords: () => OpenRecord[];
  getIngredientLoss: (ingredientId: string) => { totalDiscarded: number; totalOpened: number; lossRate: number };
}

const seedIngredients: Ingredient[] = [
  {
    id: 'seed_1',
    name: '淡奶油',
    brand: '安佳',
    batch: 'AC20260601',
    unopenedShelfLifeDays: 180,
    openedDays: 3,
    storageTempMin: 2,
    storageTempMax: 8,
    totalWeight: 1000,
    unit: 'ml',
    lowStockThreshold: 200,
    createdAt: '2026-06-01 10:00:00',
  },
  {
    id: 'seed_2',
    name: '榛子碎',
    brand: '宝茸',
    batch: 'BR20260515',
    unopenedShelfLifeDays: 365,
    openedDays: 30,
    storageTempMin: 10,
    storageTempMax: 20,
    totalWeight: 500,
    unit: 'g',
    lowStockThreshold: 100,
    createdAt: '2026-05-20 14:30:00',
  },
  {
    id: 'seed_3',
    name: '干酵母',
    brand: '燕子',
    batch: 'YZ20260401',
    unopenedShelfLifeDays: 730,
    openedDays: 60,
    storageTempMin: -18,
    storageTempMax: -5,
    totalWeight: 500,
    unit: 'g',
    lowStockThreshold: 50,
    createdAt: '2026-04-10 09:00:00',
  },
  {
    id: 'seed_4',
    name: '黄油',
    brand: '总统',
    batch: 'ZT20260520',
    unopenedShelfLifeDays: 240,
    openedDays: 14,
    storageTempMin: 0,
    storageTempMax: 6,
    totalWeight: 1000,
    unit: 'g',
    lowStockThreshold: 200,
    createdAt: '2026-05-25 11:00:00',
  },
];

const seedOpenRecords: OpenRecord[] = [
  {
    id: 'open_1',
    ingredientId: 'seed_1',
    operator: '张师傅',
    openDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    remainingWeight: 600,
    sealingMethod: '保鲜膜',
    freezerLocation: '冷藏柜A',
    actualTemp: 5,
    isDiscarded: false,
    createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD 09:00:00'),
  },
  {
    id: 'open_2',
    ingredientId: 'seed_2',
    operator: '李师傅',
    openDate: dayjs().subtract(15, 'day').format('YYYY-MM-DD'),
    remainingWeight: 350,
    sealingMethod: '密封罐',
    freezerLocation: '阴凉处',
    actualTemp: 18,
    isDiscarded: false,
    createdAt: dayjs().subtract(15, 'day').format('YYYY-MM-DD 14:00:00'),
  },
  {
    id: 'open_3',
    ingredientId: 'seed_4',
    operator: '王师傅',
    openDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    remainingWeight: 450,
    sealingMethod: '原包装封口',
    freezerLocation: '冷藏柜A',
    actualTemp: 4,
    isDiscarded: false,
    createdAt: dayjs().subtract(5, 'day').format('YYYY-MM-DD 10:30:00'),
  },
];

const seedUsageRecords: UsageRecord[] = [
  {
    id: 'use_1',
    openRecordId: 'open_1',
    ingredientId: 'seed_1',
    amount: 200,
    productBatch: 'Cake20260612A',
    resealed: true,
    operator: '张师傅',
    usageDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(1, 'day').format('YYYY-MM-DD 10:00:00'),
  },
  {
    id: 'use_2',
    openRecordId: 'open_3',
    ingredientId: 'seed_4',
    amount: 300,
    productBatch: 'Bread20260612B',
    resealed: true,
    operator: '王师傅',
    usageDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(2, 'day').format('YYYY-MM-DD 09:30:00'),
  },
  {
    id: 'use_3',
    openRecordId: 'open_2',
    ingredientId: 'seed_2',
    amount: 150,
    productBatch: 'Tart20260611C',
    resealed: true,
    operator: '李师傅',
    usageDate: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    createdAt: dayjs().subtract(10, 'day').format('YYYY-MM-DD 15:00:00'),
  },
];

const initialIngredients = loadData<Ingredient[]>('ingredients', seedIngredients);
const initialOpenRecords = loadData<OpenRecord[]>('openRecords', seedOpenRecords);
const initialUsageRecords = loadData<UsageRecord[]>('usageRecords', seedUsageRecords);

export const useStore = create<IngredientStore>()(
  persist(
    (set, get) => ({
      ingredients: initialIngredients,
      openRecords: initialOpenRecords,
      usageRecords: initialUsageRecords,
      alerts: generateAlerts(initialOpenRecords, initialIngredients, initialOpenRecords.filter((r) => !r.isDiscarded)),
      currentOperator: loadData<string>('currentOperator', '张师傅'),

      addIngredient: (data) =>
        set((state) => {
          const newIng: Ingredient = {
            ...data,
            id: generateId(),
            createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          };
          const newList = [...state.ingredients, newIng];
          saveData('ingredients', newList);
          return { ingredients: newList };
        }),

      updateIngredient: (id, data) =>
        set((state) => {
          const newList = state.ingredients.map((i) => (i.id === id ? { ...i, ...data } : i));
          saveData('ingredients', newList);
          return { ingredients: newList };
        }),

      deleteIngredient: (id) =>
        set((state) => {
          const newList = state.ingredients.filter((i) => i.id !== id);
          saveData('ingredients', newList);
          return { ingredients: newList };
        }),

      openIngredient: (data) =>
        set((state) => {
          const newRecord: OpenRecord = {
            ...data,
            id: generateId(),
            isDiscarded: false,
            createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          };
          const newList = [...state.openRecords, newRecord];
          saveData('openRecords', newList);
          const newState = { openRecords: newList };
          const newAlerts = generateAlerts(
            newList,
            state.ingredients,
            newList.filter((r) => !r.isDiscarded)
          );
          return { ...newState, alerts: newAlerts };
        }),

      useIngredient: (data) =>
        set((state) => {
          const newUsage: UsageRecord = {
            ...data,
            id: generateId(),
            createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          };
          const newUsageList = [...state.usageRecords, newUsage];
          saveData('usageRecords', newUsageList);

          const newOpenList = state.openRecords.map((r) =>
            r.id === data.openRecordId
              ? { ...r, remainingWeight: Math.max(0, r.remainingWeight - data.amount) }
              : r
          );
          saveData('openRecords', newOpenList);

          const newAlerts = generateAlerts(
            newOpenList,
            state.ingredients,
            newOpenList.filter((r) => !r.isDiscarded)
          );

          return {
            usageRecords: newUsageList,
            openRecords: newOpenList,
            alerts: newAlerts,
          };
        }),

      discardOpenRecord: (data) =>
        set((state) => {
          const newList = state.openRecords.map((r) =>
            r.id === data.openRecordId
              ? {
                  ...r,
                  isDiscarded: true,
                  discardReason: data.reason,
                  discardDate: dayjs().format('YYYY-MM-DD'),
                  discardOperator: data.operator,
                  discardNote: data.note,
                }
              : r
          );
          saveData('openRecords', newList);
          const newAlerts = generateAlerts(
            newList,
            state.ingredients,
            newList.filter((r) => !r.isDiscarded)
          );
          return { openRecords: newList, alerts: newAlerts };
        }),

      acknowledgeAlert: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
        })),

      acknowledgeAllAlerts: () =>
        set((state) => ({
          alerts: state.alerts.map((a) => ({ ...a, acknowledged: true })),
        })),

      refreshAlerts: () =>
        set((state) => ({
          alerts: generateAlerts(
            state.openRecords,
            state.ingredients,
            state.openRecords.filter((r) => !r.isDiscarded)
          ),
        })),

      setCurrentOperator: (name) => {
        saveData('currentOperator', name);
        set({ currentOperator: name });
      },

      getDailyUsage: (days = 30) => {
        const { usageRecords, ingredients } = get();
        const ingMap = new Map(ingredients.map((i) => [i.id, i]));
        const startDate = dayjs().subtract(days - 1, 'day').startOf('day');
        const dailyMap = new Map<string, DailyUsage>();

        usageRecords
          .filter((u) => dayjs(u.usageDate).isAfter(startDate) || dayjs(u.usageDate).isSame(startDate, 'day'))
          .forEach((u) => {
            const ing = ingMap.get(u.ingredientId);
            if (!ing) return;
            const key = `${u.usageDate}_${u.ingredientId}`;
            if (dailyMap.has(key)) {
              dailyMap.get(key)!.totalUsed += u.amount;
            } else {
              dailyMap.set(key, {
                date: u.usageDate,
                ingredientId: u.ingredientId,
                ingredientName: ing.name,
                totalUsed: u.amount,
                unit: ing.unit,
              });
            }
          });

        return Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date));
      },

      getExpiringSoon: (days = 7) => {
        const { openRecords, ingredients } = get();
        const ingMap = new Map(ingredients.map((i) => [i.id, i]));
        const activeRecords = openRecords.filter((r) => !r.isDiscarded);
        const result: (OpenRecord & { ingredient: Ingredient; daysLeft: number })[] = [];

        activeRecords.forEach((r) => {
          const ing = ingMap.get(r.ingredientId);
          if (!ing) return;
          const daysOpened = daysBetween(dayjs().format('YYYY-MM-DD'), r.openDate);
          const daysLeft = ing.openedDays - daysOpened;
          if (daysLeft <= days) {
            result.push({ ...r, ingredient: ing, daysLeft });
          }
        });

        return result.sort((a, b) => a.daysLeft - b.daysLeft);
      },

      getDiscardStats: () => {
        const { openRecords, ingredients } = get();
        const ingMap = new Map(ingredients.map((i) => [i.id, i]));
        const reasonMap = new Map<DiscardReason, { count: number; weight: number }>();

        openRecords
          .filter((r) => r.isDiscarded && r.discardReason)
          .forEach((r) => {
            const ing = ingMap.get(r.ingredientId);
            const reason = r.discardReason!;
            const weight = r.remainingWeight;
            const current = reasonMap.get(reason) || { count: 0, weight: 0 };
            reasonMap.set(reason, {
              count: current.count + 1,
              weight: current.weight + weight,
            });
            void ing;
          });

        return Array.from(reasonMap.entries()).map(([reason, stats]) => ({
          reason,
          count: stats.count,
          weight: Number(stats.weight.toFixed(2)),
        }));
      },

      getPurchaseSuggestions: () => {
        const { ingredients, openRecords, usageRecords } = get();
        const activeRecords = openRecords.filter((r) => !r.isDiscarded);
        const suggestions: PurchaseSuggestion[] = [];
        const daysForAvg = 14;
        const startDate = dayjs().subtract(daysForAvg - 1, 'day').startOf('day');

        ingredients.forEach((ing) => {
          const stockRecords = activeRecords.filter((r) => r.ingredientId === ing.id);
          const currentStock = stockRecords.reduce((sum, r) => sum + r.remainingWeight, 0);

          const usages = usageRecords.filter(
            (u) =>
              u.ingredientId === ing.id &&
              (dayjs(u.usageDate).isAfter(startDate) || dayjs(u.usageDate).isSame(startDate, 'day'))
          );
          const totalUsed = usages.reduce((sum, u) => sum + u.amount, 0);
          const avgDailyUsage = totalUsed / daysForAvg;

          const daysLeft = avgDailyUsage > 0 ? Math.floor(currentStock / avgDailyUsage) : 999;

          let urgency: PurchaseSuggestion['urgency'] = 'low';
          if (daysLeft <= 3 || currentStock <= ing.lowStockThreshold) urgency = 'high';
          else if (daysLeft <= 7) urgency = 'medium';

          const suggestedQuantity = Math.max(
            ing.totalWeight,
            Math.ceil(avgDailyUsage * 14 / ing.totalWeight) * ing.totalWeight
          );

          suggestions.push({
            ingredientId: ing.id,
            ingredientName: ing.name,
            brand: ing.brand,
            currentStock,
            unit: ing.unit,
            avgDailyUsage: Number(avgDailyUsage.toFixed(2)),
            daysLeft,
            suggestedQuantity,
            urgency,
          });
        });

        return suggestions.sort((a, b) => {
          const order = { high: 0, medium: 1, low: 2 };
          return order[a.urgency] - order[b.urgency];
        });
      },

      getActiveOpenRecords: () => get().openRecords.filter((r) => !r.isDiscarded),

      getIngredientLoss: (ingredientId) => {
        const { openRecords, ingredients } = get();
        const ing = ingredients.find((i) => i.id === ingredientId);
        if (!ing) return { totalDiscarded: 0, totalOpened: 0, lossRate: 0 };

        const records = openRecords.filter((r) => r.ingredientId === ingredientId);
        const totalOpened = records.reduce((sum, r) => {
          const firstUsage = get()
            .usageRecords.filter((u) => u.openRecordId === r.id)
            .reduce((s, u) => s + u.amount, 0);
          return sum + firstUsage + r.remainingWeight;
        }, 0);

        const totalDiscarded = records
          .filter((r) => r.isDiscarded)
          .reduce((sum, r) => sum + r.remainingWeight, 0);

        return {
          totalDiscarded: Number(totalDiscarded.toFixed(2)),
          totalOpened: Number(totalOpened.toFixed(2)),
          lossRate: totalOpened > 0 ? Number(((totalDiscarded / totalOpened) * 100).toFixed(2)) : 0,
        };
      },
    }),
    {
      name: 'bakery-ingredient-store',
      partialize: (state) => ({
        ingredients: state.ingredients,
        openRecords: state.openRecords,
        usageRecords: state.usageRecords,
        currentOperator: state.currentOperator,
      }),
    }
  )
);
