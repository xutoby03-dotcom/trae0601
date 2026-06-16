import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Bathroom,
  Inspection,
  CleaningRecord,
  Task,
  ProcurementSpec,
  ProcurementItem,
  RiskLevel,
} from '../types';
import { generateId } from '../utils/idGenerator';
import { calculateRiskLevel, needsReplacement, getStatusFromInspection, getMoldStatusFromNotes } from '../utils/riskCalculator';
import { getToday, addDays, getDaysSince } from '../utils/dateUtils';
import {
  mockBathrooms,
  mockInspections,
  mockCleaningRecords,
  mockTasks,
  mockProcurementSpecs,
} from '../data/mockData';

interface AppState {
  bathrooms: Bathroom[];
  inspections: Inspection[];
  cleaningRecords: CleaningRecord[];
  tasks: Task[];
  procurementSpecs: ProcurementSpec[];

  addBathroom: (bathroom: Omit<Bathroom, 'id' | 'riskLevel'>) => void;
  updateBathroom: (id: string, updates: Partial<Bathroom>) => void;
  addInspection: (inspection: Omit<Inspection, 'id'>) => { createdTask: boolean; taskId?: string };
  addCleaningRecord: (record: Omit<CleaningRecord, 'id'>) => void;
  addTask: (task: Omit<Task, 'id'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addProcurementSpec: (spec: Omit<ProcurementSpec, 'id'>) => string;

  getHighRiskBathrooms: () => Bathroom[];
  getProcurementList: () => ProcurementItem[];
  getBathroomById: (id: string) => Bathroom | undefined;
  getTasksByBathroomId: (bathroomId: string) => Task[];
  getCleaningRecordsByBathroomId: (bathroomId: string) => CleaningRecord[];
  getSpecById: (id: string) => ProcurementSpec | undefined;

  checkAndCreateReplacementTask: (bathroomId: string, inspection: Inspection) => string | null;
  recalculateAllRiskLevels: () => void;
  resetStore: () => void;
}

const initialState = {
  bathrooms: mockBathrooms,
  inspections: mockInspections,
  cleaningRecords: mockCleaningRecords,
  tasks: mockTasks,
  procurementSpecs: mockProcurementSpecs,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addBathroom: (bathroom) => {
        const newBathroom: Bathroom = {
          ...bathroom,
          id: generateId(),
          riskLevel: 'safe',
        };
        newBathroom.riskLevel = calculateRiskLevel(newBathroom);
        set((state) => ({
          bathrooms: [...state.bathrooms, newBathroom],
        }));
      },

      updateBathroom: (id, updates) => {
        set((state) => ({
          bathrooms: state.bathrooms.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
        get().recalculateAllRiskLevels();
      },

      addInspection: (inspection) => {
        const newInspection: Inspection = {
          ...inspection,
          id: generateId(),
        };

        const bathroom = get().getBathroomById(inspection.bathroomId);
        if (bathroom) {
          const moldStatus = getMoldStatusFromNotes(inspection.notes);
          get().updateBathroom(bathroom.id, {
            suctionStatus: getStatusFromInspection(inspection.adsorptionOk),
            cornerStatus: inspection.adsorptionOk ? 'good' : 'poor',
            moldStatus,
            lastInspectionDate: inspection.inspectionDate,
          });
        }

        set((state) => ({
          inspections: [...state.inspections, newInspection],
        }));

        const taskId = get().checkAndCreateReplacementTask(
          inspection.bathroomId,
          newInspection
        );

        return {
          createdTask: taskId !== null,
          taskId: taskId || undefined,
        };
      },

      addCleaningRecord: (record) => {
        const newRecord: CleaningRecord = {
          ...record,
          id: generateId(),
        };

        get().updateBathroom(record.bathroomId, {
          lastCleaningDate: record.cleaningDate,
        });

        set((state) => ({
          cleaningRecords: [...state.cleaningRecords, newRecord],
        }));
      },

      addTask: (task) => {
        const id = generateId();
        const newTask: Task = {
          ...task,
          id,
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
        return id;
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },

      addProcurementSpec: (spec) => {
        const id = generateId();
        const newSpec: ProcurementSpec = {
          ...spec,
          id,
        };
        set((state) => ({
          procurementSpecs: [...state.procurementSpecs, newSpec],
        }));
        return id;
      },

      getHighRiskBathrooms: () => {
        return get().bathrooms.filter((b) => b.riskLevel === 'danger' || b.riskLevel === 'warning');
      },

      getProcurementList: () => {
        const { tasks, procurementSpecs, bathrooms } = get();
        const items: ProcurementItem[] = [];

        tasks
          .filter((t) => t.status !== 'completed' && t.procurementSpecId)
          .forEach((task) => {
            const spec = procurementSpecs.find((s) => s.id === task.procurementSpecId);
            const bathroom = bathrooms.find((b) => b.id === task.bathroomId);
            if (spec && bathroom) {
              const urgency = task.status === 'pending' ? 'high' : task.dueDate < getToday() ? 'high' : 'medium';
              items.push({
                spec,
                bathroomName: bathroom.name,
                urgency,
              });
            }
          });

        return items;
      },

      getBathroomById: (id) => {
        return get().bathrooms.find((b) => b.id === id);
      },

      getTasksByBathroomId: (bathroomId) => {
        return get().tasks.filter((t) => t.bathroomId === bathroomId);
      },

      getCleaningRecordsByBathroomId: (bathroomId) => {
        return get().cleaningRecords.filter((r) => r.bathroomId === bathroomId);
      },

      getSpecById: (id) => {
        return get().procurementSpecs.find((s) => s.id === id);
      },

      checkAndCreateReplacementTask: (bathroomId, inspection) => {
        const bathroom = get().getBathroomById(bathroomId);
        if (!bathroom) return null;

        if (!needsReplacement(bathroom, inspection)) {
          return null;
        }

        const existingPendingTask = get()
          .getTasksByBathroomId(bathroomId)
          .find((t) => t.type === 'replace' && t.status !== 'completed');
        if (existingPendingTask) {
          return existingPendingTask.id;
        }

        const specId = get().addProcurementSpec({
          name: `防滑垫（${bathroom.name}）`,
          size: bathroom.matSize,
          material: bathroom.matMaterial,
          suctionCups: bathroom.suctionCupsCount,
          thickness: '5mm',
          color: '灰色',
          notes: '老人使用，需要强力吸盘，表面有防滑纹理',
          quantity: 1,
        });

        const reason = [];
        if (bathroom.moldStatus === 'severe') reason.push('霉斑严重');
        if (bathroom.suctionStatus === 'poor') reason.push('吸盘松动');
        if (!inspection.adsorptionOk) reason.push('吸附力不足');
        const usageDays = getDaysSince(bathroom.purchaseDate);
        if (usageDays > bathroom.recommendedLifespanDays) {
          reason.push(`已使用${usageDays}天，超过使用寿命`);
        }

        const taskId = get().addTask({
          bathroomId,
          type: 'replace',
          status: 'pending',
          createdDate: getToday(),
          dueDate: addDays(getToday(), 7),
          reason: reason.join('；'),
          procurementSpecId: specId,
        });

        return taskId;
      },

      recalculateAllRiskLevels: () => {
        set((state) => ({
          bathrooms: state.bathrooms.map((b) => ({
            ...b,
            riskLevel: calculateRiskLevel(b) as RiskLevel,
          })),
        }));
      },

      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: 'bathroom-safety-storage',
    }
  )
);
