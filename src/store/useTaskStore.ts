import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task } from '@/types';
import { generateId, STORAGE_KEYS } from '@/utils/storage';

interface TaskState {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTaskById: (id: string) => Task | undefined;
  getTasksByInspectionId: (inspectionId: string) => Task[];
  getPendingTasks: () => Task[];
  completeTask: (id: string) => void;
  generateTasksFromFailedInspection: (inspectionId: string, failedItems: Array<{ key: string; label: string; instruction: string; notes?: string }>, manualPage?: string) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      setTasks: (tasks) => set({ tasks }),
      
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId(),
        };
        set({ tasks: [...get().tasks, newTask] });
      },
      
      updateTask: (id, data) => {
        set({
          tasks: get().tasks.map(t =>
            t.id === id ? { ...t, ...data } : t
          ),
        });
      },
      
      deleteTask: (id) => {
        set({ tasks: get().tasks.filter(t => t.id !== id) });
      },
      
      getTaskById: (id) => {
        return get().tasks.find(t => t.id === id);
      },
      
      getTasksByInspectionId: (inspectionId) => {
        return get().tasks
          .filter(t => t.inspectionId === inspectionId)
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      },
      
      getPendingTasks: () => {
        return get().tasks
          .filter(t => t.status !== 'completed')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      },
      
      completeTask: (id) => {
        set({
          tasks: get().tasks.map(t =>
            t.id === id
              ? { ...t, status: 'completed' as const, completedAt: new Date().toISOString() }
              : t
          ),
        });
      },
      
      generateTasksFromFailedInspection: (inspectionId, failedItems, manualPage) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);
        const dueDateStr = dueDate.toISOString().split('T')[0];
        
        const newTasks: Task[] = failedItems.map(item => ({
          id: generateId(),
          inspectionId,
          title: `重新检查：${item.label}`,
          description: item.notes 
            ? `${item.instruction.replace('{page}', manualPage || '?')}\n\n上次检查备注：${item.notes}`
            : item.instruction.replace('{page}', manualPage || '?'),
          status: 'pending' as const,
          dueDate: dueDateStr,
        }));
        
        set({ tasks: [...get().tasks, ...newTasks] });
      },
    }),
    {
      name: STORAGE_KEYS.TASKS,
    }
  )
);
