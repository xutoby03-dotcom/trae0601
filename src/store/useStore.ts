import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Point,
  InspectionRecord,
  AnomalyTicket,
  PointFormValues,
  InspectionFormValues,
} from '../types';
import { initialPoints, initialInspectionRecords, initialAnomalyTickets } from '../utils/mock';
import { generateId, addDays, formatDate } from '../utils/helpers';

interface StoreState {
  points: Point[];
  inspectionRecords: InspectionRecord[];
  anomalyTickets: AnomalyTicket[];
  currentUser: string;

  addPoint: (values: PointFormValues) => void;
  updatePoint: (id: string, values: PointFormValues) => void;
  deletePoint: (id: string) => void;

  addInspectionRecord: (values: InspectionFormValues) => void;

  updateAnomalyStatus: (
    id: string,
    status: AnomalyTicket['status'],
    operator: string,
    repairer?: string
  ) => void;

  getPointById: (id: string) => Point | undefined;
  getRecordsByPointId: (pointId: string) => InspectionRecord[];
  getTicketByRecordId: (recordId: string) => AnomalyTicket | undefined;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      points: initialPoints,
      inspectionRecords: initialInspectionRecords,
      anomalyTickets: initialAnomalyTickets,
      currentUser: '管理员',

      addPoint: (values) => {
        const now = new Date().toISOString();
        const newPoint: Point = {
          id: generateId(),
          ...values,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ points: [...state.points, newPoint] }));
      },

      updatePoint: (id, values) => {
        const now = new Date().toISOString();
        set((state) => ({
          points: state.points.map((p) =>
            p.id === id ? { ...p, ...values, updatedAt: now } : p
          ),
        }));
      },

      deletePoint: (id) => {
        set((state) => ({
          points: state.points.filter((p) => p.id !== id),
          inspectionRecords: state.inspectionRecords.filter((r) => r.pointId !== id),
          anomalyTickets: state.anomalyTickets.filter((t) => t.pointId !== id),
        }));
      },

      addInspectionRecord: (values) => {
        const now = new Date().toISOString();
        const newRecord: InspectionRecord = {
          id: generateId(),
          ...values,
          inspectionTime: now,
          createdAt: now,
        };

        const point = get().points.find((p) => p.id === values.pointId);
        const nextDate = addDays(now, point?.inspectionCycle || 30);

        set((state) => {
          const newTickets = [...state.anomalyTickets];
          if (values.status === 'anomaly' && values.anomalyDescription) {
            const newTicket: AnomalyTicket = {
              id: generateId(),
              inspectionRecordId: newRecord.id,
              pointId: values.pointId,
              status: 'pending',
              description: values.anomalyDescription,
              reporter: values.inspector,
              reportTime: now,
              createdAt: now,
              updatedAt: now,
            };
            newTickets.push(newTicket);
          }

          return {
            inspectionRecords: [...state.inspectionRecords, newRecord],
            points: state.points.map((p) =>
              p.id === values.pointId
                ? {
                    ...p,
                    lastInspectionDate: formatDate(now),
                    nextInspectionDate: nextDate,
                    updatedAt: now,
                  }
                : p
            ),
            anomalyTickets: newTickets,
          };
        });
      },

      updateAnomalyStatus: (id, status, operator, repairer) => {
        const now = new Date().toISOString();
        set((state) => ({
          anomalyTickets: state.anomalyTickets.map((t) => {
            if (t.id !== id) return t;
            const updates: Partial<AnomalyTicket> = {
              status,
              updatedAt: now,
            };
            if (status === 'reported' && repairer) {
              updates.repairer = repairer;
              updates.repairTime = now;
            }
            if (status === 'reviewed') {
              updates.reviewer = operator;
              updates.reviewTime = now;
            }
            return { ...t, ...updates };
          }),
        }));
      },

      getPointById: (id) => {
        return get().points.find((p) => p.id === id);
      },

      getRecordsByPointId: (pointId) => {
        return get().inspectionRecords.filter((r) => r.pointId === pointId);
      },

      getTicketByRecordId: (recordId) => {
        return get().anomalyTickets.find((t) => t.inspectionRecordId === recordId);
      },
    }),
    {
      name: 'fire-inspection-storage',
    }
  )
);
