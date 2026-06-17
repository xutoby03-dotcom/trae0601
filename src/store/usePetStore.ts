import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Pet, Task, CheckItem, Abnormality, Report } from '../types';
import { mockPet, mockTasks, mockCheckItems, mockAbnormalities, mockReport, getInitialCheckItems } from '../data/mockData';
import { generateId } from '../utils/helpers';

interface PetState {
  pet: Pet;
  tasks: Task[];
  checkItems: CheckItem[];
  abnormalities: Abnormality[];
  reports: Report[];
  
  setPet: (pet: Pet) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  getTaskById: (taskId: string) => Task | undefined;
  getCheckItemsByTaskId: (taskId: string) => CheckItem[];
  completeCheckItem: (taskId: string, itemId: string, photo?: string, note?: string) => void;
  addAbnormality: (taskId: string, type: Abnormality['type'], description: string, photo?: string) => void;
  getAbnormalitiesByTaskId: (taskId: string) => Abnormality[];
  generateReport: (taskId: string, remainingFood: number, remainingLitter: number, remainingMedicine: number, nextReminder: string, summary: string) => Report;
  getReportByTaskId: (taskId: string) => Report | undefined;
  resetTask: (taskId: string) => void;
}

export const usePetStore = create<PetState>()(
  persist(
    (set, get) => ({
      pet: mockPet,
      tasks: mockTasks,
      checkItems: mockCheckItems,
      abnormalities: mockAbnormalities,
      reports: [mockReport],

      setPet: (pet) => set({ pet }),

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
          checkItems: [...state.checkItems, ...getInitialCheckItems(newTask.id, newTask)],
        }));
      },

      updateTaskStatus: (taskId, status) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, status } : t
          ),
        }));
      },

      getTaskById: (taskId) => {
        return get().tasks.find((t) => t.id === taskId);
      },

      getCheckItemsByTaskId: (taskId) => {
        const items = get().checkItems.filter((c) => c.taskId === taskId);
        if (items.length === 0) {
          const task = get().getTaskById(taskId);
          if (task) {
            const initialItems = getInitialCheckItems(taskId, task);
            set((state) => ({
              checkItems: [...state.checkItems, ...initialItems],
            }));
            return initialItems;
          }
        }
        return items;
      },

      completeCheckItem: (taskId, itemId, photo, note) => {
        set((state) => ({
          checkItems: state.checkItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  completed: true,
                  photo: photo || item.photo,
                  note: note || item.note,
                  completedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
        
        const state = get();
        const taskItems = state.checkItems.filter((c) => c.taskId === taskId);
        const allCompleted = taskItems.every((item) => item.completed);
        if (allCompleted) {
          state.updateTaskStatus(taskId, 'completed');
        }
      },

      addAbnormality: (taskId, type, description, photo) => {
        const newAbnormality: Abnormality = {
          id: generateId(),
          taskId,
          type,
          description,
          photo,
          reportedAt: new Date().toISOString(),
        };
        set((state) => ({
          abnormalities: [...state.abnormalities, newAbnormality],
        }));
      },

      getAbnormalitiesByTaskId: (taskId) => {
        return get().abnormalities.filter((a) => a.taskId === taskId);
      },

      generateReport: (taskId, remainingFood, remainingLitter, remainingMedicine, nextReminder, summary) => {
        const newReport: Report = {
          id: generateId(),
          taskId,
          remainingFood,
          remainingLitter,
          remainingMedicine,
          nextReminder,
          summary,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          reports: [...state.reports, newReport],
        }));
        get().updateTaskStatus(taskId, 'completed');
        return newReport;
      },

      getReportByTaskId: (taskId) => {
        return get().reports.find((r) => r.taskId === taskId);
      },

      resetTask: (taskId) => {
        const task = get().getTaskById(taskId);
        if (task) {
          set((state) => ({
            checkItems: state.checkItems.filter((c) => c.taskId !== taskId),
            abnormalities: state.abnormalities.filter((a) => a.taskId !== taskId),
            reports: state.reports.filter((r) => r.taskId !== taskId),
            tasks: state.tasks.map((t) =>
              t.id === taskId ? { ...t, status: 'pending' } : t
            ),
          }));
        }
      },
    }),
    {
      name: 'pet-sitting-storage',
    }
  )
);
