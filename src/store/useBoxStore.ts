import { create } from 'zustand';
import type { Box, BoxStatus, BoxCategory } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { initialBoxes } from '@/utils/mockData';
import { formatDate } from '@/utils/condition';

const STORAGE_KEY = 'boxes';

interface BoxStore {
  boxes: Box[];
  addBox: (box: Omit<Box, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'status'>) => void;
  updateBox: (id: string, box: Partial<Box>) => void;
  updateBoxStatus: (id: string, status: BoxStatus) => void;
  deleteBox: (id: string) => void;
  getBoxById: (id: string) => Box | undefined;
  getBoxesByCategory: (category: BoxCategory | 'all') => Box[];
  getBoxesByStatus: (status: BoxStatus | 'all') => Box[];
  incrementUsageCount: (id: string) => void;
}

export const useBoxStore = create<BoxStore>((set, get) => ({
  boxes: loadFromStorage<Box[]>(STORAGE_KEY, initialBoxes),

  addBox: (box) => {
    const now = formatDate(new Date());
    const newBox: Box = {
      ...box,
      id: Date.now().toString(),
      usageCount: 0,
      status: 'available',
      createdAt: now,
      updatedAt: now,
    };
    const boxes = [...get().boxes, newBox];
    set({ boxes });
    saveToStorage(STORAGE_KEY, boxes);
  },

  updateBox: (id, box) => {
    const now = formatDate(new Date());
    const boxes = get().boxes.map((b) =>
      b.id === id ? { ...b, ...box, updatedAt: now } : b
    );
    set({ boxes });
    saveToStorage(STORAGE_KEY, boxes);
  },

  updateBoxStatus: (id, status) => {
    const now = formatDate(new Date());
    const boxes = get().boxes.map((b) =>
      b.id === id ? { ...b, status, updatedAt: now } : b
    );
    set({ boxes });
    saveToStorage(STORAGE_KEY, boxes);
  },

  deleteBox: (id) => {
    const boxes = get().boxes.filter((b) => b.id !== id);
    set({ boxes });
    saveToStorage(STORAGE_KEY, boxes);
  },

  getBoxById: (id) => {
    return get().boxes.find((b) => b.id === id);
  },

  getBoxesByCategory: (category) => {
    if (category === 'all') return get().boxes;
    return get().boxes.filter((b) => b.category === category);
  },

  getBoxesByStatus: (status) => {
    if (status === 'all') return get().boxes;
    return get().boxes.filter((b) => b.status === status);
  },

  incrementUsageCount: (id) => {
    const now = formatDate(new Date());
    const boxes = get().boxes.map((b) =>
      b.id === id ? { ...b, usageCount: b.usageCount + 1, updatedAt: now } : b
    );
    set({ boxes });
    saveToStorage(STORAGE_KEY, boxes);
  },
}));
