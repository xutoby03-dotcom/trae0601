import { create } from 'zustand';
import type {
  Point,
  RainTask,
  LayingRecord,
  Issue,
  RecoveryRecord,
  IssueType,
  IssueStatus,
  MatStatus,
} from '../types';
import {
  mockPoints,
  mockTasks,
  mockLayingRecords,
  mockIssues,
  mockRecoveryRecords,
} from '../data/mockData';

interface AppState {
  points: Point[];
  tasks: RainTask[];
  layingRecords: LayingRecord[];
  issues: Issue[];
  recoveryRecords: RecoveryRecord[];
  currentTaskId: string | null;

  addPoint: (point: Omit<Point, 'id' | 'createdAt'>) => void;
  updatePoint: (id: string, point: Partial<Point>) => void;
  deletePoint: (id: string) => void;

  createRainTask: () => RainTask;
  updateTaskStatus: (taskId: string, status: RainTask['status']) => void;

  updateLayingRecord: (recordId: string, updates: Partial<LayingRecord>) => void;
  markLaid: (recordId: string, layer: string) => void;

  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'status'>) => void;
  updateIssueStatus: (issueId: string, status: IssueStatus, handler?: string, handleResult?: string) => void;

  addRecoveryRecord: (record: Omit<RecoveryRecord, 'id' | 'createdAt'>) => void;
  updateDryStatus: (recordId: string, dryStatus: RecoveryRecord['dryStatus']) => void;

  setCurrentTask: (taskId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useAppStore = create<AppState>((set, get) => ({
  points: mockPoints,
  tasks: mockTasks,
  layingRecords: mockLayingRecords,
  issues: mockIssues,
  recoveryRecords: mockRecoveryRecords,
  currentTaskId: mockTasks[0]?.id || null,

  addPoint: (point) =>
    set((state) => ({
      points: [
        ...state.points,
        {
          ...point,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
        },
      ],
    })),

  updatePoint: (id, point) =>
    set((state) => ({
      points: state.points.map((p) => (p.id === id ? { ...p, ...point } : p)),
    })),

  deletePoint: (id) =>
    set((state) => ({
      points: state.points.filter((p) => p.id !== id),
    })),

  createRainTask: () => {
    const state = get();
    const newTask: RainTask = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      weather: '中雨',
      createdAt: new Date().toISOString(),
    };

    const activePoints = state.points.filter((p) => p.status === 'active');
    const newRecords: LayingRecord[] = activePoints.map((point) => ({
      id: generateId(),
      taskId: newTask.id,
      pointId: point.id,
      layTime: '',
      layer: '',
      matStatus: 'good' as MatStatus,
      hasWarningSign: false,
      photo: '',
      status: 'pending',
    }));

    set((state) => ({
      tasks: [newTask, ...state.tasks],
      layingRecords: [...newRecords, ...state.layingRecords],
      currentTaskId: newTask.id,
    }));

    return newTask;
  },

  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),

  updateLayingRecord: (recordId, updates) =>
    set((state) => ({
      layingRecords: state.layingRecords.map((r) =>
        r.id === recordId ? { ...r, ...updates } : r
      ),
    })),

  markLaid: (recordId, layer) =>
    set((state) => ({
      layingRecords: state.layingRecords.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'laid',
              layer,
              layTime: new Date().toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            }
          : r
      ),
    })),

  addIssue: (issue) =>
    set((state) => ({
      issues: [
        {
          ...issue,
          id: generateId(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        ...state.issues,
      ],
    })),

  updateIssueStatus: (issueId, status, handler, handleResult) =>
    set((state) => ({
      issues: state.issues.map((i) =>
        i.id === issueId
          ? {
              ...i,
              status,
              handler: handler || i.handler,
              handleTime: status === 'resolved' ? new Date().toISOString() : i.handleTime,
              handleResult: handleResult || i.handleResult,
            }
          : i
      ),
    })),

  addRecoveryRecord: (record) =>
    set((state) => ({
      recoveryRecords: [
        { ...record, id: generateId(), createdAt: new Date().toISOString() },
        ...state.recoveryRecords,
      ],
    })),

  updateDryStatus: (recordId, dryStatus) =>
    set((state) => ({
      recoveryRecords: state.recoveryRecords.map((r) =>
        r.id === recordId ? { ...r, dryStatus } : r
      ),
    })),

  setCurrentTask: (taskId) => set({ currentTaskId: taskId }),
}));
