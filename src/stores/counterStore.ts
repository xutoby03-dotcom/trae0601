import { create } from 'zustand';
import type { CounterWithGuides, Counter, Guide } from '@/types/index';
import { storage, delay, generateId } from '@/utils/storage';
import { mockCounters, mockGuides } from '@/mock/data';

interface CounterStoreState {
  counters: CounterWithGuides[];
  currentCounter: CounterWithGuides | null;
  loading: boolean;
  fetchCounters: () => Promise<void>;
  getCounterById: (id: string) => CounterWithGuides | undefined;
  addCounter: (counter: Omit<Counter, 'id' | 'createdAt'>, guides?: Omit<Guide, 'id'>[]) => Promise<void>;
  updateCounter: (id: string, updates: Partial<Counter>) => Promise<void>;
  deleteCounter: (id: string) => Promise<void>;
  getCounterGuides: (counterId: string) => Guide[];
}

const STORAGE_KEY = 'counters';

const loadInitialCounters = (): CounterWithGuides[] => {
  if (storage.has(STORAGE_KEY)) {
    return storage.get<CounterWithGuides[]>(STORAGE_KEY, []);
  }
  storage.set(STORAGE_KEY, mockCounters);
  return mockCounters;
};

export const useCounterStore = create<CounterStoreState>((set, get) => ({
  counters: loadInitialCounters(),
  currentCounter: null,
  loading: false,

  fetchCounters: async () => {
    set({ loading: true });
    await delay();
    const data = storage.has(STORAGE_KEY)
      ? storage.get<CounterWithGuides[]>(STORAGE_KEY, [])
      : mockCounters;
    set({ counters: data, loading: false });
  },

  getCounterById: (id: string) => {
    return get().counters.find((c) => c.id === id);
  },

  addCounter: async (counter, guides = []) => {
    set({ loading: true });
    await delay();
    const newCounterId = generateId();
    const newGuides: Guide[] = guides.map((g) => ({
      ...g,
      id: generateId(),
      counterId: newCounterId,
    }));
    const newCounter: CounterWithGuides = {
      ...counter,
      id: newCounterId,
      createdAt: new Date().toISOString(),
      guides: newGuides,
    };
    const updated = [...get().counters, newCounter];
    storage.set(STORAGE_KEY, updated);
    set({ counters: updated, loading: false });
  },

  updateCounter: async (id, updates) => {
    set({ loading: true });
    await delay();
    const updated = get().counters.map((c) => {
      if (c.id === id) {
        return { ...c, ...updates };
      }
      return c;
    });
    storage.set(STORAGE_KEY, updated);
    const current = get().currentCounter;
    set({
      counters: updated,
      currentCounter: current && current.id === id ? updated.find((c) => c.id === id) || null : current,
      loading: false,
    });
  },

  deleteCounter: async (id) => {
    set({ loading: true });
    await delay();
    const updated = get().counters.filter((c) => c.id !== id);
    storage.set(STORAGE_KEY, updated);
    const current = get().currentCounter;
    set({
      counters: updated,
      currentCounter: current && current.id === id ? null : current,
      loading: false,
    });
  },

  getCounterGuides: (counterId) => {
    const counter = get().counters.find((c) => c.id === counterId);
    if (counter) {
      return counter.guides;
    }
    return mockGuides.filter((g) => g.counterId === counterId);
  },
}));
