import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CleaningItem,
  CleaningPlan,
  PlanStatus,
  ItemStatusGroup,
} from '@/types';
import { generateId } from '@/lib/utils';
import {
  addDays,
  getDaysUntilNextClean,
  formatDate,
  isThisYear,
  getMonthKey,
} from '@/utils/dateUtils';

interface CleaningStore {
  items: CleaningItem[];
  plans: CleaningPlan[];
  addItem: (item: Omit<CleaningItem, 'id' | 'createdAt'>) => void;
  updateItem: (id: string, item: Partial<CleaningItem>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => CleaningItem | undefined;
  addPlan: (plan: Omit<CleaningPlan, 'id'>) => void;
  updatePlan: (id: string, plan: Partial<CleaningPlan>) => void;
  deletePlan: (id: string) => void;
  getPlanById: (id: string) => CleaningPlan | undefined;
  getPlansByItemId: (itemId: string) => CleaningPlan[];
  completeStep: (planId: string, stepId: string) => void;
  updateStepDate: (planId: string, stepId: string, date: string) => void;
  getItemStatusGroup: (item: CleaningItem) => ItemStatusGroup;
  getGroupedItems: () => Record<ItemStatusGroup, CleaningItem[]>;
  getYearlyCost: () => number;
  getMonthlyStats: () => { month: string; cost: number; count: number }[];
  getRoomStats: () => { room: string; itemCount: number; cleanCount: number; totalCost: number }[];
  getLongestUnwashedItems: () => CleaningItem[];
  getActivePlans: () => CleaningPlan[];
  simulateRainyDay: boolean;
  setSimulateRainyDay: (value: boolean) => void;
  rainyDates: string[];
  toggleRainyDate: (date: string) => void;
  isRainyDate: (date: string) => boolean;
}

const mockItems: CleaningItem[] = [
  {
    id: '1',
    name: '客厅窗帘',
    category: 'curtain',
    room: '客厅',
    material: '棉麻混纺',
    lastCleanDate: addDays(new Date(), -180),
    suggestedCycleDays: 180,
    canMachineWash: true,
    photos: [],
    notes: '需要小心拆卸，挂钩容易坏',
    createdAt: addDays(new Date(), -365),
  },
  {
    id: '2',
    name: '卧室地毯',
    category: 'carpet',
    room: '主卧',
    material: '羊毛',
    lastCleanDate: addDays(new Date(), -100),
    suggestedCycleDays: 90,
    canMachineWash: false,
    photos: [],
    notes: '只能干洗',
    createdAt: addDays(new Date(), -300),
  },
  {
    id: '3',
    name: '沙发套',
    category: 'sofaCover',
    room: '客厅',
    material: '科技布',
    lastCleanDate: addDays(new Date(), -15),
    suggestedCycleDays: 60,
    canMachineWash: true,
    photos: [],
    notes: '拆的时候记得拍照记录安装顺序',
    createdAt: addDays(new Date(), -200),
  },
  {
    id: '4',
    name: '主卧空调滤网',
    category: 'acFilter',
    room: '主卧',
    material: '滤网',
    lastCleanDate: addDays(new Date(), -45),
    suggestedCycleDays: 30,
    canMachineWash: false,
    photos: [],
    notes: '只能用水冲洗，不能搓',
    createdAt: addDays(new Date(), -150),
  },
  {
    id: '5',
    name: '儿童房窗帘',
    category: 'curtain',
    room: '儿童房',
    material: '纯棉',
    lastCleanDate: addDays(new Date(), -60),
    suggestedCycleDays: 120,
    canMachineWash: true,
    photos: [],
    notes: '孩子容易弄脏，可适当增加清洗频率',
    createdAt: addDays(new Date(), -100),
  },
];

const mockPlans: CleaningPlan[] = [
  {
    id: 'plan1',
    itemId: '2',
    status: 'pending',
    cost: 0,
    startDate: addDays(new Date(), 3),
    notes: '联系干洗店上门取件',
    steps: [
      {
        id: 's1',
        type: 'disassemble',
        scheduledDate: addDays(new Date(), 3),
        isCompleted: false,
      },
      {
        id: 's2',
        type: 'sendWash',
        scheduledDate: addDays(new Date(), 4),
        isCompleted: false,
      },
      {
        id: 's3',
        type: 'pickup',
        scheduledDate: addDays(new Date(), 10),
        isCompleted: false,
      },
      {
        id: 's4',
        type: 'dry',
        scheduledDate: addDays(new Date(), 10),
        isCompleted: false,
      },
      {
        id: 's5',
        type: 'install',
        scheduledDate: addDays(new Date(), 11),
        isCompleted: false,
      },
    ],
  },
  {
    id: 'plan2',
    itemId: '4',
    status: 'inProgress',
    cost: 0,
    startDate: addDays(new Date(), -1),
    notes: '自己动手洗',
    steps: [
      {
        id: 's1',
        type: 'disassemble',
        scheduledDate: addDays(new Date(), -1),
        completedDate: addDays(new Date(), -1),
        isCompleted: true,
      },
      {
        id: 's2',
        type: 'sendWash',
        scheduledDate: addDays(new Date(), -1),
        completedDate: addDays(new Date(), -1),
        isCompleted: true,
      },
      {
        id: 's3',
        type: 'pickup',
        scheduledDate: formatDate(new Date()),
        isCompleted: false,
      },
      {
        id: 's4',
        type: 'dry',
        scheduledDate: formatDate(new Date()),
        isCompleted: false,
      },
      {
        id: 's5',
        type: 'install',
        scheduledDate: addDays(new Date(), 1),
        isCompleted: false,
      },
    ],
  },
  {
    id: 'plan3',
    itemId: '3',
    status: 'drying',
    cost: 0,
    startDate: addDays(new Date(), -5),
    endDate: addDays(new Date(), -1),
    notes: '机洗后正在晾晒',
    steps: [
      {
        id: 's1',
        type: 'disassemble',
        scheduledDate: addDays(new Date(), -5),
        completedDate: addDays(new Date(), -5),
        isCompleted: true,
      },
      {
        id: 's2',
        type: 'sendWash',
        scheduledDate: addDays(new Date(), -5),
        completedDate: addDays(new Date(), -5),
        isCompleted: true,
      },
      {
        id: 's3',
        type: 'pickup',
        scheduledDate: addDays(new Date(), -3),
        completedDate: addDays(new Date(), -3),
        isCompleted: true,
      },
      {
        id: 's4',
        type: 'dry',
        scheduledDate: addDays(new Date(), -2),
        completedDate: addDays(new Date(), -2),
        isCompleted: true,
      },
      {
        id: 's5',
        type: 'install',
        scheduledDate: addDays(new Date(), 1),
        isCompleted: false,
      },
    ],
  },
];

const initRainyDates = () => {
  const dates: string[] = [];
  dates.push(formatDate(new Date()));
  dates.push(addDays(new Date(), 1));
  dates.push(addDays(new Date(), 3));
  return dates;
};

export const useCleaningStore = create<CleaningStore>()(
  persist(
    (set, get) => ({
      items: mockItems,
      plans: mockPlans,
      simulateRainyDay: false,
      rainyDates: initRainyDates(),

      setSimulateRainyDay: (value: boolean) => {
        set({ simulateRainyDay: value });
      },

      toggleRainyDate: (date) => {
        set((state) => {
          const hasDate = state.rainyDates.includes(date);
          return {
            rainyDates: hasDate
              ? state.rainyDates.filter((d) => d !== date)
              : [...state.rainyDates, date],
          };
        });
      },

      isRainyDate: (date) => {
        return get().rainyDates.includes(date);
      },

      addItem: (item) => {
        const newItem: CleaningItem = {
          ...item,
          id: generateId(),
          createdAt: formatDate(new Date()),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      updateItem: (id, item) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...item } : i)),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          plans: state.plans.filter((p) => p.itemId !== id),
        }));
      },

      getItemById: (id) => {
        return get().items.find((i) => i.id === id);
      },

      addPlan: (plan) => {
        const newPlan: CleaningPlan = {
          ...plan,
          id: generateId(),
        };
        set((state) => ({ plans: [...state.plans, newPlan] }));
      },

      updatePlan: (id, plan) => {
        set((state) => ({
          plans: state.plans.map((p) => (p.id === id ? { ...p, ...plan } : p)),
        }));
      },

      deletePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter((p) => p.id !== id),
        }));
      },

      getPlanById: (id) => {
        return get().plans.find((p) => p.id === id);
      },

      getPlansByItemId: (itemId) => {
        return get().plans.filter((p) => p.itemId === itemId);
      },

      completeStep: (planId, stepId) => {
        set((state) => {
          let updatedItems = state.items;

          const plans = state.plans.map((plan) => {
            if (plan.id !== planId) return plan;
            const originalStep = plan.steps.find((s) => s.id === stepId);
            const completedStepType = originalStep?.type;
            const steps = plan.steps.map((step) => {
              if (step.id !== stepId) return step;
              return {
                ...step,
                isCompleted: true,
                completedDate: formatDate(new Date()),
              };
            });

            const pickupStep = steps.find((s) => s.type === 'pickup');
            const dryStep = steps.find((s) => s.type === 'dry');
            const installStep = steps.find((s) => s.type === 'install');
            const allCompleted = steps.every((s) => s.isCompleted);

            let status: PlanStatus = plan.status;
            let endDate = plan.endDate;

            if (completedStepType === 'install') {
              status = 'completed';
              endDate = formatDate(new Date());
              updatedItems = state.items.map((item) => {
                if (item.id !== plan.itemId) return item;
                return { ...item, lastCleanDate: endDate! };
              });
            } else if (
              completedStepType === 'pickup' &&
              pickupStep &&
              pickupStep.isCompleted &&
              dryStep &&
              installStep &&
              !installStep.isCompleted
            ) {
              status = 'drying';
            } else if (dryStep && installStep && !installStep.isCompleted && dryStep.isCompleted) {
              status = 'drying';
            } else if (allCompleted) {
              status = 'completed';
              endDate = formatDate(new Date());
              updatedItems = state.items.map((item) => {
                if (item.id !== plan.itemId) return item;
                return { ...item, lastCleanDate: endDate! };
              });
            } else if (steps.some((s) => s.isCompleted)) {
              status = 'inProgress';
            }

            return {
              ...plan,
              steps,
              status,
              endDate,
            };
          });
          return { plans, items: updatedItems };
        });
      },

      updateStepDate: (planId, stepId, date) => {
        set((state) => ({
          plans: state.plans.map((plan) => {
            if (plan.id !== planId) return plan;
            return {
              ...plan,
              steps: plan.steps.map((step) =>
                step.id === stepId ? { ...step, scheduledDate: date } : step
              ),
            };
          }),
        }));
      },

      getItemStatusGroup: (item): ItemStatusGroup => {
        const plans = get().getPlansByItemId(item.id);
        const activePlan = plans.find((p) => p.status !== 'completed');

        if (activePlan) {
          if (activePlan.status === 'drying') return 'drying';
          if (activePlan.status === 'pending') return 'scheduled';
          if (activePlan.status === 'inProgress') return 'scheduled';
        }

        const daysUntil = getDaysUntilNextClean(
          item.lastCleanDate,
          item.suggestedCycleDays
        );
        if (daysUntil <= 7) {
          return 'needClean';
        }

        return 'completed';
      },

      getGroupedItems: () => {
        const items = get().items;
        const groups: Record<ItemStatusGroup, CleaningItem[]> = {
          needClean: [],
          scheduled: [],
          drying: [],
          completed: [],
        };

        items.forEach((item) => {
          const group = get().getItemStatusGroup(item);
          groups[group].push(item);
        });

        groups.needClean.sort((a, b) => {
          const daysA = getDaysUntilNextClean(a.lastCleanDate, a.suggestedCycleDays);
          const daysB = getDaysUntilNextClean(b.lastCleanDate, b.suggestedCycleDays);
          return daysA - daysB;
        });

        return groups;
      },

      getYearlyCost: () => {
        const plans = get().plans.filter(
          (p) => p.status === 'completed' && p.endDate && isThisYear(p.endDate)
        );
        return plans.reduce((sum, p) => sum + p.cost, 0);
      },

      getMonthlyStats: () => {
        const completedPlans = get().plans.filter(
          (p) => p.status === 'completed' && p.endDate && isThisYear(p.endDate)
        );

        const monthlyMap = new Map<string, { cost: number; count: number }>();

        for (let i = 0; i < 12; i++) {
          const month = `${new Date().getFullYear()}-${String(i + 1).padStart(2, '0')}`;
          monthlyMap.set(month, { cost: 0, count: 0 });
        }

        completedPlans.forEach((plan) => {
          if (!plan.endDate) return;
          const monthKey = getMonthKey(plan.endDate);
          const existing = monthlyMap.get(monthKey) || { cost: 0, count: 0 };
          monthlyMap.set(monthKey, {
            cost: existing.cost + plan.cost,
            count: existing.count + 1,
          });
        });

        return Array.from(monthlyMap.entries()).map(([month, data]) => ({
          month,
          cost: data.cost,
          count: data.count,
        }));
      },

      getRoomStats: () => {
        const items = get().items;
        const plans = get().plans.filter((p) => p.status === 'completed');
        const roomMap = new Map<
          string,
          { itemCount: number; cleanCount: number; totalCost: number }
        >();

        items.forEach((item) => {
          const existing = roomMap.get(item.room) || {
            itemCount: 0,
            cleanCount: 0,
            totalCost: 0,
          };
          roomMap.set(item.room, { ...existing, itemCount: existing.itemCount + 1 });
        });

        plans.forEach((plan) => {
          const item = get().getItemById(plan.itemId);
          if (!item) return;
          const existing = roomMap.get(item.room) || {
            itemCount: 0,
            cleanCount: 0,
            totalCost: 0,
          };
          roomMap.set(item.room, {
            ...existing,
            cleanCount: existing.cleanCount + 1,
            totalCost: existing.totalCost + plan.cost,
          });
        });

        return Array.from(roomMap.entries()).map(([room, data]) => ({
          room,
          ...data,
        }));
      },

      getLongestUnwashedItems: () => {
        const items = get().items.filter((item) => {
          const group = get().getItemStatusGroup(item);
          return group !== 'scheduled' && group !== 'drying';
        });
        return items.sort((a, b) => {
          const daysA = getDaysUntilNextClean(a.lastCleanDate, a.suggestedCycleDays);
          const daysB = getDaysUntilNextClean(b.lastCleanDate, b.suggestedCycleDays);
          return daysA - daysB;
        });
      },

      getActivePlans: () => {
        return get().plans.filter((p) => p.status !== 'completed');
      },
    }),
    {
      name: 'cleaning-store',
    }
  )
);
