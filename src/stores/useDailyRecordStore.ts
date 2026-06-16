import { create } from 'zustand';
import { db } from '@/db';
import type { DailyRecord, DailyRecordStatus, CloseChecklist } from '@/types';
import { generateId } from '@/utils/id';

interface DailyRecordFilters {
  startDate?: string;
  endDate?: string;
  status?: DailyRecordStatus;
  userId?: string;
}

interface DailyRecordState {
  records: DailyRecord[];
  filteredRecords: DailyRecord[];
  currentRecord: DailyRecord | null;
  filters: DailyRecordFilters;
  loading: boolean;
  error: string | null;
}

interface DailyRecordActions {
  fetchRecords: () => Promise<void>;
  getRecordsByDateRange: (startDate: string, endDate: string) => Promise<DailyRecord[]>;
  getRecordByDate: (date: string) => Promise<DailyRecord | null>;
  openBooth: (userId: string, furnitureIds: string[], weatherInfo?: DailyRecord['weatherInfo']) => Promise<DailyRecord>;
  closeBooth: (recordId: string, userId: string, checklist: CloseChecklist, notes?: string) => Promise<void>;
  updateRecord: (id: string, updates: Partial<DailyRecord>) => Promise<void>;
  getTodayRecord: () => DailyRecord | null;
  setFilters: (filters: Partial<DailyRecordFilters>) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  clearError: () => void;
}

export type DailyRecordStore = DailyRecordState & DailyRecordActions;

const defaultFilters: DailyRecordFilters = {
  startDate: undefined,
  endDate: undefined,
  status: undefined,
  userId: undefined,
};

const defaultChecklist: CloseChecklist = {
  wiped: false,
  folded: false,
  locked: false,
  covered: false,
  returned: false,
};

export const useDailyRecordStore = create<DailyRecordStore>((set, get) => ({
  records: [],
  filteredRecords: [],
  currentRecord: null,
  filters: defaultFilters,
  loading: false,
  error: null,

  fetchRecords: async () => {
    set({ loading: true, error: null });
    try {
      const records = await db.dailyRecords.orderBy('createdAt').reverse().toArray();
      set({ records, filteredRecords: records, loading: false });
      get().applyFilters();
      
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = records.find(r => r.recordDate === today);
      set({ currentRecord: todayRecord || null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取记录列表失败', loading: false });
    }
  },

  getRecordsByDateRange: async (startDate, endDate) => {
    try {
      return await db.dailyRecords
        .where('recordDate')
        .between(startDate, endDate, true, true)
        .reverse()
        .toArray();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '查询记录失败' });
      throw error;
    }
  },

  getRecordByDate: async (date) => {
    try {
      const record = await db.dailyRecords.where('recordDate').equals(date).first();
      return record || null;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '查询记录失败' });
      throw error;
    }
  },

  openBooth: async (userId, furnitureIds, weatherInfo) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      const existingRecord = await db.dailyRecords.where('recordDate').equals(today).first();
      if (existingRecord) {
        throw new Error('今日已开摊');
      }

      const newRecord: DailyRecord = {
        id: generateId('record'),
        recordDate: today,
        openUserId: userId,
        openTime: now.toISOString(),
        furnitureCount: furnitureIds.length,
        furnitureIds,
        closeChecklist: defaultChecklist,
        status: 'in-progress',
        weatherInfo,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      await db.dailyRecords.add(newRecord);
      
      const records = await db.dailyRecords.orderBy('createdAt').reverse().toArray();
      set({ records, currentRecord: newRecord, loading: false });
      get().applyFilters();
      
      return newRecord;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '开摊失败', loading: false });
      throw error;
    }
  },

  closeBooth: async (recordId, userId, checklist, notes) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      const allChecked = Object.values(checklist).every(v => v === true);
      
      await db.dailyRecords.update(recordId, {
        closeUserId: userId,
        closeTime: now,
        closeChecklist: checklist,
        status: allChecked ? 'completed' : 'abnormal',
        notes,
        updatedAt: now,
      });

      const records = await db.dailyRecords.orderBy('createdAt').reverse().toArray();
      const updatedRecord = records.find(r => r.id === recordId);
      set({ records, currentRecord: updatedRecord || null, loading: false });
      get().applyFilters();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '收摊失败', loading: false });
      throw error;
    }
  },

  updateRecord: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      await db.dailyRecords.update(id, { ...updates, updatedAt: now });
      
      const records = await db.dailyRecords.orderBy('createdAt').reverse().toArray();
      const { currentRecord } = get();
      const updatedRecord = records.find(r => r.id === id);
      
      set({ 
        records, 
        currentRecord: currentRecord?.id === id ? updatedRecord || null : currentRecord,
        loading: false 
      });
      get().applyFilters();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '更新记录失败', loading: false });
      throw error;
    }
  },

  getTodayRecord: () => {
    const today = new Date().toISOString().split('T')[0];
    return get().records.find(r => r.recordDate === today) || null;
  },

  setFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().applyFilters();
  },

  clearFilters: () => {
    set({ filters: defaultFilters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { records, filters } = get();
    let filtered = [...records];

    if (filters.startDate) {
      filtered = filtered.filter(r => r.recordDate >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter(r => r.recordDate <= filters.endDate!);
    }
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    if (filters.userId) {
      filtered = filtered.filter(r => 
        r.openUserId === filters.userId || r.closeUserId === filters.userId
      );
    }

    set({ filteredRecords: filtered });
  },

  clearError: () => {
    set({ error: null });
  },
}));
