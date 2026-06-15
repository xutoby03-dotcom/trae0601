import { create } from 'zustand';
import { CoffeeRecord, FilterState, RoastLevel, NegativeReason } from '@/types';
import { loadRecords, saveRecords, generateId } from '@/utils/storage';

interface CoffeeStore {
  records: CoffeeRecord[];
  filters: FilterState;
  addRecord: (data: Omit<CoffeeRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecord: (id: string, data: Partial<CoffeeRecord>) => void;
  deleteRecord: (id: string) => void;
  reviseRecord: (
    parentId: string,
    data: Partial<CoffeeRecord> & { negativeReason: NegativeReason; adjustmentNote: string }
  ) => void;
  setTodayRecommended: (id: string) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  getFilteredRecords: () => CoffeeRecord[];
  getTodayRecommended: () => CoffeeRecord | null;
  getLastFailure: () => CoffeeRecord | null;
  getConsecutiveNegativeCount: (beanName: string, batchDate: string) => number;
  needsCalibration: () => { beanName: string; batchDate: string; count: number } | null;
  getRecordById: (id: string) => CoffeeRecord | undefined;
}

export const useCoffeeStore = create<CoffeeStore>((set, get) => ({
  records: loadRecords(),
  filters: {
    beanName: '',
    roastLevel: 'all',
    grinder: '',
    dripper: '',
  },

  addRecord: (data) => {
    const now = new Date().toISOString();
    const newRecord: CoffeeRecord = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    if (newRecord.isTodayRecommended) {
      const records = get().records.map((r) => ({
        ...r,
        isTodayRecommended: false,
      }));
      set({ records: [...records, newRecord] });
    } else {
      set((state) => ({ records: [...state.records, newRecord] }));
    }
    saveRecords(get().records);
  },

  updateRecord: (id, data) => {
    const now = new Date().toISOString();
    if (data.isTodayRecommended) {
      set((state) => ({
        records: state.records.map((r) =>
          r.id === id ? { ...r, ...data, updatedAt: now } : { ...r, isTodayRecommended: false, updatedAt: r.updatedAt }
        ),
      }));
    } else {
      set((state) => ({
        records: state.records.map((r) => (r.id === id ? { ...r, ...data, updatedAt: now } : r)),
      }));
    }
    saveRecords(get().records);
  },

  deleteRecord: (id) => {
    set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
    saveRecords(get().records);
  },

  reviseRecord: (parentId, data) => {
    const parent = get().records.find((r) => r.id === parentId);
    if (!parent) return;
    const now = new Date().toISOString();
    const newRecord: CoffeeRecord = {
      ...parent,
      ...data,
      id: generateId(),
      parentId,
      isTodayRecommended: false,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ records: [...state.records, newRecord] }));
    saveRecords(get().records);
  },

  setTodayRecommended: (id) => {
    const now = new Date().toISOString();
    set((state) => ({
      records: state.records.map((r) => ({
        ...r,
        isTodayRecommended: r.id === id,
        updatedAt: r.id === id ? now : r.updatedAt,
      })),
    }));
    saveRecords(get().records);
  },

  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  getFilteredRecords: () => {
    const { records, filters } = get();
    return records
      .filter((r) => !filters.beanName || r.beanName.includes(filters.beanName))
      .filter((r) => filters.roastLevel === 'all' || r.roastLevel === filters.roastLevel)
      .filter((r) => !filters.grinder || r.grinder === filters.grinder)
      .filter((r) => !filters.dripper || r.dripper === filters.dripper)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  getTodayRecommended: () => {
    return get().records.find((r) => r.isTodayRecommended) || null;
  },

  getLastFailure: () => {
    const failures = get()
      .records.filter((r) => r.negativeReason !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return failures[0] || null;
  },

  getConsecutiveNegativeCount: (beanName, batchDate) => {
    const sameBatch = get()
      .records.filter((r) => r.beanName === beanName && r.batchDate === batchDate)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    let count = 0;
    for (const r of sameBatch) {
      if (r.negativeReason !== null) {
        count++;
      } else {
        break;
      }
    }
    return count;
  },

  needsCalibration: () => {
    const uniqueBatches = new Map<string, { beanName: string; batchDate: string }>();
    for (const r of get().records) {
      const key = `${r.beanName}-${r.batchDate}`;
      if (!uniqueBatches.has(key)) {
        uniqueBatches.set(key, { beanName: r.beanName, batchDate: r.batchDate });
      }
    }
    for (const { beanName, batchDate } of uniqueBatches.values()) {
      const count = get().getConsecutiveNegativeCount(beanName, batchDate);
      if (count >= 3) {
        return { beanName, batchDate, count };
      }
    }
    return null;
  },

  getRecordById: (id) => {
    return get().records.find((r) => r.id === id);
  },
}));
