import { create } from 'zustand';
import type { Child, Vaccine, VaccineStatus, Statistics, PerChildStat, MonthlyDistribution } from '@/types';
import { generateId } from '@/utils/id';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { mockChildren, mockVaccines } from '@/data/mockData';
import { isOverdue, getMonthKey, isUpcoming, daysFromToday } from '@/utils/date';

interface AppState {
  children: Child[];
  vaccines: Vaccine[];

  initialized: boolean;

  initialize: () => void;
  saveState: () => void;

  addChild: (child: Omit<Child, 'id' | 'createdAt'>) => void;
  updateChild: (id: string, data: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  getChildById: (id: string) => Child | undefined;

  addVaccine: (vaccine: Omit<Vaccine, 'id' | 'createdAt' | 'delayedCount' | 'status'>) => void;
  updateVaccine: (id: string, data: Partial<Vaccine>) => void;
  deleteVaccine: (id: string) => void;
  getVaccinesByChildId: (childId: string) => Vaccine[];

  appointVaccine: (
    id: string,
    data: {
      appointmentTime: string;
      appointmentLocation: string;
      queueNumber?: string;
      appointmentRemark?: string;
    },
  ) => void;
  completeVaccine: (
    id: string,
    data: {
      actualDate: string;
      proofPhoto?: string;
      reaction?: string;
    },
  ) => void;
  delayVaccine: (
    id: string,
    data: {
      reason: string;
      suggestedDate: string;
      latestDate: string;
    },
  ) => void;

  updateVaccineStatus: () => void;
  getStatistics: () => Statistics;

  resetWithMock: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  children: [],
  vaccines: [],
  initialized: false,

  initialize: () => {
    const { initialized } = get();
    if (initialized) return;

    const storedChildren = loadFromStorage<Child[]>('children', []);
    const storedVaccines = loadFromStorage<Vaccine[]>('vaccines', []);

    if (storedChildren.length > 0) {
      set({ children: storedChildren, vaccines: storedVaccines, initialized: true });
    } else {
      const now = new Date().toISOString();
      const newChildren: Child[] = mockChildren.map((c, i) => ({
        ...c,
        id: `CHILD-${i + 1}`,
        createdAt: now,
      }));
      const newVaccines: Vaccine[] = mockVaccines.map((v, i) => ({
        ...v,
        id: `VAC-${i + 1}`,
        createdAt: now,
      })).map((v) => ({
        ...v,
        status: (isOverdue(v.latestDate, v.status) ? 'overdue' : v.status) as VaccineStatus,
      }));
      set({ children: newChildren, vaccines: newVaccines, initialized: true });
      get().saveState();
    }

    setTimeout(() => get().updateVaccineStatus(), 0);
  },

  saveState: () => {
    const { children, vaccines } = get();
    saveToStorage('children', children);
    saveToStorage('vaccines', vaccines);
  },

  addChild: (child) => {
    const newChild: Child = {
      ...child,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ children: [...s.children, newChild] }));
    get().saveState();
  },

  updateChild: (id, data) => {
    set((s) => ({
      children: s.children.map((c) => (c.id === id ? { ...c, ...data } : c)),
    }));
    get().saveState();
  },

  deleteChild: (id) => {
    set((s) => ({
      children: s.children.filter((c) => c.id !== id),
      vaccines: s.vaccines.filter((v) => v.childId !== id),
    }));
    get().saveState();
  },

  getChildById: (id) => {
    return get().children.find((c) => c.id === id);
  },

  addVaccine: (vaccine) => {
    const status = isOverdue(vaccine.latestDate, 'pending') ? 'overdue' : 'pending';
    const newVaccine: Vaccine = {
      ...vaccine,
      id: generateId(),
      delayedCount: 0,
      status: status as VaccineStatus,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ vaccines: [...s.vaccines, newVaccine] }));
    get().saveState();
  },

  updateVaccine: (id, data) => {
    set((s) => ({
      vaccines: s.vaccines.map((v) => {
        if (v.id !== id) return v;
        const updated = { ...v, ...data };
        if (data.latestDate && data.status !== 'completed' && data.status !== 'appointed') {
          updated.status = (isOverdue(updated.latestDate, updated.status) ? 'overdue' : updated.status) as VaccineStatus;
        }
        return updated;
      }),
    }));
    get().saveState();
  },

  deleteVaccine: (id) => {
    set((s) => ({ vaccines: s.vaccines.filter((v) => v.id !== id) }));
    get().saveState();
  },

  getVaccinesByChildId: (childId) => {
    return get().vaccines
      .filter((v) => v.childId === childId)
      .sort((a, b) => new Date(a.suggestedDate).getTime() - new Date(b.suggestedDate).getTime());
  },

  appointVaccine: (id, data) => {
    get().updateVaccine(id, {
      ...data,
      status: 'appointed',
    });
  },

  completeVaccine: (id, data) => {
    get().updateVaccine(id, {
      ...data,
      status: 'completed',
    });
  },

  delayVaccine: (id, data) => {
    const v = get().vaccines.find((x) => x.id === id);
    if (!v) return;
    const originalSuggestedDate = v.originalSuggestedDate || v.suggestedDate;
    const originalLatestDate = v.originalLatestDate || v.latestDate;
    get().updateVaccine(id, {
      delayedReason: data.reason,
      delayedCount: v.delayedCount + 1,
      suggestedDate: data.suggestedDate,
      latestDate: data.latestDate,
      originalSuggestedDate,
      originalLatestDate,
      status: 'pending',
    });
  },

  updateVaccineStatus: () => {
    set((s) => ({
      vaccines: s.vaccines.map((v) => {
        if (v.status === 'completed' || v.status === 'appointed') return v;
        const newStatus = isOverdue(v.latestDate, v.status) ? 'overdue' : 'pending';
        if (newStatus !== v.status) {
          return { ...v, status: newStatus as VaccineStatus };
        }
        return v;
      }),
    }));
    get().saveState();
  },

  getStatistics: () => {
    const { children, vaccines } = get();

    const totalVaccines = vaccines.length;
    const pendingVaccines = vaccines.filter((v) => v.status === 'pending').length;
    const completedVaccines = vaccines.filter((v) => v.status === 'completed').length;
    const overdueVaccines = vaccines.filter((v) => v.status === 'overdue').length;

    const upcomingVaccines = vaccines
      .filter((v) => v.status !== 'completed' && isUpcoming(v.suggestedDate, 7))
      .sort((a, b) => daysFromToday(a.suggestedDate) - daysFromToday(b.suggestedDate));

    const monthMap = new Map<string, number>();
    vaccines.forEach((v) => {
      const mk = getMonthKey(v.status === 'completed' ? (v.actualDate || v.suggestedDate) : v.suggestedDate);
      if (mk) monthMap.set(mk, (monthMap.get(mk) || 0) + 1);
    });
    const monthlyDistribution: MonthlyDistribution[] = Array.from(monthMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => (a.month < b.month ? -1 : 1));

    const busiestMonth =
      monthlyDistribution.length > 0
        ? monthlyDistribution.reduce((a, b) => (a.count > b.count ? a : b)).month
        : '';

    const delayedVaccines = vaccines
      .filter((v) => v.delayedCount > 0)
      .sort((a, b) => b.delayedCount - a.delayedCount);

    const perChildStats: PerChildStat[] = children.map((c) => {
      const cvs = vaccines.filter((v) => v.childId === c.id);
      return {
        childId: c.id,
        childName: c.name,
        total: cvs.length,
        completed: cvs.filter((v) => v.status === 'completed').length,
        pending: cvs.filter((v) => v.status === 'pending' || v.status === 'appointed').length,
        overdue: cvs.filter((v) => v.status === 'overdue').length,
      };
    });

    return {
      totalChildren: children.length,
      totalVaccines,
      pendingVaccines,
      completedVaccines,
      overdueVaccines,
      upcomingVaccines,
      monthlyDistribution,
      delayedVaccines,
      busiestMonth,
      perChildStats,
    };
  },

  resetWithMock: () => {
    const now = new Date().toISOString();
    const newChildren: Child[] = mockChildren.map((c, i) => ({
      ...c,
      id: `CHILD-${i + 1}`,
      createdAt: now,
    }));
    const newVaccines: Vaccine[] = mockVaccines.map((v, i) => ({
      ...v,
      id: `VAC-${i + 1}`,
      createdAt: now,
    })).map((v) => ({
      ...v,
      status: (isOverdue(v.latestDate, v.status) ? 'overdue' : v.status) as VaccineStatus,
    }));
    set({ children: newChildren, vaccines: newVaccines, initialized: true });
    get().saveState();
  },
}));
