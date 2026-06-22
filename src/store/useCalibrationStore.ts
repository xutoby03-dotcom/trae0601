import { create } from 'zustand';
import type {
  CalibrationTask,
  ColorPlate,
  FinalParams,
  PrintIssue,
  PrintIssueType,
} from '../types/calibration';
import { DEFAULT_ISSUES } from '../types/calibration';
import { storage, generateTaskNo, uid } from '../utils/storage';

interface CalibrationState {
  task: CalibrationTask;
  selectedPlateId: string | null;
  setTask: (task: CalibrationTask) => void;
  updateTaskInfo: (patch: Partial<CalibrationTask>) => void;
  addPlate: () => void;
  removePlate: (plateId: string) => void;
  updatePlate: (plateId: string, patch: Partial<ColorPlate>) => void;
  selectPlate: (plateId: string | null) => void;
  toggleIssue: (plateId: string, issueType: PrintIssueType) => void;
  updateIssueRemark: (plateId: string, issueType: PrintIssueType, remark: string) => void;
  setFinalParams: (params: FinalParams) => void;
  completeTask: () => void;
  saveToStorage: () => void;
}

const createInitialPlate = (index: number): ColorPlate => ({
  id: uid(),
  plateNumber: `P${String(index + 1).padStart(2, '0')}`,
  colorName: '',
  colorHex: '#1a1a1a',
  offsetX: 0,
  offsetY: 0,
  testCount: 0,
  pinPositionX: 0,
  pinPositionY: 0,
  issues: DEFAULT_ISSUES.map(i => ({ ...i })),
  status: 'pending',
});

const createInitialTask = (): CalibrationTask => {
  const now = new Date().toISOString();
  return {
    id: uid(),
    taskNo: generateTaskNo(),
    paperBatch: '',
    paperType: '宣纸',
    createdAt: now,
    updatedAt: now,
    plates: [createInitialPlate(0)],
    finalParams: null,
    isCompleted: false,
  };
};

export const useCalibrationStore = create<CalibrationState>((set, get) => ({
  task: createInitialTask(),
  selectedPlateId: null,

  setTask: (task) => set({ task, selectedPlateId: task.plates[0]?.id ?? null }),

  updateTaskInfo: (patch) =>
    set(state => ({
      task: { ...state.task, ...patch, updatedAt: new Date().toISOString() },
    })),

  addPlate: () =>
    set(state => {
      const newPlate = createInitialPlate(state.task.plates.length);
      const plates = [...state.task.plates, newPlate];
      return {
        task: { ...state.task, plates, updatedAt: new Date().toISOString() },
        selectedPlateId: newPlate.id,
      };
    }),

  removePlate: (plateId) =>
    set(state => {
      const plates = state.task.plates.filter(p => p.id !== plateId);
      const selected =
        state.selectedPlateId === plateId
          ? plates[0]?.id ?? null
          : state.selectedPlateId;
      return {
        task: { ...state.task, plates, updatedAt: new Date().toISOString() },
        selectedPlateId: selected,
      };
    }),

  updatePlate: (plateId, patch) =>
    set(state => ({
      task: {
        ...state.task,
        plates: state.task.plates.map(p =>
          p.id === plateId ? { ...p, ...patch } : p
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  selectPlate: (plateId) => set({ selectedPlateId: plateId }),

  toggleIssue: (plateId, issueType) =>
    set(state => ({
      task: {
        ...state.task,
        plates: state.task.plates.map(p =>
          p.id === plateId
            ? {
                ...p,
                issues: p.issues.map(i =>
                  i.type === issueType ? { ...i, marked: !i.marked } : i
                ),
              }
            : p
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  updateIssueRemark: (plateId, issueType, remark) =>
    set(state => ({
      task: {
        ...state.task,
        plates: state.task.plates.map(p =>
          p.id === plateId
            ? {
                ...p,
                issues: p.issues.map(i =>
                  i.type === issueType ? { ...i, remark } : i
                ),
              }
            : p
        ),
        updatedAt: new Date().toISOString(),
      },
    })),

  setFinalParams: (params) =>
    set(state => ({
      task: {
        ...state.task,
        finalParams: params,
        updatedAt: new Date().toISOString(),
      },
    })),

  completeTask: () =>
    set(state => ({
      task: {
        ...state.task,
        isCompleted: true,
        updatedAt: new Date().toISOString(),
      },
    })),

  saveToStorage: () => {
    storage.upsertTask(get().task);
  },
}));
