import { create } from 'zustand';
import { Tea, Batch, BatchFormData, FilterFormData, BatchStatus } from '@/types';
import { mockTeas, mockBatches } from '@/data/mockData';
import { loadData, saveData } from '@/utils/storage';

interface BatchState {
  teas: Tea[];
  batches: Batch[];
  initialized: boolean;
  
  initData: () => void;
  addBatch: (data: BatchFormData) => void;
  filterBatch: (batchId: string, data: FilterFormData) => void;
  offShelfBatch: (batchId: string, reason: string) => void;
  getTeaById: (teaId: string) => Tea | undefined;
  updateBatchStatus: () => void;
  
  addTea: (tea: Omit<Tea, 'id'>) => void;
  updateTea: (id: string, tea: Partial<Tea>) => void;
  deleteTea: (id: string) => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export const useBatchStore = create<BatchState>((set, get) => ({
  teas: [],
  batches: [],
  initialized: false,

  initData: () => {
    const stored = loadData();
    if (stored && stored.teas.length > 0) {
      set({ teas: stored.teas, batches: stored.batches, initialized: true });
    } else {
      set({ teas: mockTeas, batches: mockBatches, initialized: true });
      saveData({ teas: mockTeas, batches: mockBatches });
    }
    
    setInterval(() => {
      get().updateBatchStatus();
    }, 1000);
  },

  addBatch: (data: BatchFormData) => {
    const tea = get().getTeaById(data.teaId);
    if (!tea) return;
    
    const targetFilterTime = new Date(new Date(data.startTime).getTime() + tea.brewDurationMinutes * 60 * 1000);
    
    const newBatch: Batch = {
      id: generateId(),
      ...data,
      targetFilterTime: targetFilterTime.toISOString(),
      status: 'brewing',
      isOffShelf: false,
    };
    
    set((state) => {
      const batches = [...state.batches, newBatch];
      saveData({ teas: state.teas, batches });
      return { batches };
    });
  },

  filterBatch: (batchId: string, data: FilterFormData) => {
    const now = new Date().toISOString();
    set((state) => {
      const batches = state.batches.map((batch) => {
        if (batch.id === batchId) {
          return {
            ...batch,
            status: 'filtered' as BatchStatus,
            actualFilterTime: now,
            outputAmountMl: data.outputAmountMl,
            tasteRating: data.tasteRating,
            lossAmountMl: data.lossAmountMl,
            lossReason: data.lossReason,
            shelfLocation: data.shelfLocation,
            shelfTime: now,
          };
        }
        return batch;
      });
      saveData({ teas: state.teas, batches });
      return { batches };
    });
  },

  offShelfBatch: (batchId: string, reason: string) => {
    const now = new Date().toISOString();
    set((state) => {
      const batches = state.batches.map((batch) => {
        if (batch.id === batchId) {
          return {
            ...batch,
            status: 'off_shelf' as BatchStatus,
            isOffShelf: true,
            offShelfTime: now,
            offShelfReason: reason,
          };
        }
        return batch;
      });
      saveData({ teas: state.teas, batches });
      return { batches };
    });
  },

  getTeaById: (teaId: string) => {
    return get().teas.find((t) => t.id === teaId);
  },

  updateBatchStatus: () => {
    const { teas, batches } = get();
    let hasChanges = false;
    
    const updatedBatches = batches.map((batch) => {
      if (batch.isOffShelf) return batch;
      
      const tea = teas.find((t) => t.id === batch.teaId);
      if (!tea) return batch;
      
      let newStatus: BatchStatus = batch.status;
      let newIsOffShelf = batch.isOffShelf;
      let newOffShelfTime = batch.offShelfTime;
      let newOffShelfReason = batch.offShelfReason;
      
      if (batch.status === 'filtered' && batch.shelfTime) {
        const shelfLifeMs = tea.shelfLifeHours * 60 * 60 * 1000;
        const shelfDate = new Date(batch.shelfTime);
        if (Date.now() - shelfDate.getTime() > shelfLifeMs) {
          newStatus = 'off_shelf';
          newIsOffShelf = true;
          newOffShelfTime = new Date().toISOString();
          newOffShelfReason = '超过安全售卖时间';
          hasChanges = true;
        }
      } else if (!['filtered', 'off_shelf'].includes(batch.status)) {
        const now = Date.now();
        const target = new Date(batch.targetFilterTime).getTime();
        const readyThreshold = target - 10 * 60 * 1000;
        
        if (now >= target) {
          newStatus = 'overdue';
        } else if (now >= readyThreshold) {
          newStatus = 'ready';
        } else {
          newStatus = 'brewing';
        }
        
        if (newStatus !== batch.status) {
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        return {
          ...batch,
          status: newStatus,
          isOffShelf: newIsOffShelf,
          offShelfTime: newOffShelfTime,
          offShelfReason: newOffShelfReason,
        };
      }
      
      return batch;
    });
    
    if (hasChanges) {
      set({ batches: updatedBatches });
      saveData({ teas, batches: updatedBatches });
    }
  },

  addTea: (tea: Omit<Tea, 'id'>) => {
    const newTea: Tea = {
      ...tea,
      id: generateId(),
    };
    set((state) => {
      const teas = [...state.teas, newTea];
      saveData({ teas, batches: state.batches });
      return { teas };
    });
  },

  updateTea: (id: string, tea: Partial<Tea>) => {
    set((state) => {
      const teas = state.teas.map((t) => (t.id === id ? { ...t, ...tea } : t));
      saveData({ teas, batches: state.batches });
      return { teas };
    });
  },

  deleteTea: (id: string) => {
    set((state) => {
      const teas = state.teas.filter((t) => t.id !== id);
      saveData({ teas, batches: state.batches });
      return { teas };
    });
  },
}));
