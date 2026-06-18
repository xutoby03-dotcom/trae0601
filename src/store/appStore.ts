import { create } from 'zustand';
import type { Package, Locker, StatsSummary } from 'shared/types.js';

interface AppState {
  packages: (Package & { isOverdue: boolean })[];
  lockers: Locker[];
  summary: StatsSummary | null;
  loading: boolean;
  error: string | null;

  setPackages: (p: (Package & { isOverdue: boolean })[]) => void;
  setLockers: (l: Locker[]) => void;
  setSummary: (s: StatsSummary) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;

  addPackage: (p: Package) => void;
  updatePackage: (p: Package) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  packages: [],
  lockers: [],
  summary: null,
  loading: false,
  error: null,

  setPackages: (p) => set({ packages: p }),
  setLockers: (l) => set({ lockers: l }),
  setSummary: (s) => set({ summary: s }),
  setLoading: (v) => set({ loading: v }),
  setError: (e) => set({ error: e }),

  addPackage: (p) => set({
    packages: [{ ...p, isOverdue: false }, ...get().packages],
  }),

  updatePackage: (p) => set({
    packages: get().packages.map(x =>
      x.id === p.id ? { ...p, isOverdue: false } : x
    ),
  }),
}));
