import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, BathRecord, BathTask, ElderProfile } from '@/types';
import { mockInitialState } from '@/data/mockData';

interface StoreActions {
  addElder: (elder: Omit<ElderProfile, 'id'>) => void;
  updateElder: (id: string, patch: Partial<ElderProfile>) => void;
  deleteElder: (id: string) => void;
  addTask: (task: Omit<BathTask, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, patch: Partial<BathTask>) => void;
  deleteTask: (id: string) => void;
  completeTask: (taskId: string, record: Omit<BathRecord, 'id' | 'taskId'>) => void;
  resetStore: () => void;
}

export const useStore = create<AppState & StoreActions>()(
  persist(
    (set) => ({
      ...mockInitialState,

      addElder: (elder) =>
        set((s) => ({
          elders: [...s.elders, { ...elder, id: 'e_' + Date.now() }],
        })),

      updateElder: (id, patch) =>
        set((s) => ({
          elders: s.elders.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),

      deleteElder: (id) =>
        set((s) => ({
          elders: s.elders.filter((e) => e.id !== id),
          tasks: s.tasks.filter((t) => t.elderId !== id),
          records: s.records.filter((r) => r.elderId !== id),
        })),

      addTask: (task) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            { ...task, id: 't_' + Date.now(), createdAt: new Date().toISOString().split('T')[0] },
          ],
        })),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
        })),

      completeTask: (taskId, record) =>
        set((s) => {
          const task = s.tasks.find((t) => t.id === taskId);
          if (!task) return s;
          const newRecord: BathRecord = {
            ...record,
            id: 'r_' + Date.now(),
            taskId,
          };
          return {
            tasks: s.tasks.map((t) =>
              t.id === taskId ? { ...t, status: 'completed' } : t
            ),
            records: [...s.records, newRecord],
            elders: s.elders.map((e) =>
              e.id === task.elderId
                ? { ...e, lastBathDate: new Date().toISOString().split('T')[0] }
                : e
            ),
          };
        }),

      resetStore: () => set(mockInitialState),
    }),
    {
      name: 'elderly-bath-store',
    }
  )
);
