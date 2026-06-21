import { create } from 'zustand';
import type { Scheme } from '@/types';
import { now, generateId } from '@/utils/helpers';

interface SchemeState {
  savedSchemes: Scheme[];
  compareIds: string[];
  compareMode: boolean;

  saveCurrentScheme: (scheme: Scheme) => Scheme;
  updateSavedScheme: (id: string, data: Partial<Scheme>) => void;
  deleteScheme: (id: string) => void;
  getScheme: (id: string) => Scheme | undefined;

  toggleCompareId: (id: string) => void;
  clearCompare: () => void;
  setCompareMode: (v: boolean) => void;
  getSchemesForCompare: () => Scheme[];
}

const STORAGE_KEY = 'choir_saved_schemes_v1';

function loadFromStorage(): Scheme[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveToStorage(list: Scheme[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {}
}

export const useSchemeStore = create<SchemeState>((set, get) => ({
  savedSchemes: loadFromStorage(),
  compareIds: [],
  compareMode: false,

  saveCurrentScheme: (scheme) => {
    const saved: Scheme = {
      ...scheme,
      id: generateId('sch'),
      createdAt: now(),
      updatedAt: now(),
    };

    set((state) => {
      const next = [...state.savedSchemes, saved];
      saveToStorage(next);
      return { savedSchemes: next };
    });

    return saved;
  },

  updateSavedScheme: (id, data) => {
    set((state) => {
      const next = state.savedSchemes.map((s) =>
        s.id === id ? { ...s, ...data, updatedAt: now() } : s
      );
      saveToStorage(next);
      return { savedSchemes: next };
    });
  },

  deleteScheme: (id) => {
    set((state) => {
      const next = state.savedSchemes.filter((s) => s.id !== id);
      saveToStorage(next);
      return {
        savedSchemes: next,
        compareIds: state.compareIds.filter((x) => x !== id),
      };
    });
  },

  getScheme: (id) => get().savedSchemes.find((s) => s.id === id),

  toggleCompareId: (id) => {
    set((state) => {
      const exists = state.compareIds.includes(id);
      let next = exists
        ? state.compareIds.filter((x) => x !== id)
        : [...state.compareIds, id];
      if (next.length > 4) next = next.slice(1);
      return { compareIds: next };
    });
  },

  clearCompare: () => set({ compareIds: [], compareMode: false }),

  setCompareMode: (v) => set({ compareMode: v }),

  getSchemesForCompare: () => {
    const state = get();
    return state.compareIds
      .map((id) => state.savedSchemes.find((s) => s.id === id))
      .filter((s): s is Scheme => Boolean(s));
  },
}));
