import { create } from 'zustand';
import type { SupplyTask, SupplyTaskWithDetails, TaskStatus, TaskUrgency, OperationLog } from '@/types/index';
import { storage, delay, generateId } from '@/utils/storage';
import { mockTasks } from '@/mock/data';
import { useInventoryStore } from './inventoryStore';
import { useCounterStore } from './counterStore';
import dayjs from 'dayjs';

interface TaskStats {
  pending: number;
  inProgress: number;
  completed: number;
  total: number;
}

interface CreateTaskData {
  counterId: string;
  inspectionRecordId: string;
  materialType: SupplyTask['materialType'];
  shortageQty: number;
  targetQty: number;
  urgency: TaskUrgency;
  assigneeId?: string;
  remarks?: string;
  operatorId: string;
  operatorName?: string;
}

interface TaskStoreState {
  tasks: SupplyTask[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  getTasksByStatus: (status: TaskStatus) => SupplyTask[];
  getTasksByCounter: (counterId: string) => SupplyTask[];
  createTask: (data: CreateTaskData) => Promise<SupplyTask>;
  assignTask: (taskId: string, assigneeId: string, operatorId: string, operatorName?: string) => Promise<void>;
  startTask: (taskId: string, operatorId: string, operatorName?: string) => Promise<void>;
  completeTask: (taskId: string, operatorId: string, operatorName?: string, note?: string) => Promise<void>;
  getTaskStats: () => TaskStats;
  getTasksWithDetails: () => SupplyTaskWithDetails[];
  getTaskById: (id: string) => SupplyTask | undefined;
  _addOperationLog: (task: SupplyTask, action: string, operatorId: string, operatorName?: string, note?: string) => SupplyTask;
}

const STORAGE_KEY = 'tasks';

const loadInitialTasks = (): SupplyTask[] => {
  if (storage.has(STORAGE_KEY)) {
    return storage.get<SupplyTask[]>(STORAGE_KEY, []);
  }
  storage.set(STORAGE_KEY, mockTasks);
  return mockTasks;
};

const getGuideNameById = (guideId: string): string | undefined => {
  const counters = useCounterStore.getState().counters;
  for (const counter of counters) {
    const guide = counter.guides.find((g) => g.id === guideId);
    if (guide) return guide.name;
  }
  return undefined;
};

export const useTaskStore = create<TaskStoreState>((set, get) => ({
  tasks: loadInitialTasks(),
  loading: false,

  fetchTasks: async () => {
    set({ loading: true });
    await delay();
    const data = storage.has(STORAGE_KEY)
      ? storage.get<SupplyTask[]>(STORAGE_KEY, [])
      : mockTasks;
    set({ tasks: data, loading: false });
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((t) => t.status === status);
  },

  getTasksByCounter: (counterId) => {
    return get().tasks.filter((t) => t.counterId === counterId);
  },

  getTaskById: (id) => {
    return get().tasks.find((t) => t.id === id);
  },

  _addOperationLog: (task, action, operatorId, operatorName, note) => {
    const log: OperationLog = {
      action,
      operatorId,
      operatorName: operatorName || getGuideNameById(operatorId),
      timestamp: new Date().toISOString(),
      note,
    };
    return {
      ...task,
      operationLogs: [...task.operationLogs, log],
    };
  },

  createTask: async (data) => {
    set({ loading: true });
    await delay();
    const newTask: SupplyTask = {
      id: generateId(),
      counterId: data.counterId,
      inspectionRecordId: data.inspectionRecordId,
      materialType: data.materialType,
      shortageQty: data.shortageQty,
      targetQty: data.targetQty,
      status: 'pending',
      urgency: data.urgency,
      assigneeId: data.assigneeId,
      remarks: data.remarks,
      operationLogs: [
        {
          action: '创建任务',
          operatorId: data.operatorId,
          operatorName: data.operatorName || getGuideNameById(data.operatorId),
          timestamp: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    };
    const updated = [...get().tasks, newTask];
    storage.set(STORAGE_KEY, updated);
    set({ tasks: updated, loading: false });
    return newTask;
  },

  assignTask: async (taskId, assigneeId, operatorId, operatorName) => {
    set({ loading: true });
    await delay();
    const assigneeName = getGuideNameById(assigneeId);
    const updated = get().tasks.map((t) => {
      if (t.id === taskId) {
        const withLog = get()._addOperationLog(t, '分配任务', operatorId, operatorName, `分配给 ${assigneeName || assigneeId}`);
        return {
          ...withLog,
          assigneeId,
        };
      }
      return t;
    });
    storage.set(STORAGE_KEY, updated);
    set({ tasks: updated, loading: false });
  },

  startTask: async (taskId, operatorId, operatorName) => {
    set({ loading: true });
    await delay();
    const updated = get().tasks.map((t) => {
      if (t.id === taskId) {
        const withLog = get()._addOperationLog(t, '开始任务', operatorId, operatorName);
        return {
          ...withLog,
          status: 'inProgress' as TaskStatus,
        };
      }
      return t;
    });
    storage.set(STORAGE_KEY, updated);
    set({ tasks: updated, loading: false });
  },

  completeTask: async (taskId, operatorId, operatorName, note) => {
    set({ loading: true });
    await delay();
    const updated = get().tasks.map((t) => {
      if (t.id === taskId) {
        const inv = useInventoryStore.getState();
        const item = inv.getInventoryItemByCounterAndMaterial(t.counterId, t.materialType);
        if (item) {
          inv.updateInventoryItem(item.id, { quantity: t.targetQty });
        }
        const completedAt = new Date().toISOString();
        const withLog = get()._addOperationLog(t, '完成任务', operatorId, operatorName, note || `补给完成，已补充${t.shortageQty}件`);
        return {
          ...withLog,
          status: 'completed' as TaskStatus,
          completedAt,
        };
      }
      return t;
    });
    storage.set(STORAGE_KEY, updated);
    set({ tasks: updated, loading: false });
  },

  getTaskStats: () => {
    const tasks = get().tasks;
    const stats: TaskStats = {
      pending: 0,
      inProgress: 0,
      completed: 0,
      total: tasks.length,
    };
    tasks.forEach((t) => {
      stats[t.status]++;
    });
    return stats;
  },

  getTasksWithDetails: () => {
    const tasks = get().tasks;
    const { counters } = useCounterStore.getState();
    const counterMap = new Map(counters.map((c) => [c.id, c.name]));
    const now = dayjs();

    return tasks.map((t) => {
      let shortageDurationHours: number | undefined;
      if (t.status !== 'completed') {
        shortageDurationHours = now.diff(dayjs(t.createdAt), 'hour');
      }
      return {
        ...t,
        counterName: counterMap.get(t.counterId) || '未知品牌区',
        assigneeName: t.assigneeId ? getGuideNameById(t.assigneeId) : undefined,
        shortageDurationHours,
      };
    });
  },
}));
