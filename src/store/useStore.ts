import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { message } from 'antd';
import type {
  Ingredient,
  OpenRecord,
  UsageRecord,
  AlertItem,
  DailyUsage,
  PurchaseSuggestion,
  DiscardReason,
} from '../types';
import { ingredientsApi } from '../api/ingredients';
import { openRecordsApi } from '../api/openRecords';
import { usageRecordsApi } from '../api/usageRecords';
import { statsApi } from '../api/stats';
import type { ExpiringSoonItem } from '../api/stats';

interface IngredientStore {
  ingredients: Ingredient[];
  openRecords: OpenRecord[];
  usageRecords: UsageRecord[];
  alerts: AlertItem[];
  currentOperator: string;
  loading: Record<string, boolean>;

  fetchAll: () => Promise<void>;
  fetchIngredients: () => Promise<void>;
  fetchOpenRecords: () => Promise<void>;
  fetchUsageRecords: () => Promise<void>;
  fetchAlerts: () => Promise<void>;

  addIngredient: (data: Omit<Ingredient, 'id' | 'createdAt'>) => Promise<void>;
  updateIngredient: (id: string, data: Partial<Ingredient>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;

  openIngredient: (data: {
    ingredientId: string;
    operator: string;
    openDate: string;
    remainingWeight: number;
    sealingMethod: OpenRecord['sealingMethod'];
    freezerLocation: OpenRecord['freezerLocation'];
    actualTemp?: number;
  }) => Promise<void>;

  useIngredient: (data: {
    openRecordId: string;
    ingredientId: string;
    amount: number;
    productBatch: string;
    resealed: boolean;
    operator: string;
    usageDate: string;
    note?: string;
  }) => Promise<void>;

  discardOpenRecord: (data: {
    openRecordId: string;
    reason: DiscardReason;
    operator: string;
    note?: string;
  }) => Promise<void>;

  acknowledgeAlert: (alertId: string) => void;
  acknowledgeAllAlerts: () => void;
  setCurrentOperator: (name: string) => void;

  getDailyUsage: (days?: number) => Promise<DailyUsage[]>;
  getExpiringSoon: (days?: number) => Promise<ExpiringSoonItem[]>;
  getDiscardStats: () => Promise<{ reason: DiscardReason; count: number; weight: number }[]>;
  getPurchaseSuggestions: () => Promise<PurchaseSuggestion[]>;
  getActiveOpenRecords: () => OpenRecord[];
  getIngredientLoss: (ingredientId: string) => { totalDiscarded: number; totalOpened: number; lossRate: number };
}

export const useStore = create<IngredientStore>()(
  persist(
    (set, get) => ({
      ingredients: [],
      openRecords: [],
      usageRecords: [],
      alerts: [],
      currentOperator: '张师傅',
      loading: {},

      fetchAll: async () => {
        await Promise.all([
          get().fetchIngredients(),
          get().fetchOpenRecords(),
          get().fetchUsageRecords(),
          get().fetchAlerts(),
        ]);
      },

      fetchIngredients: async () => {
        try {
          set({ loading: { ...get().loading, ingredients: true } });
          const data = await ingredientsApi.list();
          set({ ingredients: data });
        } catch (e) {
          console.error('Failed to fetch ingredients:', e);
          message.error('获取原料列表失败');
        } finally {
          set({ loading: { ...get().loading, ingredients: false } });
        }
      },

      fetchOpenRecords: async () => {
        try {
          set({ loading: { ...get().loading, openRecords: true } });
          const data = await openRecordsApi.list('all');
          set({ openRecords: data });
        } catch (e) {
          console.error('Failed to fetch open records:', e);
          message.error('获取开封记录失败');
        } finally {
          set({ loading: { ...get().loading, openRecords: false } });
        }
      },

      fetchUsageRecords: async () => {
        try {
          set({ loading: { ...get().loading, usageRecords: true } });
          const data = await usageRecordsApi.list({ pageSize: 500 });
          set({ usageRecords: data.list });
        } catch (e) {
          console.error('Failed to fetch usage records:', e);
          message.error('获取取用记录失败');
        } finally {
          set({ loading: { ...get().loading, usageRecords: false } });
        }
      },

      fetchAlerts: async () => {
        try {
          const data = await statsApi.alerts();
          set({ alerts: data });
        } catch (e) {
          console.error('Failed to fetch alerts:', e);
        }
      },

      addIngredient: async (data) => {
        try {
          const created = await ingredientsApi.create(data);
          set({ ingredients: [created, ...get().ingredients] });
          message.success('添加成功');
        } catch (e: unknown) {
          const err = e as Error;
          message.error(err.message || '添加失败');
          throw e;
        }
      },

      updateIngredient: async (id, data) => {
        try {
          const updated = await ingredientsApi.update(id, data);
          set({
            ingredients: get().ingredients.map((i) => (i.id === id ? updated : i)),
          });
          message.success('更新成功');
        } catch (e: unknown) {
          const err = e as Error;
          message.error(err.message || '更新失败');
          throw e;
        }
      },

      deleteIngredient: async (id) => {
        try {
          await ingredientsApi.remove(id);
          set({ ingredients: get().ingredients.filter((i) => i.id !== id) });
          message.success('删除成功');
        } catch (e: unknown) {
          const err = e as Error;
          message.error(err.message || '删除失败');
          throw e;
        }
      },

      openIngredient: async (data) => {
        try {
          const created = await openRecordsApi.create(data);
          set({ openRecords: [created, ...get().openRecords] });
          void get().fetchAlerts();
          message.success('开封记录已创建');
        } catch (e: unknown) {
          const err = e as Error;
          message.error(err.message || '创建失败');
          throw e;
        }
      },

      useIngredient: async (data) => {
        try {
          const result = await usageRecordsApi.create(data);
          set({
            usageRecords: [result.usage, ...get().usageRecords],
            openRecords: get().openRecords.map((r) =>
              r.id === data.openRecordId
                ? { ...r, remainingWeight: result.openRecord.remainingWeight }
                : r
            ),
          });
          void get().fetchAlerts();
          message.success('取用记录已创建');
        } catch (e: unknown) {
          const err = e as Error;
          message.error(err.message || '创建失败');
          throw e;
        }
      },

      discardOpenRecord: async (data) => {
        try {
          const updated = await openRecordsApi.discard(
            data.openRecordId,
            data.reason,
            data.operator,
            data.note
          );
          set({
            openRecords: get().openRecords.map((r) =>
              r.id === data.openRecordId ? updated : r
            ),
          });
          void get().fetchAlerts();
          message.success('已标记为报废');
        } catch (e: unknown) {
          const err = e as Error;
          message.error(err.message || '操作失败');
          throw e;
        }
      },

      acknowledgeAlert: (alertId) =>
        set((state) => ({
          alerts: state.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
        })),

      acknowledgeAllAlerts: () =>
        set((state) => ({
          alerts: state.alerts.map((a) => ({ ...a, acknowledged: true })),
        })),

      setCurrentOperator: (name) => set({ currentOperator: name }),

      getDailyUsage: async (days = 30) => {
        const data = await statsApi.dailyUsage(days);
        return data as unknown as DailyUsage[];
      },

      getExpiringSoon: async (days = 7) => {
        return statsApi.expiringSoon(days);
      },

      getDiscardStats: async () => {
        const data = await statsApi.discardStats();
        return data as { reason: DiscardReason; count: number; weight: number }[];
      },

      getPurchaseSuggestions: async () => {
        return statsApi.purchaseSuggestions();
      },

      getActiveOpenRecords: () => get().openRecords.filter((r) => !r.isDiscarded),

      getIngredientLoss: (ingredientId) => {
        const { openRecords, usageRecords } = get();
        const ing = get().ingredients.find((i) => i.id === ingredientId);
        if (!ing) return { totalDiscarded: 0, totalOpened: 0, lossRate: 0 };

        const records = openRecords.filter((r) => r.ingredientId === ingredientId);
        const totalOpened = records.reduce((sum, r) => {
          const firstUsage = usageRecords
            .filter((u) => u.openRecordId === r.id)
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
        currentOperator: state.currentOperator,
      }),
    }
  )
);
