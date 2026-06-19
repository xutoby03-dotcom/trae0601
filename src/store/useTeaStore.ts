import { create } from 'zustand';
import type { Teapot, TeaBatch, InspectionRecord } from '@/types';
import { storage } from '@/utils/storage';
import { mockTeapots, mockBatches, mockInspections } from '@/data/mockData';

interface TeaStore {
  teapots: Teapot[];
  batches: TeaBatch[];
  inspections: InspectionRecord[];

  initData: () => void;

  addTeapot: (teapot: Omit<Teapot, 'id' | 'createdAt'>) => void;
  updateTeapot: (id: string, teapot: Partial<Teapot>) => void;
  deleteTeapot: (id: string) => void;

  addBatch: (batch: Omit<TeaBatch, 'id' | 'createdAt'>) => void;
  updateBatch: (id: string, batch: Partial<TeaBatch>) => void;
  deleteBatch: (id: string) => void;

  addInspection: (inspection: Omit<InspectionRecord, 'id'>) => void;
  getInspectionsByBatch: (batchId: string) => InspectionRecord[];
  getBatchesByTeapot: (teapotId: string) => TeaBatch[];

  checkBatchAbnormal: (batchId: string) => { isAbnormal: boolean; reason: string };
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useTeaStore = create<TeaStore>((set, get) => ({
  teapots: [],
  batches: [],
  inspections: [],

  initData: () => {
    const storedTeapots = storage.teapots.get() as Teapot[];
    const storedBatches = storage.batches.get() as TeaBatch[];
    const storedInspections = storage.inspections.get() as InspectionRecord[];

    if (storedTeapots.length === 0) {
      storage.teapots.set(mockTeapots);
      storage.batches.set(mockBatches);
      storage.inspections.set(mockInspections);
      set({
        teapots: mockTeapots,
        batches: mockBatches,
        inspections: mockInspections,
      });
    } else {
      set({
        teapots: storedTeapots,
        batches: storedBatches,
        inspections: storedInspections,
      });
    }
  },

  addTeapot: (teapot) => {
    const newTeapot: Teapot = {
      ...teapot,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const teapots = [...get().teapots, newTeapot];
    set({ teapots });
    storage.teapots.set(teapots);
  },

  updateTeapot: (id, teapot) => {
    const teapots = get().teapots.map((t) =>
      t.id === id ? { ...t, ...teapot } : t
    );
    set({ teapots });
    storage.teapots.set(teapots);
  },

  deleteTeapot: (id) => {
    const teapots = get().teapots.filter((t) => t.id !== id);
    set({ teapots });
    storage.teapots.set(teapots);
  },

  addBatch: (batch) => {
    const newBatch: TeaBatch = {
      ...batch,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const batches = [newBatch, ...get().batches];
    set({ batches });
    storage.batches.set(batches);
  },

  updateBatch: (id, batch) => {
    const batches = get().batches.map((b) =>
      b.id === id ? { ...b, ...batch } : b
    );
    set({ batches });
    storage.batches.set(batches);
  },

  deleteBatch: (id) => {
    const batches = get().batches.filter((b) => b.id !== id);
    set({ batches });
    storage.batches.set(batches);
  },

  addInspection: (inspection) => {
    const newInspection: InspectionRecord = {
      ...inspection,
      id: generateId(),
    };
    const inspections = [newInspection, ...get().inspections];
    set({ inspections });
    storage.inspections.set(inspections);
  },

  getInspectionsByBatch: (batchId) => {
    return get().inspections
      .filter((i) => i.batchId === batchId)
      .sort((a, b) => new Date(b.inspectTime).getTime() - new Date(a.inspectTime).getTime());
  },

  getBatchesByTeapot: (teapotId) => {
    return get().batches
      .filter((b) => b.teapotId === teapotId)
      .sort((a, b) => new Date(b.brewTime).getTime() - new Date(a.brewTime).getTime());
  },

  checkBatchAbnormal: (batchId) => {
    const batch = get().batches.find((b) => b.id === batchId);
    const teapot = batch ? get().teapots.find((t) => t.id === batch.teapotId) : null;

    if (!batch || !teapot) {
      return { isAbnormal: false, reason: '' };
    }

    const reasons: string[] = [];
    const now = new Date();
    const discardTime = new Date(batch.discardTime);

    if (now > discardTime && batch.status === 'active') {
      reasons.push('已超过售卖时限');
    }

    const inspections = get().getInspectionsByBatch(batchId);
    if (inspections.length > 0) {
      const latestTemp = inspections[0].temperature;
      if (latestTemp < teapot.targetTempMin) {
        reasons.push('温度低于保温目标');
      } else if (latestTemp > teapot.targetTempMax) {
        reasons.push('温度高于保温目标');
      }
    }

    return {
      isAbnormal: reasons.length > 0,
      reason: reasons.join('、'),
    };
  },
}));
