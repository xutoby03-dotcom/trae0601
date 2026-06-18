import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Batch, CookingRecord, CustomerFeedback, SaleWindow } from '@/types';
import { mockBatches, mockFeedbacks } from '@/utils/mockData';
import { generateId, getNowIso } from '@/utils/helpers';

interface BatchState {
  batches: Batch[];
  feedbacks: CustomerFeedback[];
  addBatch: (data: Omit<Batch, 'id' | 'cookingRecords' | 'status'> & { status?: Batch['status'] }) => Batch;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  addCookingRecord: (batchId: string, data: Omit<CookingRecord, 'id' | 'batchId' | 'recordTime'>) => void;
  setBatchStatus: (id: string, status: Batch['status']) => void;
  finishBatch: (id: string, windowName: string, remainingL: number) => void;
  addFeedback: (data: Omit<CustomerFeedback, 'id' | 'createdAt'>) => void;
  getBatchById: (id: string) => Batch | undefined;
  getCookingBatches: () => Batch[];
  getSoupStock: () => { soupType: Batch['soupType']; remainingL: number }[];
  getStabilityData: (soupType: Batch['soupType']) => { label: string; salinity: number }[];
  getFeedbacksByBatch: (batchId: string) => CustomerFeedback[];
}

export const useBatchStore = create<BatchState>()(
  persist(
    (set, get) => ({
      batches: mockBatches,
      feedbacks: mockFeedbacks,

      addBatch: (data) => {
        const newBatch: Batch = {
          id: generateId(),
          status: data.status || 'preparing',
          cookingRecords: [],
          ...data,
        };
        set((s) => ({ batches: [newBatch, ...s.batches] }));
        return newBatch;
      },

      updateBatch: (id, updates) => {
        set((s) => ({
          batches: s.batches.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        }));
      },

      deleteBatch: (id) => {
        set((s) => ({ batches: s.batches.filter((b) => b.id !== id) }));
      },

      addCookingRecord: (batchId, data) => {
        const record: CookingRecord = {
          id: generateId(),
          batchId,
          recordTime: getNowIso(),
          ...data,
        };
        set((s) => ({
          batches: s.batches.map((b) =>
            b.id === batchId
              ? { ...b, cookingRecords: [...b.cookingRecords, record], status: b.status === 'preparing' ? 'cooking' : b.status }
              : b
          ),
        }));
      },

      setBatchStatus: (id, status) => {
        set((s) => ({
          batches: s.batches.map((b) => (b.id === id ? { ...b, status } : b)),
        }));
      },

      finishBatch: (id, windowName, remainingL) => {
        const saleWindow: SaleWindow = {
          id: generateId(),
          batchId: id,
          windowName,
          saleDate: new Date().toISOString().slice(0, 10),
          remainingL,
        };
        set((s) => ({
          batches: s.batches.map((b) =>
            b.id === id
              ? { ...b, status: 'sold', finishTime: getNowIso(), saleWindow }
              : b
          ),
        }));
      },

      addFeedback: (data) => {
        const fb: CustomerFeedback = {
          id: generateId(),
          createdAt: getNowIso(),
          ...data,
        };
        set((s) => ({ feedbacks: [fb, ...s.feedbacks] }));
      },

      getBatchById: (id) => get().batches.find((b) => b.id === id),

      getCookingBatches: () => get().batches.filter((b) => b.status === 'cooking' || b.status === 'preparing'),

      getSoupStock: () => {
        const stock = new Map<Batch['soupType'], number>();
        get()
          .batches.filter((b) => b.saleWindow && b.saleWindow.remainingL > 0)
          .forEach((b) => {
            const cur = stock.get(b.soupType) || 0;
            stock.set(b.soupType, cur + (b.saleWindow?.remainingL || 0));
          });
        return Array.from(stock.entries()).map(([soupType, remainingL]) => ({ soupType, remainingL }));
      },

      getStabilityData: (soupType) => {
        return get()
          .batches
          .filter((b) => b.soupType === soupType && b.cookingRecords.length > 0)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .slice(-8)
          .map((b) => ({
            label: new Date(b.startTime).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
            salinity: b.cookingRecords[b.cookingRecords.length - 1]?.salinity || 0,
          }));
      },

      getFeedbacksByBatch: (batchId) => get().feedbacks.filter((f) => f.batchId === batchId),
    }),
    {
      name: 'soup-batch-storage',
    }
  )
);
