import { create } from 'zustand';
import type { Task } from '@/types';

interface LotteryStore {
  currentTask: Task | null;
  isDrawing: boolean;
  hasDrawn: boolean;
  draw: (tasks: Task[]) => void;
  setCurrentTask: (task: Task | null) => void;
  setIsDrawing: (val: boolean) => void;
  reset: () => void;
}

export const useLotteryStore = create<LotteryStore>((set) => ({
  currentTask: null,
  isDrawing: false,
  hasDrawn: false,

  draw: (tasks) => {
    if (tasks.length === 0) return;
    const idx = Math.floor(Math.random() * tasks.length);
    set({ currentTask: tasks[idx], isDrawing: false, hasDrawn: true });
  },

  setCurrentTask: (task) => set({ currentTask: task }),
  setIsDrawing: (val) => set({ isDrawing: val }),
  reset: () => set({ currentTask: null, isDrawing: false, hasDrawn: false }),
}));
