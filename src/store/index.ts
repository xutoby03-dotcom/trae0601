import { create } from 'zustand';
import type { Sample, Feedback } from '@/types';
import { getSamples, saveSamples, getFeedbacks, saveFeedbacks } from '@/utils/storage';
import { formatDate, generateId } from '@/utils/format';

interface StoreState {
  samples: Sample[];
  feedbacks: Feedback[];
  initData: () => void;
  addSample: (data: Omit<Sample, 'id' | 'createdAt' | 'updatedAt'>) => Sample;
  updateSample: (id: string, data: Partial<Sample>) => void;
  deleteSample: (id: string) => void;
  addFeedback: (data: Omit<Feedback, 'id' | 'createdAt'>) => Feedback;
  deleteFeedback: (id: string) => void;
  updateProductionStatus: (id: string, status: Sample['productionStatus'], note?: string) => void;
  getSampleById: (id: string) => Sample | undefined;
  getFeedbacksBySample: (sampleId: string) => Feedback[];
}

export const useStore = create<StoreState>((set, get) => ({
  samples: [],
  feedbacks: [],

  initData: () => {
    set({
      samples: getSamples(),
      feedbacks: getFeedbacks()
    });
  },

  addSample: (data) => {
    const now = formatDate(new Date());
    const newSample: Sample = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    };
    const samples = [...get().samples, newSample];
    saveSamples(samples);
    set({ samples });
    return newSample;
  },

  updateSample: (id, data) => {
    const samples = get().samples.map(s =>
      s.id === id
        ? { ...s, ...data, updatedAt: formatDate(new Date()) }
        : s
    );
    saveSamples(samples);
    set({ samples });
  },

  deleteSample: (id) => {
    const samples = get().samples.filter(s => s.id !== id);
    const feedbacks = get().feedbacks.filter(f => f.sampleId !== id);
    saveSamples(samples);
    saveFeedbacks(feedbacks);
    set({ samples, feedbacks });
  },

  addFeedback: (data) => {
    const newFeedback: Feedback = {
      ...data,
      id: generateId(),
      createdAt: formatDate(new Date())
    };
    const feedbacks = [...get().feedbacks, newFeedback];
    saveFeedbacks(feedbacks);
    set({ feedbacks });
    return newFeedback;
  },

  deleteFeedback: (id) => {
    const feedbacks = get().feedbacks.filter(f => f.id !== id);
    saveFeedbacks(feedbacks);
    set({ feedbacks });
  },

  updateProductionStatus: (id, status, note) => {
    const samples = get().samples.map(s =>
      s.id === id
        ? {
            ...s,
            productionStatus: status,
            productionNote: note,
            updatedAt: formatDate(new Date())
          }
        : s
    );
    saveSamples(samples);
    set({ samples });
  },

  getSampleById: (id) => {
    return get().samples.find(s => s.id === id);
  },

  getFeedbacksBySample: (sampleId) => {
    return get().feedbacks.filter(f => f.sampleId === sampleId);
  }
}));
