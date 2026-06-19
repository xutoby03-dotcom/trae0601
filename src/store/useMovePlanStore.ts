import { create } from 'zustand';
import type { MovePlan } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { initialMovePlans } from '@/utils/mockData';
import { formatDate, getDaysFromNow } from '@/utils/condition';

const STORAGE_KEY = 'movePlans';

interface MovePlanStore {
  movePlans: MovePlan[];
  addMovePlan: (plan: Omit<MovePlan, 'id' | 'createdAt'>) => void;
  updateMovePlan: (id: string, plan: Partial<MovePlan>) => void;
  deleteMovePlan: (id: string) => void;
  getUpcomingMoves: (days: number) => MovePlan[];
}

export const useMovePlanStore = create<MovePlanStore>((set, get) => ({
  movePlans: loadFromStorage<MovePlan[]>(STORAGE_KEY, initialMovePlans),

  addMovePlan: (plan) => {
    const newPlan: MovePlan = {
      ...plan,
      id: Date.now().toString(),
      createdAt: formatDate(new Date()),
    };
    const movePlans = [...get().movePlans, newPlan];
    set({ movePlans });
    saveToStorage(STORAGE_KEY, movePlans);
  },

  updateMovePlan: (id, plan) => {
    const movePlans = get().movePlans.map((p) =>
      p.id === id ? { ...p, ...plan } : p
    );
    set({ movePlans });
    saveToStorage(STORAGE_KEY, movePlans);
  },

  deleteMovePlan: (id) => {
    const movePlans = get().movePlans.filter((p) => p.id !== id);
    set({ movePlans });
    saveToStorage(STORAGE_KEY, movePlans);
  },

  getUpcomingMoves: (days) => {
    return get().movePlans
      .filter((p) => {
        const daysUntil = getDaysFromNow(p.moveDate);
        return daysUntil >= 0 && daysUntil <= days;
      })
      .sort((a, b) => new Date(a.moveDate).getTime() - new Date(b.moveDate).getTime());
  },
}));
