import { create } from 'zustand';
import { Batch, BatchStatus } from '@/types';
import { saveToStorage, loadFromStorage } from '@/utils/storage';
import { generateId, getDaysUntilExpiry, isExpired } from '@/utils/dateUtils';
import { mockBatches } from '@/data/mockData';

interface InventoryState {
  batches: Batch[];
  addBatch: (batch: Omit<Batch, 'id' | 'status' | 'createdAt'>) => void;
  updateBatch: (id: string, batch: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;
  getBatchesByProductId: (productId: string) => Batch[];
  getAvailableBatchesByProductId: (productId: string) => Batch[];
  updateBatchStatus: (id: string, status: BatchStatus) => void;
  decreaseBatchQuantity: (id: string, amount: number) => void;
  refreshBatchStatuses: () => void;
  loadBatches: () => void;
}

const STORAGE_KEY = 'yogurt_batches';

export const useInventoryStore = create<InventoryState>((set, get) => ({
  batches: [],

  loadBatches: () => {
    const stored = loadFromStorage<Batch[]>(STORAGE_KEY, []);
    if (stored.length === 0) {
      saveToStorage(STORAGE_KEY, mockBatches);
      set({ batches: mockBatches });
    } else {
      set({ batches: stored });
    }
    get().refreshBatchStatuses();
  },

  addBatch: (batchData) => {
    const now = new Date().toISOString();
    const status = calculateBatchStatus(batchData.expiryDate, batchData.quantity);
    const newBatch: Batch = {
      ...batchData,
      id: generateId(),
      status,
      createdAt: now,
    };
    const batches = [...get().batches, newBatch];
    saveToStorage(STORAGE_KEY, batches);
    set({ batches });
  },

  updateBatch: (id, batchData) => {
    const batches = get().batches.map(b => {
      if (b.id === id) {
        const updated = { ...b, ...batchData };
        updated.status = calculateBatchStatus(
          batchData.expiryDate || b.expiryDate,
          batchData.remainingQuantity !== undefined ? batchData.remainingQuantity : b.remainingQuantity
        );
        return updated;
      }
      return b;
    });
    saveToStorage(STORAGE_KEY, batches);
    set({ batches });
  },

  deleteBatch: (id) => {
    const batches = get().batches.filter(b => b.id !== id);
    saveToStorage(STORAGE_KEY, batches);
    set({ batches });
  },

  getBatchesByProductId: (productId) => {
    return get().batches
      .filter(b => b.productId === productId)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  },

  getAvailableBatchesByProductId: (productId) => {
    return get().batches
      .filter(b => b.productId === productId && b.remainingQuantity > 0 && !isExpired(b.expiryDate))
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  },

  updateBatchStatus: (id, status) => {
    const batches = get().batches.map(b =>
      b.id === id ? { ...b, status } : b
    );
    saveToStorage(STORAGE_KEY, batches);
    set({ batches });
  },

  decreaseBatchQuantity: (id, amount) => {
    const batches = get().batches.map(b => {
      if (b.id === id) {
        const newQty = Math.max(0, b.remainingQuantity - amount);
        const status = newQty <= 0 ? 'sold_out' : calculateBatchStatus(b.expiryDate, newQty);
        return { ...b, remainingQuantity: newQty, status };
      }
      return b;
    });
    saveToStorage(STORAGE_KEY, batches);
    set({ batches });
  },

  refreshBatchStatuses: () => {
    const batches = get().batches.map(b => {
      if (b.status === 'sold_out') return b;
      const newStatus = calculateBatchStatus(b.expiryDate, b.remainingQuantity);
      if (newStatus !== b.status) {
        return { ...b, status: newStatus };
      }
      return b;
    });
    saveToStorage(STORAGE_KEY, batches);
    set({ batches });
  },
}));

function calculateBatchStatus(expiryDate: string, remainingQuantity: number): BatchStatus {
  if (remainingQuantity <= 0) return 'sold_out';
  if (isExpired(expiryDate)) return 'expired';
  const daysLeft = getDaysUntilExpiry(expiryDate);
  if (daysLeft <= 1) return 'clearance';
  if (daysLeft <= 3) return 'near_expiry';
  return 'normal';
}
