import { create } from 'zustand';
import type { Box } from '../types';
import { getFromStorage, setToStorage, STORAGE_KEYS } from '../utils/storage';
import { generateId } from '../utils/helpers';

interface BoxState {
  boxes: Box[];
  loading: boolean;
  fetchBoxes: () => void;
  addBox: (box: Omit<Box, 'id' | 'createdAt'>) => void;
  updateBox: (id: string, box: Partial<Box>) => void;
  deleteBox: (id: string) => void;
  getBoxById: (id: string) => Box | undefined;
  getBoxesByRider: (riderId: string) => Box[];
}

export const useBoxStore = create<BoxState>((set, get) => ({
  boxes: [],
  loading: false,

  fetchBoxes: () => {
    const boxes = getFromStorage<Box[]>(STORAGE_KEYS.BOXES, []);
    set({ boxes });
  },

  addBox: (boxData) => {
    const newBox: Box = {
      ...boxData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const boxes = [...get().boxes, newBox];
    set({ boxes });
    setToStorage(STORAGE_KEYS.BOXES, boxes);
  },

  updateBox: (id, boxData) => {
    const boxes = get().boxes.map((b) =>
      b.id === id ? { ...b, ...boxData } : b
    );
    set({ boxes });
    setToStorage(STORAGE_KEYS.BOXES, boxes);
  },

  deleteBox: (id) => {
    const boxes = get().boxes.filter((b) => b.id !== id);
    set({ boxes });
    setToStorage(STORAGE_KEYS.BOXES, boxes);
  },

  getBoxById: (id) => {
    return get().boxes.find((b) => b.id === id);
  },

  getBoxesByRider: (riderId) => {
    return get().boxes.filter((b) => b.riderId === riderId);
  },
}));
