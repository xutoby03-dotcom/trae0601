import { create } from 'zustand';
import { api } from '@/services/api';

interface PlanState {
  plans: Plan[];
  currentPlan: Plan | null;
  seating: { planId: string; tables: Table[] } | null;
  conflicts: Conflict[];
  loading: boolean;
  error: string | null;
  
  fetchPlans: () => Promise<void>;
  fetchPlanById: (id: string) => Promise<Plan | undefined>;
  createPlan: (data: Omit<Plan, 'id' | 'createdAt'>) => Promise<Plan>;
  updatePlan: (id: string, data: Partial<Plan>) => Promise<Plan | undefined>;
  deletePlan: (id: string) => Promise<boolean>;
  
  addDish: (planId: string, data: Omit<Dish, 'id'>) => Promise<Dish | undefined>;
  updateDish: (planId: string, dishId: string, data: Partial<Dish>) => Promise<Dish | undefined>;
  deleteDish: (planId: string, dishId: string) => Promise<boolean>;
  
  getSeating: (planId: string) => Promise<void>;
  generateSeating: (planId: string) => Promise<void>;
  saveSeating: (planId: string, tables: Table[]) => Promise<void>;
  
  getConflicts: (planId: string) => Promise<void>;
  
  exportRestaurantList: (planId: string) => Promise<void>;
  exportTableCards: (planId: string) => Promise<void>;
  
  setCurrentPlan: (plan: Plan | null) => void;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: [],
  currentPlan: null,
  seating: null,
  conflicts: [],
  loading: false,
  error: null,

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const plans = await api.plans.getAll();
      set({ plans, loading: false });
    } catch (error) {
      set({ error: '获取方案列表失败', loading: false });
    }
  },

  fetchPlanById: async (id) => {
    set({ loading: true, error: null });
    try {
      const plan = await api.plans.getById(id);
      if (plan) {
        set({ currentPlan: plan, loading: false });
      }
      return plan;
    } catch (error) {
      set({ error: '获取方案详情失败', loading: false });
    }
  },

  createPlan: async (data) => {
    set({ loading: true, error: null });
    try {
      const plan = await api.plans.create(data);
      set((state) => ({ plans: [...state.plans, plan], loading: false }));
      return plan;
    } catch (error) {
      set({ error: '创建方案失败', loading: false });
      throw error;
    }
  },

  updatePlan: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await api.plans.update(id, data);
      if (updated) {
        set((state) => ({
          plans: state.plans.map((p) => (p.id === id ? updated : p)),
          currentPlan: state.currentPlan?.id === id ? updated : state.currentPlan,
          loading: false,
        }));
      }
      return updated;
    } catch (error) {
      set({ error: '更新方案失败', loading: false });
      throw error;
    }
  },

  deletePlan: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.plans.delete(id);
      set((state) => ({
        plans: state.plans.filter((p) => p.id !== id),
        currentPlan: state.currentPlan?.id === id ? null : state.currentPlan,
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: '删除方案失败', loading: false });
      return false;
    }
  },

  addDish: async (planId, data) => {
    set({ loading: true, error: null });
    try {
      const dish = await api.plans.addDish(planId, data);
      if (dish) {
        const plan = get().plans.find((p) => p.id === planId);
        if (plan) {
          const updatedPlan = { ...plan, dishes: [...plan.dishes, dish] };
          set((state) => ({
            plans: state.plans.map((p) => (p.id === planId ? updatedPlan : p)),
            currentPlan: state.currentPlan?.id === planId ? updatedPlan : state.currentPlan,
            loading: false,
          }));
        }
      }
      return dish;
    } catch (error) {
      set({ error: '添加菜品失败', loading: false });
      throw error;
    }
  },

  updateDish: async (planId, dishId, data) => {
    set({ loading: true, error: null });
    try {
      const dish = await api.plans.updateDish(planId, dishId, data);
      if (dish) {
        const plan = get().plans.find((p) => p.id === planId);
        if (plan) {
          const updatedPlan = {
            ...plan,
            dishes: plan.dishes.map((d) => (d.id === dishId ? dish : d)),
          };
          set((state) => ({
            plans: state.plans.map((p) => (p.id === planId ? updatedPlan : p)),
            currentPlan: state.currentPlan?.id === planId ? updatedPlan : state.currentPlan,
            loading: false,
          }));
        }
      }
      return dish;
    } catch (error) {
      set({ error: '更新菜品失败', loading: false });
      throw error;
    }
  },

  deleteDish: async (planId, dishId) => {
    set({ loading: true, error: null });
    try {
      await api.plans.deleteDish(planId, dishId);
      const plan = get().plans.find((p) => p.id === planId);
      if (plan) {
        const updatedPlan = {
          ...plan,
          dishes: plan.dishes.filter((d) => d.id !== dishId),
        };
        set((state) => ({
          plans: state.plans.map((p) => (p.id === planId ? updatedPlan : p)),
          currentPlan: state.currentPlan?.id === planId ? updatedPlan : state.currentPlan,
          loading: false,
        }));
      }
      return true;
    } catch (error) {
      set({ error: '删除菜品失败', loading: false });
      return false;
    }
  },

  getSeating: async (planId) => {
    set({ loading: true, error: null });
    try {
      const seating = await api.plans.getSeating(planId);
      set({ seating, loading: false });
    } catch (error) {
      set({ error: '获取分桌方案失败', loading: false });
    }
  },

  generateSeating: async (planId) => {
    set({ loading: true, error: null });
    try {
      const seating = await api.plans.generateSeating(planId);
      set({ seating, loading: false });
    } catch (error) {
      set({ error: '生成分桌方案失败', loading: false });
    }
  },

  saveSeating: async (planId, tables) => {
    set({ loading: true, error: null });
    try {
      const seating = await api.plans.saveSeating(planId, tables);
      set({ seating, loading: false });
    } catch (error) {
      set({ error: '保存分桌方案失败', loading: false });
    }
  },

  getConflicts: async (planId) => {
    set({ loading: true, error: null });
    try {
      const conflicts = await api.plans.getConflicts(planId);
      set({ conflicts, loading: false });
    } catch (error) {
      set({ error: '获取冲突检测结果失败', loading: false });
    }
  },

  exportRestaurantList: async (planId) => {
    try {
      const content = await api.plans.exportRestaurantList(planId);
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `餐厅忌口清单.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      set({ error: '导出餐厅清单失败' });
    }
  },

  exportTableCards: async (planId) => {
    try {
      const content = await api.plans.exportTableCards(planId);
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `每桌桌签.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      set({ error: '导出桌签失败' });
    }
  },

  setCurrentPlan: (plan) => set({ currentPlan: plan }),
}));
