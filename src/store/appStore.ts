import { create } from "zustand";
import type { TestSample, FilterState } from "@/types";

interface AppState {
  filters: FilterState;
  selectedSample: TestSample | null;
  showDetail: boolean;
  showEvolution: boolean;
  evolutionChainId: string | null;
  setFilters: (f: Partial<FilterState>) => void;
  resetFilters: () => void;
  selectSample: (sample: TestSample | null) => void;
  openDetail: (sample: TestSample) => void;
  closeDetail: () => void;
  openEvolution: (chainId: string) => void;
  closeEvolution: () => void;
}

const defaultFilters: FilterState = {
  colorFamily: "全部",
  temperatureRange: null,
  clayType: "全部",
  atmosphere: "全部",
  kilnPosition: "全部",
  glazeName: "全部",
  searchKeyword: "",
};

export const useAppStore = create<AppState>((set) => ({
  filters: defaultFilters,
  selectedSample: null,
  showDetail: false,
  showEvolution: false,
  evolutionChainId: null,
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: defaultFilters }),
  selectSample: (sample) => set({ selectedSample: sample }),
  openDetail: (sample) =>
    set({ selectedSample: sample, showDetail: true, showEvolution: false }),
  closeDetail: () => set({ showDetail: false }),
  openEvolution: (chainId) =>
    set({ evolutionChainId: chainId, showEvolution: true }),
  closeEvolution: () => set({ showEvolution: false }),
}));
