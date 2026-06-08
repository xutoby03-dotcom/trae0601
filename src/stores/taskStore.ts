import { create } from 'zustand';
import type { Task, FilterState } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { SEED_TASKS } from '@/utils/seed';

const STORAGE_KEY = 'family-fun-tasks';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getFilteredTasks: (filter: FilterState) => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: loadFromStorage<Task[]>(STORAGE_KEY, SEED_TASKS),

  addTask: (task) => {
    set((state) => {
      const tasks = [...state.tasks, task];
      saveToStorage(STORAGE_KEY, tasks);
      return { tasks };
    });
  },

  updateTask: (id, updates) => {
    set((state) => {
      const tasks = state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      saveToStorage(STORAGE_KEY, tasks);
      return { tasks };
    });
  },

  deleteTask: (id) => {
    set((state) => {
      const tasks = state.tasks.filter((t) => t.id !== id);
      saveToStorage(STORAGE_KEY, tasks);
      return { tasks };
    });
  },

  getFilteredTasks: (filter) => {
    const { tasks } = get();
    return tasks.filter((task) => {
      if (filter.weather === 'rainy' && task.scene === 'outdoor') return false;
      if (filter.maxDuration !== undefined && task.durationMin > filter.maxDuration)
        return false;
      if (filter.maxBudget !== undefined && task.budget > filter.maxBudget)
        return false;
      if (filter.energyLevel && task.energyLevel !== filter.energyLevel)
        return false;
      if (filter.scene === 'indoor' && task.scene === 'outdoor') return false;
      if (filter.scene === 'outdoor' && task.scene === 'indoor') return false;
      return true;
    });
  },
}));
