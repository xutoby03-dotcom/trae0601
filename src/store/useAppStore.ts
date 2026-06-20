import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Toy, CleaningRecord, DisinfectionTask, AlertItem, StatsSummary, StorageGroup } from '@/types';
import type { MaterialType, CleanMethodAction, DamageType, TaskTrigger, TaskPriority, AlertStatus } from '@/types';
import {
  generateId, todayISO, addDaysToISO, daysBetween, getLast30Days,
  MATERIAL_CLEAN_CYCLE, CLEAN_ACTION_OPTIONS, cleanMethodToActions,
} from '@/utils/constants';
import { mockToys, mockCleaningRecords, mockTasks, mockAlerts } from '@/utils/mockData';

interface AppState {
  toys: Toy[];
  cleaningRecords: CleaningRecord[];
  tasks: DisinfectionTask[];
  alerts: AlertItem[];

  addToy: (data: Omit<Toy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateToy: (id: string, data: Partial<Toy>) => void;
  deleteToy: (id: string) => void;
  getToyById: (id: string) => Toy | undefined;

  addCleaningRecord: (data: Omit<CleaningRecord, 'id'>) => void;
  getRecordsByToyId: (toyId: string) => CleaningRecord[];
  getLastCleanDate: (toyId: string) => string | null;

  createTask: (title: string, toyIds: string[], trigger: TaskTrigger, priority: TaskPriority, dueDate?: string) => void;
  generateTaskByTrigger: (trigger: TaskTrigger) => DisinfectionTask | null;
  completeTaskItem: (taskId: string, toyId: string) => void;
  toggleTaskItem: (taskId: string, toyId: string) => void;
  completeTask: (taskId: string) => void;

  createAlert: (toyId: string, type: DamageType, recordId: string, notes?: string) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus, notes?: string) => void;

  getToysPendingClean: () => (Toy & { daysSinceLastClean: number; recommendedCycle: number })[];
  getActiveAlerts: () => (AlertItem & { toy: Toy })[];
  getStorageGroups: () => StorageGroup[];
  getStats: () => StatsSummary;
  resetAllData: () => void;
}

const STORAGE_KEY = 'toy-disinfection-manager-v1';

const initState = () => ({
  toys: mockToys,
  cleaningRecords: mockCleaningRecords,
  tasks: mockTasks,
  alerts: mockAlerts,
});

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initState(),

      addToy: (data) => {
        const now = new Date().toISOString();
        const toy: Toy = {
          ...data,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set({ toys: [toy, ...get().toys] });
      },

      updateToy: (id, data) => {
        set({
          toys: get().toys.map(t =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        });
      },

      deleteToy: (id) => {
        set({
          toys: get().toys.filter(t => t.id !== id),
          cleaningRecords: get().cleaningRecords.filter(r => r.toyId !== id),
          alerts: get().alerts.filter(a => a.toyId !== id),
          tasks: get().tasks.map(task => ({
            ...task,
            toyIds: task.toyIds.filter(tid => tid !== id),
            completedToyIds: task.completedToyIds.filter(tid => tid !== id),
          })),
        });
      },

      getToyById: (id) => get().toys.find(t => t.id === id),

      addCleaningRecord: (data) => {
        const record: CleaningRecord = { ...data, id: generateId() };
        const { alerts } = get();
        const newAlerts = [...alerts];

        if (record.hasDamage && record.damageType && (record.damageType === 'peeling' || record.damageType === 'loose' || record.damageType === 'mold' || record.damageType === 'odor')) {
          const existing = newAlerts.find(a => a.toyId === record.toyId && a.type === record.damageType && a.status === 'pending');
          if (!existing) {
            newAlerts.push({
              id: generateId(),
              toyId: record.toyId,
              type: record.damageType,
              recordId: record.id,
              status: 'pending',
              createdAt: new Date().toISOString(),
              notes: record.notes,
            });
          }
        }

        if (record.hasOdor) {
          const existing = newAlerts.find(a => a.toyId === record.toyId && a.type === 'odor' && a.status === 'pending');
          if (!existing) {
            newAlerts.push({
              id: generateId(),
              toyId: record.toyId,
              type: 'odor',
              recordId: record.id,
              status: 'pending',
              createdAt: new Date().toISOString(),
              notes: record.notes,
            });
          }
        }

        set({
          cleaningRecords: [record, ...get().cleaningRecords],
          alerts: newAlerts,
        });
      },

      getRecordsByToyId: (toyId) =>
        get().cleaningRecords
          .filter(r => r.toyId === toyId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),

      getLastCleanDate: (toyId) => {
        const records = get().cleaningRecords
          .filter(r => r.toyId === toyId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return records.length > 0 ? records[0].date : null;
      },

      createTask: (title, toyIds, trigger, priority, dueDate) => {
        const task: DisinfectionTask = {
          id: generateId(),
          title,
          trigger,
          toyIds,
          priority,
          dueDate: dueDate || addDaysToISO(1),
          completed: false,
          completedToyIds: [],
          createdAt: new Date().toISOString(),
        };
        set({ tasks: [task, ...get().tasks] });
      },

      generateTaskByTrigger: (trigger) => {
        const { toys } = get();
        let selectedIds: string[] = [];
        let title = '';
        let priority: TaskPriority = 'normal';

        if (trigger === 'teething') {
          selectedIds = toys.filter(t =>
            (t.ageRange.includes('0') || t.ageRange.includes('6') || t.ageRange.includes('1岁')) &&
            (t.cleanMethod === 'water' || t.cleanMethod === 'water_wipe')
          ).map(t => t.id);
          title = '入口期重点消毒任务';
          priority = 'critical';
        } else if (trigger === 'flu') {
          selectedIds = toys.map(t => t.id);
          title = '流感季全量紧急消毒';
          priority = 'critical';
        } else if (trigger === 'visitor') {
          selectedIds = toys.filter(t =>
            t.storageLocation.includes('客厅') || t.storageLocation.includes('公共')
          ).map(t => t.id);
          title = '小朋友来访后公共区域玩具消毒';
          priority = 'urgent';
        } else {
          return null;
        }

        if (selectedIds.length === 0) return null;

        const task: DisinfectionTask = {
          id: generateId(),
          title,
          trigger,
          toyIds: selectedIds,
          priority,
          dueDate: todayISO(),
          completed: false,
          completedToyIds: [],
          createdAt: new Date().toISOString(),
        };
        set({ tasks: [task, ...get().tasks] });
        return task;
      },

      completeTaskItem: (taskId, toyId) => {
        set({
          tasks: get().tasks.map(task => {
            if (task.id !== taskId) return task;
            const newCompleted = task.completedToyIds.includes(toyId)
              ? task.completedToyIds
              : [...task.completedToyIds, toyId];
            return {
              ...task,
              completedToyIds: newCompleted,
              completed: newCompleted.length === task.toyIds.length,
            };
          }),
        });
      },

      toggleTaskItem: (taskId, toyId) => {
        const { toys, cleaningRecords, tasks } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const wasCompleted = task.completedToyIds.includes(toyId);

        let updatedRecords = cleaningRecords;
        if (!wasCompleted) {
          const toy = toys.find(t => t.id === toyId);
          const methods = toy
            ? cleanMethodToActions[toy.cleanMethod] || ['wipe' as CleanMethodAction]
            : ['wipe' as CleanMethodAction];
          const record: CleaningRecord = {
            id: generateId(),
            toyId,
            date: new Date().toISOString(),
            methods,
            hasDamage: false,
            hasOdor: false,
          };
          updatedRecords = [record, ...cleaningRecords];
        }

        const newCompleted = wasCompleted
          ? task.completedToyIds.filter(id => id !== toyId)
          : [...task.completedToyIds, toyId];

        set({
          cleaningRecords: updatedRecords,
          tasks: tasks.map(t =>
            t.id === taskId
              ? { ...t, completedToyIds: newCompleted, completed: newCompleted.length === t.toyIds.length }
              : t
          ),
        });
      },

      completeTask: (taskId) => {
        const { toys, cleaningRecords, tasks } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const now = new Date().toISOString();
        const newRecords: CleaningRecord[] = task.toyIds
          .filter(id => !task.completedToyIds.includes(id))
          .map(id => {
            const toy = toys.find(t => t.id === id);
            const methods = toy
              ? cleanMethodToActions[toy.cleanMethod] || ['wipe' as CleanMethodAction]
              : ['wipe' as CleanMethodAction];
            return {
              id: generateId(),
              toyId: id,
              date: now,
              methods,
              hasDamage: false,
              hasOdor: false,
            };
          });
        set({
          cleaningRecords: [...newRecords, ...cleaningRecords],
          tasks: tasks.map(t =>
            t.id === taskId ? { ...t, completedToyIds: t.toyIds, completed: true } : t
          ),
        });
      },

      createAlert: (toyId, type, recordId, notes) => {
        const existing = get().alerts.find(a => a.toyId === toyId && a.type === type && a.status === 'pending');
        if (existing) return;
        set({
          alerts: [
            {
              id: generateId(),
              toyId,
              type,
              recordId,
              status: 'pending',
              createdAt: new Date().toISOString(),
              notes,
            },
            ...get().alerts,
          ],
        });
      },

      updateAlertStatus: (alertId, status, notes) => {
        set({
          alerts: get().alerts.map(a =>
            a.id === alertId
              ? {
                  ...a,
                  status,
                  resolvedAt: status !== 'pending' ? new Date().toISOString() : undefined,
                  notes: notes || a.notes,
                }
              : a
          ),
        });
      },

      getToysPendingClean: () => {
        const { toys, cleaningRecords } = get();
        const result: (Toy & { daysSinceLastClean: number; recommendedCycle: number })[] = [];

        for (const toy of toys) {
          const lastRecord = cleaningRecords
            .filter(r => r.toyId === toy.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          const lastDate = lastRecord ? lastRecord.date : toy.purchaseDate;
          const days = daysBetween(lastDate);
          const cycle = MATERIAL_CLEAN_CYCLE[toy.material as MaterialType] || 5;

          if (days >= cycle) {
            result.push({ ...toy, daysSinceLastClean: days, recommendedCycle: cycle });
          }
        }

        return result.sort((a, b) => b.daysSinceLastClean - a.daysSinceLastClean);
      },

      getActiveAlerts: () => {
        const { alerts, toys } = get();
        return alerts
          .filter(a => a.status === 'pending')
          .map(a => {
            const toy = toys.find(t => t.id === a.toyId);
            return toy ? { ...a, toy } : null;
          })
          .filter((x): x is AlertItem & { toy: Toy } => x !== null)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getStorageGroups: () => {
        const { toys, cleaningRecords } = get();
        const locationMap = new Map<string, Toy[]>();
        for (const toy of toys) {
          if (!locationMap.has(toy.storageLocation)) {
            locationMap.set(toy.storageLocation, []);
          }
          locationMap.get(toy.storageLocation)!.push(toy);
        }

        const groups: StorageGroup[] = [];
        for (const [location, groupToys] of locationMap.entries()) {
          let completed = 0;
          for (const toy of groupToys) {
            const lastRecord = cleaningRecords
              .filter(r => r.toyId === toy.id)
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            const lastDate = lastRecord ? lastRecord.date : toy.purchaseDate;
            const days = daysBetween(lastDate);
            const cycle = MATERIAL_CLEAN_CYCLE[toy.material as MaterialType] || 5;
            if (days < cycle) completed++;
          }
          groups.push({
            location,
            toys: groupToys,
            completedCount: completed,
            totalCount: groupToys.length,
          });
        }

        return groups.sort((a, b) => a.completedCount / a.totalCount - b.completedCount / b.totalCount);
      },

      getStats: () => {
        const { toys, cleaningRecords, alerts } = get();
        const pending = get().getToysPendingClean().length;
        const activeAlerts = alerts.filter(a => a.status === 'pending').length;

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const monthlyCount = cleaningRecords.filter(r => r.date >= firstDayOfMonth).length;

        const last30 = getLast30Days();
        const dailyTrend = last30.map(({ date, label }) => ({
          date: label,
          count: cleaningRecords.filter(r => r.date.startsWith(date)).length,
        }));

        const methodCounts: Record<string, number> = { water: 0, wipe: 0, uv: 0, dry: 0 };
        for (const record of cleaningRecords) {
          for (const m of record.methods) {
            methodCounts[m] = (methodCounts[m] || 0) + 1;
          }
        }
        const methodBreakdown = CLEAN_ACTION_OPTIONS.map(opt => ({
          name: opt.label,
          value: methodCounts[opt.value] || 0,
          color: opt.value === 'water' ? '#5DADE2'
            : opt.value === 'wipe' ? '#98D8C8'
            : opt.value === 'uv' ? '#FFB6C1'
            : '#D4A574',
        })).filter(m => m.value > 0);

        return {
          totalToys: toys.length,
          monthlyCleanCount: monthlyCount,
          pendingCleanCount: pending,
          alertCount: activeAlerts,
          dailyTrend,
          methodBreakdown,
        };
      },

      resetAllData: () => set(initState()),
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
