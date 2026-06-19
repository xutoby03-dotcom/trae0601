import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MaintenanceTask, TaskStatus } from '../types';
import { mockTasks } from '../data/mockData';
import { generateId } from '../utils/date';

interface TaskState {
  tasks: MaintenanceTask[];
  addTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, task: Partial<MaintenanceTask>) => void;
  deleteTask: (id: string) => void;
  getTasksByArea: (areaId: string) => MaintenanceTask[];
  getTasksByStatus: (status: TaskStatus) => MaintenanceTask[];
  getTaskById: (id: string) => MaintenanceTask | undefined;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: mockTasks,
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateTask: (id, task) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...task, updatedAt: new Date().toISOString() } : t
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),
      getTasksByArea: (areaId) =>
        get()
          .tasks.filter((t) => t.areaId === areaId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getTasksByStatus: (status) => get().tasks.filter((t) => t.status === status),
      getTaskById: (id) => get().tasks.find((t) => t.id === id),
    }),
    {
      name: 'terrace-tasks-storage',
    }
  )
);
