import { create } from 'zustand';
import type { FilterState } from '@/types';

interface FilterStore {
  filter: FilterState;
  setFilter: (updates: Partial<FilterState>) => void;
  clearFilter: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  filter: {},

  setFilter: (updates) => {
    set((state) => ({
      filter: { ...state.filter, ...updates },
    }));
  },

  clearFilter: () => {
    set({ filter: {} });
  },
}));
