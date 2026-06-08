import { create } from 'zustand';
import type { Task } from '@/types';

interface LotteryStore {
  currentTask: Task | null;
  isDrawing: boolean;
  hasDrawn: boolean;
  skippedTaskIds: string[];
  noMoreTasks: boolean;
  draw: (tasks: Task[]) => void;
  addSkippedId: (id: string) => void;
  setCurrentTask: (task: Task | null) => void;
  setIsDrawing: (val: boolean) => void;
  setNoMoreTasks: (val: boolean) => void;
  reset: () => void;
}

export const useLotteryStore = create<LotteryStore>((set) => ({
  currentTask: null,
  isDrawing: false,
  hasDrawn: false,
  skippedTaskIds: [],
  noMoreTasks: false,

  draw: (tasks) => {
    if (tasks.length === 0) return;
    const idx = Math.floor(Math.random() * tasks.length);
    set({ currentTask: tasks[idx], isDrawing: false, hasDrawn: true, noMoreTasks: false });
  },

  addSkippedId: (id) => {
    set((state) => ({
      skippedTaskIds: [...state.skippedTaskIds, id],
    }));
  },

  setCurrentTask: (task) => set({ currentTask: task }),
  setIsDrawing: (val) => set({ isDrawing: val }),
  setNoMoreTasks: (val) => set({ noMoreTasks: val }),
  reset: () => set({ currentTask: null, isDrawing: false, hasDrawn: false, skippedTaskIds: [], noMoreTasks: false }),
}));
