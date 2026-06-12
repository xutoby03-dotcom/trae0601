import { create } from 'zustand';
import type { Batch, Oven, NewBatchInput, FinishBatchInput } from '@/types';
import { mockBatches, mockOvens } from '@/data/mockData';
import { genId } from '@/utils/time';

interface BatchState {
  ovens: Oven[];
  batches: Batch[];
  addBatch: (input: NewBatchInput) => void;
  finishBatch: (batchId: string, input: FinishBatchInput) => void;
  isLayerOccupied: (ovenId: string, layer: number) => boolean;
  getActiveBatchesByOven: (ovenId: string) => Batch[];
  getActiveBatches: () => Batch[];
  getFinishedBatches: () => Batch[];
}

export const useBatchStore = create<BatchState>((set, get) => ({
  ovens: mockOvens,
  batches: mockBatches,

  addBatch: (input) => {
    const newBatch: Batch = {
      id: genId(),
      ...input,
      startTime: new Date().toISOString(),
      status: 'baking',
    };
    set((state) => ({ batches: [...state.batches, newBatch] }));
  },

  finishBatch: (batchId, input) => {
    set((state) => ({
      batches: state.batches.map((b) =>
        b.id === batchId
          ? {
              ...b,
              status: 'finished',
              finishTime: new Date().toISOString(),
              actualDuration: input.actualDuration,
              colorGrade: input.colorGrade,
              lossQuantity: input.lossQuantity,
              lossReason: input.lossReason,
              finishPhoto: input.finishPhoto,
            }
          : b
      ),
    }));
  },

  isLayerOccupied: (ovenId, layer) => {
    return get()
      .batches.some((b) => b.status === 'baking' && b.ovenId === ovenId && b.layer === layer);
  },

  getActiveBatchesByOven: (ovenId) => {
    return get().batches.filter((b) => b.status === 'baking' && b.ovenId === ovenId);
  },

  getActiveBatches: () => {
    return get()
      .batches.filter((b) => b.status === 'baking')
      .sort((a, b) => {
        const ra = a.targetDuration - (Date.now() - new Date(a.startTime).getTime()) / 1000;
        const rb = b.targetDuration - (Date.now() - new Date(b.startTime).getTime()) / 1000;
        return ra - rb;
      });
  },

  getFinishedBatches: () => {
    return get().batches.filter((b) => b.status === 'finished');
  },
}));
