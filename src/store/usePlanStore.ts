import { create } from 'zustand';
import type { WeightPlan } from '@/types';
import { loadPlans, savePlans, generateId } from '@/utils/storage';

interface PlanState {
  plans: WeightPlan[];
  addPlan: (plan: Omit<WeightPlan, 'id' | 'createdAt' | 'updatedAt'>) => WeightPlan;
  updatePlan: (id: string, plan: Partial<WeightPlan>) => void;
  deletePlan: (id: string) => void;
  getPlan: (id: string) => WeightPlan | undefined;
  duplicatePlan: (id: string) => WeightPlan;
  searchPlans: (query: string) => WeightPlan[];
}

export const usePlanStore = create<PlanState>((set, get) => ({
  plans: loadPlans(),

  addPlan: (planData) => {
    const now = new Date().toISOString();
    const newPlan: WeightPlan = {
      ...planData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      const plans = [newPlan, ...state.plans];
      savePlans(plans);
      return { plans };
    });
    return newPlan;
  },

  updatePlan: (id, planData) => {
    set((state) => {
      const plans = state.plans.map((plan) =>
        plan.id === id
          ? { ...plan, ...planData, updatedAt: new Date().toISOString() }
          : plan
      );
      savePlans(plans);
      return { plans };
    });
  },

  deletePlan: (id) => {
    set((state) => {
      const plans = state.plans.filter((plan) => plan.id !== id);
      savePlans(plans);
      return { plans };
    });
  },

  getPlan: (id) => {
    return get().plans.find((plan) => plan.id === id);
  },

  duplicatePlan: (id) => {
    const plan = get().getPlan(id);
    if (!plan) {
      throw new Error('Plan not found');
    }
    return get().addPlan({
      ...plan,
      name: `${plan.name} (副本)`,
    });
  },

  searchPlans: (query) => {
    if (!query.trim()) {
      return get().plans;
    }
    const lowerQuery = query.toLowerCase();
    return get().plans.filter(
      (plan) =>
        plan.name.toLowerCase().includes(lowerQuery) ||
        plan.salinity.toLowerCase().includes(lowerQuery) ||
        plan.cameraHousing.toLowerCase().includes(lowerQuery) ||
        plan.lensPort.toLowerCase().includes(lowerQuery) ||
        plan.wetsuitThickness.toLowerCase().includes(lowerQuery) ||
        plan.buoyancyArm.toLowerCase().includes(lowerQuery)
    );
  },
}));
