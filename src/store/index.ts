import { create } from "zustand";
import type {
  ResearchGroup,
  Cage,
  DailyTask,
  OperationRecord,
  Alert,
  TaskStatus,
  OperationType,
  CageStatus,
  Species,
} from "@/types";
import {
  mockResearchGroups,
  mockCages,
  mockDailyTasks,
  mockOperationRecords,
  mockAlerts,
} from "@/data/mockData";
import { loadStorage, saveStorage, generateId } from "@/utils/storage";
import { today } from "@/utils/date";

interface StoreState {
  researchGroups: ResearchGroup[];
  cages: Cage[];
  dailyTasks: DailyTask[];
  operationRecords: OperationRecord[];
  alerts: Alert[];

  addCage: (data: Omit<Cage, "id" | "createdAt">) => void;
  updateCage: (id: string, data: Partial<Cage>) => void;
  deleteCage: (id: string) => void;

  updateTask: (id: string, data: Partial<DailyTask>) => void;
  completeTask: (id: string, data: Partial<DailyTask>, operator: string) => void;

  addOperationRecord: (
    data: Omit<OperationRecord, "id" | "createdAt"> & { createdAt?: string }
  ) => void;

  addAlert: (data: Omit<Alert, "id" | "createdAt" | "resolved">) => void;
  resolveAlert: (id: string) => void;

  getCageById: (id: string) => Cage | undefined;
  getTasksByCageAndDate: (cageId: string, date: string) => DailyTask[];
  getTasksByDate: (date: string) => DailyTask[];
  getRecordsByCage: (cageId: string) => OperationRecord[];
  getRecordsByType: (type: OperationType) => OperationRecord[];
  getUnresolvedAlerts: () => Alert[];
  getResearchGroupById: (id: string) => ResearchGroup | undefined;
}

const STORAGE_KEY = "app_state_v1";

function loadInitialState() {
  const stored = loadStorage<Partial<StoreState> | null>(STORAGE_KEY, null);
  if (stored && stored.cages && stored.cages.length > 0) {
    return stored;
  }
  return null;
}

const initial = loadInitialState();

export const useStore = create<StoreState>((set, get) => ({
  researchGroups: initial?.researchGroups ?? mockResearchGroups,
  cages: initial?.cages ?? mockCages,
  dailyTasks: initial?.dailyTasks ?? mockDailyTasks,
  operationRecords: initial?.operationRecords ?? mockOperationRecords,
  alerts: initial?.alerts ?? mockAlerts,

  addCage: (data) => {
    const newCage: Cage = {
      ...data,
      id: generateId(),
      createdAt: today(),
    };
    set((s) => {
      const next = { ...s, cages: [...s.cages, newCage] };
      saveStorage(STORAGE_KEY, next);
      return next;
    });
  },
  updateCage: (id, data) => {
    set((s) => {
      const next = {
        ...s,
        cages: s.cages.map((c) => (c.id === id ? { ...c, ...data } : c)),
      };
      saveStorage(STORAGE_KEY, next);
      return next;
    });
  },
  deleteCage: (id) => {
    set((s) => {
      const next = {
        ...s,
        cages: s.cages.filter((c) => c.id !== id),
      };
      saveStorage(STORAGE_KEY, next);
      return next;
    });
  },

  updateTask: (id, data) => {
    set((s) => {
      const next = {
        ...s,
        dailyTasks: s.dailyTasks.map((t) =>
          t.id === id ? { ...t, ...data } : t
        ),
      };
      saveStorage(STORAGE_KEY, next);
      return next;
    });
  },
  completeTask: (id, data, operator) => {
    const now = new Date();
    const completedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    set((s) => {
      const next = {
        ...s,
        dailyTasks: s.dailyTasks.map((t) =>
          t.id === id
            ? {
                ...t,
                ...data,
                status: "completed" as TaskStatus,
                completedAt,
                completedBy: operator,
              }
            : t
        ),
      };
      saveStorage(STORAGE_KEY, next);
      return next;
    });
  },

  addOperationRecord: (data) => {
    const record: OperationRecord = {
      ...data,
      id: generateId(),
      createdAt: data.createdAt ?? today(),
    };
    set((s) => {
      const next = {
        ...s,
        operationRecords: [...s.operationRecords, record],
      };
      saveStorage(STORAGE_KEY, next);
      return next;
    });
  },

  addAlert: (data) => {
    const alert: Alert = {
      ...data,
      id: generateId(),
      createdAt: today(),
      resolved: false,
    };
    set((s) => {
      const next = { ...s, alerts: [...s.alerts, alert] };
      saveStorage(STORAGE_KEY, next);
      return next;
    });
  },
  resolveAlert: (id) => {
    set((s) => {
      const next = {
        ...s,
        alerts: s.alerts.map((a) =>
          a.id === id ? { ...a, resolved: true } : a
        ),
      };
      saveStorage(STORAGE_KEY, next);
      return next;
    });
  },

  getCageById: (id) => get().cages.find((c) => c.id === id),
  getTasksByCageAndDate: (cageId, date) =>
    get().dailyTasks.filter((t) => t.cageId === cageId && t.taskDate === date),
  getTasksByDate: (date) => get().dailyTasks.filter((t) => t.taskDate === date),
  getRecordsByCage: (cageId) =>
    get()
      .operationRecords.filter((r) => r.cageId === cageId)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
  getRecordsByType: (type) =>
    get()
      .operationRecords.filter((r) => r.type === type)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
  getUnresolvedAlerts: () => get().alerts.filter((a) => !a.resolved),
  getResearchGroupById: (id) =>
    get().researchGroups.find((g) => g.id === id),
}));
