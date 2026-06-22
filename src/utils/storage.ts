import type { CalibrationTask } from '../types/calibration';

const TASKS_KEY = 'calibration_tasks';

export const storage = {
  getTasks(): CalibrationTask[] {
    try {
      const raw = localStorage.getItem(TASKS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveTasks(tasks: CalibrationTask[]) {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  },

  getTask(id: string): CalibrationTask | null {
    const tasks = this.getTasks();
    return tasks.find(t => t.id === id) ?? null;
  },

  upsertTask(task: CalibrationTask) {
    const tasks = this.getTasks();
    const idx = tasks.findIndex(t => t.id === task.id);
    if (idx >= 0) {
      tasks[idx] = task;
    } else {
      tasks.unshift(task);
    }
    this.saveTasks(tasks);
  },
};

export const generateTaskNo = (): string => {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `TC-${y}${m}${d}-${rand}`;
};

export const uid = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
