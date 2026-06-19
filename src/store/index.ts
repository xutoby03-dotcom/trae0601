import { create } from 'zustand';
import type { Seal, Application, SealRecord, ApplicationStatus, RecordStatus } from '@/types';
import { mockSeals, mockApplications, mockRecords } from '@/data/mockData';

interface StoreState {
  seals: Seal[];
  applications: Application[];
  records: SealRecord[];

  addSeal: (seal: Omit<Seal, 'id' | 'createdAt'>) => void;
  updateSeal: (id: string, data: Partial<Seal>) => void;
  deleteSeal: (id: string) => void;

  addApplication: (app: Omit<Application, 'id' | 'status' | 'createdAt'>) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus, rejectReason?: string) => void;

  addRecord: (record: Omit<SealRecord, 'id'>) => string;
  returnRecord: (
    recordId: string,
    data: { actualReturnTime: string; stampedDocumentCount: number; hasAnomaly: boolean; anomalyRemark?: string; purposeMismatch?: boolean }
  ) => void;
  checkOverdue: () => void;

  getSealById: (id: string) => Seal | undefined;
  getApplicationById: (id: string) => Application | undefined;
  getRecordById: (id: string) => SealRecord | undefined;
  getRecordByApplicationId: (applicationId: string) => SealRecord | undefined;
}

const generateId = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<StoreState>((set, get) => ({
  seals: mockSeals,
  applications: mockApplications,
  records: mockRecords,

  addSeal: (seal) =>
    set((state) => ({
      seals: [
        ...state.seals,
        {
          ...seal,
          id: generateId(),
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateSeal: (id, data) =>
    set((state) => ({
      seals: state.seals.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),

  deleteSeal: (id) =>
    set((state) => ({
      seals: state.seals.filter((s) => s.id !== id),
    })),

  addApplication: (app) =>
    set((state) => ({
      applications: [
        ...state.applications,
        {
          ...app,
          id: generateId(),
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  updateApplicationStatus: (id, status, rejectReason) =>
    set((state) => ({
      applications: state.applications.map((a) =>
        a.id === id ? { ...a, status, rejectReason } : a
      ),
    })),

  addRecord: (record) => {
    const id = generateId();
    set((state) => ({
      records: [...state.records, { ...record, id }],
      seals: state.seals.map((s) =>
        s.id === record.sealId ? { ...s, status: 'in_use' as const } : s
      ),
    }));
    return id;
  },

  returnRecord: (recordId, data) =>
    set((state) => {
      const record = state.records.find((r) => r.id === recordId);
      const isOverdue = record
        ? new Date(data.actualReturnTime) > new Date(state.applications.find((a) => a.id === record.applicationId)?.expectedReturn || '')
        : false;
      return {
        records: state.records.map((r) =>
          r.id === recordId
            ? {
                ...r,
                ...data,
                status: (isOverdue || data.purposeMismatch ? 'overdue' : 'returned') as RecordStatus,
              }
            : r
        ),
        seals: state.seals.map((s) => {
          const rec = state.records.find((r) => r.id === recordId);
          return rec && s.id === rec.sealId ? { ...s, status: 'available' as const } : s;
        }),
      };
    }),

  checkOverdue: () =>
    set((state) => {
      const now = new Date();
      return {
        applications: state.applications.map((a) => {
          if (
            (a.status === 'checked_out' || a.status === 'approved') &&
            new Date(a.expectedReturn) < now
          ) {
            return { ...a, status: 'overdue' as ApplicationStatus };
          }
          return a;
        }),
        records: state.records.map((r) => {
          const app = state.applications.find((a) => a.id === r.applicationId);
          if (r.status === 'checked_out' && app && new Date(app.expectedReturn) < now) {
            return { ...r, status: 'overdue' as RecordStatus };
          }
          return r;
        }),
      };
    }),

  getSealById: (id) => get().seals.find((s) => s.id === id),
  getApplicationById: (id) => get().applications.find((a) => a.id === id),
  getRecordById: (id) => get().records.find((r) => r.id === id),
  getRecordByApplicationId: (applicationId) =>
    get().records.find((r) => r.applicationId === applicationId),
}));
