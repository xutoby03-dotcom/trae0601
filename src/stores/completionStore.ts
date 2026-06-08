import { create } from 'zustand';
import type { Completion, Photo, SkipRecord } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { generateId } from '@/utils/id';

const COMPLETIONS_KEY = 'family-fun-completions';
const SKIPS_KEY = 'family-fun-skips';

interface CompletionStore {
  completions: Completion[];
  skipRecords: SkipRecord[];

  addCompletion: (completion: Omit<Completion, 'id'>) => string;
  updateCompletion: (id: string, updates: Partial<Completion>) => void;
  getCompletionsByTask: (taskId: string) => Completion[];
  getCompletionsByMonth: (year: number, month: number) => Completion[];

  addSkipRecord: (taskId: string, reason: SkipRecord['reason'], customReason?: string) => void;
}

export const useCompletionStore = create<CompletionStore>((set, get) => ({
  completions: loadFromStorage<Completion[]>(COMPLETIONS_KEY, []),
  skipRecords: loadFromStorage<SkipRecord[]>(SKIPS_KEY, []),

  addCompletion: (completionData) => {
    const id = generateId();
    set((state) => {
      const completions = [...state.completions, { ...completionData, id }];
      saveToStorage(COMPLETIONS_KEY, completions);
      return { completions };
    });
    return id;
  },

  updateCompletion: (id, updates) => {
    set((state) => {
      const completions = state.completions.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      );
      saveToStorage(COMPLETIONS_KEY, completions);
      return { completions };
    });
  },

  getCompletionsByTask: (taskId) => {
    return get().completions.filter((c) => c.taskId === taskId);
  },

  getCompletionsByMonth: (year, month) => {
    return get().completions.filter((c) => {
      const d = new Date(c.completedAt);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  addSkipRecord: (taskId, reason, customReason) => {
    set((state) => {
      const skipRecords = [
        ...state.skipRecords,
        { id: generateId(), taskId, reason, customReason, skippedAt: Date.now() },
      ];
      saveToStorage(SKIPS_KEY, skipRecords);
      return { skipRecords };
    });
  },
}));
