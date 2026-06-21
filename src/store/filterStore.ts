import { create } from 'zustand';
import type { FilterCriteria, FilterPreset } from '@/types';
import { PRESET_FILTERS } from '@/utils/presetFilters';

interface FilterState {
  criteria: FilterCriteria;
  activePresetId: string | null;
  setCriteria: (criteria: Partial<FilterCriteria>) => void;
  resetCriteria: () => void;
  applyPreset: (presetId: string) => void;
  clearPreset: () => void;
  getPresets: () => FilterPreset[];
}

export const useFilterStore = create<FilterState>((set, get) => ({
  criteria: {},
  activePresetId: null,

  setCriteria: (criteria) => {
    set({ 
      criteria: { ...get().criteria, ...criteria },
      activePresetId: null,
    });
  },

  resetCriteria: () => {
    set({ criteria: {}, activePresetId: null });
  },

  applyPreset: (presetId) => {
    const preset = PRESET_FILTERS.find((p) => p.id === presetId);
    if (preset) {
      set({ criteria: { ...preset.filters }, activePresetId: presetId });
    }
  },

  clearPreset: () => {
    set({ activePresetId: null });
  },

  getPresets: () => PRESET_FILTERS,
}));
