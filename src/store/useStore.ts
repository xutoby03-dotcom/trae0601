import { create } from 'zustand';
import {
  PetCase,
  VisitPlan,
  VisitRecord,
  Alert,
  DoctorMark,
} from '@/types';
import {
  mockCases,
  mockVisitPlans,
  mockVisitRecords,
  mockAlerts,
  generateVisitPlansForCase,
} from '@/data/mockData';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { generateId } from '@/utils/id';
import { getTodayString, isDatePast, isDateToday } from '@/utils/date';

interface StoreState {
  cases: PetCase[];
  visitPlans: VisitPlan[];
  visitRecords: VisitRecord[];
  alerts: Alert[];

  addCase: (caseData: Omit<PetCase, 'id' | 'status' | 'createdAt'>) => PetCase;

  addVisitRecord: (
    record: Omit<VisitRecord, 'id' | 'createdAt'>
  ) => VisitRecord;
  updateVisitDoctorMark: (
    recordId: string,
    mark: DoctorMark,
    note?: string
  ) => void;

  getUnreadAlertsCount: () => number;
  markAlertRead: (alertId: string) => void;
  markAlertHandled: (alertId: string) => void;
  markAlertIgnored: (alertId: string) => void;

  checkAndGenerateAlerts: () => void;
}

const STORAGE_KEY = 'pet-clinic-postop-data-v3';

interface StoredData {
  cases: PetCase[];
  visitPlans: VisitPlan[];
  visitRecords: VisitRecord[];
  alerts: Alert[];
}

function getInitialData(): StoredData {
  const stored = loadFromStorage<StoredData | null>(STORAGE_KEY, null);
  if (stored) {
    return stored;
  }
  return {
    cases: mockCases,
    visitPlans: mockVisitPlans,
    visitRecords: mockVisitRecords,
    alerts: mockAlerts,
  };
}

function persist(data: StoredData) {
  saveToStorage(STORAGE_KEY, data);
}

export function getTodayVisitsFromState(
  cases: PetCase[],
  visitPlans: VisitPlan[]
) {
  return visitPlans
    .filter((p) => isDateToday(p.planDate) && p.status === 'pending')
    .map((p) => ({
      ...p,
      petCase: cases.find((c) => c.id === p.caseId)!,
    }))
    .filter((item) => item.petCase);
}

export function getAbnormalCasesFromState(
  cases: PetCase[],
  visitRecords: VisitRecord[]
) {
  return cases
    .map((c) => {
      const caseRecords = visitRecords
        .filter((r) => r.caseId === c.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      const latestRecord = caseRecords.length > 0 ? caseRecords[0] : undefined;
      if (
        latestRecord &&
        (latestRecord.doctorMark === 'observation' ||
          latestRecord.doctorMark === 'recheck')
      ) {
        return { ...c, latestRecord };
      }
      return null;
    })
    .filter((item): item is PetCase & { latestRecord: VisitRecord } => item !== null);
}

export function getUnrepliedOwnersFromState(
  cases: PetCase[],
  visitRecords: VisitRecord[]
) {
  return cases
    .map((c) => {
      const caseRecords = visitRecords
        .filter((r) => r.caseId === c.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      const latestRecord = caseRecords.length > 0 ? caseRecords[0] : undefined;
      if (latestRecord && !latestRecord.ownerReplied) {
        return { ...c, latestRecord };
      }
      return null;
    })
    .filter((item): item is PetCase & { latestRecord: VisitRecord } => item !== null);
}

export function getRecheckSchedulesFromState(
  cases: PetCase[],
  visitRecords: VisitRecord[]
) {
  return cases
    .map((c) => {
      const caseRecords = visitRecords
        .filter((r) => r.caseId === c.id)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      const latestRecord = caseRecords.length > 0 ? caseRecords[0] : undefined;
      if (latestRecord && latestRecord.doctorMark === 'recheck') {
        return { ...c, latestRecord };
      }
      return null;
    })
    .filter((item): item is PetCase & { latestRecord: VisitRecord } => item !== null);
}

export const useStore = create<StoreState>((set, get) => {
  const initialData = getInitialData();

  return {
    cases: initialData.cases,
    visitPlans: initialData.visitPlans,
    visitRecords: initialData.visitRecords,
    alerts: initialData.alerts,

    addCase: (caseData) => {
      const newCase: PetCase = {
        ...caseData,
        id: generateId(),
        status: 'active',
        createdAt: getTodayString(),
      };
      const newPlans = generateVisitPlansForCase(newCase.id, newCase.dischargeDate);
      set((state) => {
        const newState = {
          cases: [...state.cases, newCase],
          visitPlans: [...state.visitPlans, ...newPlans],
        };
        persist({
          ...newState,
          visitRecords: state.visitRecords,
          alerts: state.alerts,
        });
        return newState;
      });
      return newCase;
    },

    addVisitRecord: (record) => {
      const newRecord: VisitRecord = {
        ...record,
        id: generateId(),
        createdAt: getTodayString(),
      };
      set((state) => {
        const updatedPlans = state.visitPlans.map((p) =>
          p.id === record.planId ? { ...p, status: 'completed' as const } : p
        );
        const newState = {
          visitRecords: [...state.visitRecords, newRecord],
          visitPlans: updatedPlans,
        };
        persist({
          cases: state.cases,
          ...newState,
          alerts: state.alerts,
        });
        return newState;
      });

      setTimeout(() => get().checkAndGenerateAlerts(), 0);

      return newRecord;
    },

    updateVisitDoctorMark: (recordId, mark, note) => {
      set((state) => {
        const updatedRecords = state.visitRecords.map((r) =>
          r.id === recordId
            ? { ...r, doctorMark: mark, doctorNote: note || r.doctorNote }
            : r
        );
        const newState = { visitRecords: updatedRecords };
        persist({
          cases: state.cases,
          visitPlans: state.visitPlans,
          ...newState,
          alerts: state.alerts,
        });
        return newState;
      });

      setTimeout(() => get().checkAndGenerateAlerts(), 0);
    },

    getUnreadAlertsCount: () => {
      return get().alerts.filter((a) => a.status === 'unread').length;
    },

    markAlertRead: (alertId) => {
      set((state) => {
        const updatedAlerts = state.alerts.map((a) =>
          a.id === alertId ? { ...a, status: 'read' as const } : a
        );
        const newState = { alerts: updatedAlerts };
        persist({
          cases: state.cases,
          visitPlans: state.visitPlans,
          visitRecords: state.visitRecords,
          ...newState,
        });
        return newState;
      });
    },

    markAlertHandled: (alertId) => {
      set((state) => {
        const updatedAlerts = state.alerts.map((a) =>
          a.id === alertId ? { ...a, status: 'handled' as const } : a
        );
        const newState = { alerts: updatedAlerts };
        persist({
          cases: state.cases,
          visitPlans: state.visitPlans,
          visitRecords: state.visitRecords,
          ...newState,
        });
        return newState;
      });
    },

    markAlertIgnored: (alertId) => {
      set((state) => {
        const updatedAlerts = state.alerts.map((a) =>
          a.id === alertId ? { ...a, status: 'ignored' as const } : a
        );
        const newState = { alerts: updatedAlerts };
        persist({
          cases: state.cases,
          visitPlans: state.visitPlans,
          visitRecords: state.visitRecords,
          ...newState,
        });
        return newState;
      });
    },

    checkAndGenerateAlerts: () => {
      const { cases, visitPlans, visitRecords, alerts } = get();
      const newAlerts: Alert[] = [];
      const today = getTodayString();

      visitPlans.forEach((plan) => {
        if (plan.status === 'pending' && isDatePast(plan.planDate) && !isDateToday(plan.planDate)) {
          const exists = alerts.some(
            (a) => a.type === 'missed_visit' && a.caseId === plan.caseId && a.createdAt === today
          );
          if (!exists) {
            const petCase = cases.find((c) => c.id === plan.caseId);
            if (petCase) {
              newAlerts.push({
                id: generateId(),
                caseId: plan.caseId,
                type: 'missed_visit',
                level: 'warning',
                title: '漏回访提醒',
                description: `${petCase.petName}（主人：${petCase.ownerName}）第${plan.dayNumber}天回访已错过，请尽快联系主人完成回访`,
                status: 'unread',
                createdAt: today,
              });
            }
          }
        }
      });

      visitRecords.forEach((record) => {
        if (record.abnormalDesc.includes('红肿') || record.abnormalDesc.includes('发炎')) {
          const exists = alerts.some(
            (a) => a.type === 'wound_redness' && a.caseId === record.caseId
          );
          if (!exists) {
            const petCase = cases.find((c) => c.id === record.caseId);
            if (petCase) {
              newAlerts.push({
                id: generateId(),
                caseId: record.caseId,
                type: 'wound_redness',
                level: 'warning',
                title: '伤口红肿提醒',
                description: `${petCase.petName}（主人：${petCase.ownerName}）回访记录显示伤口有红肿情况，需关注`,
                status: 'unread',
                createdAt: today,
              });
            }
          }
        }

        if (record.appetite === 1) {
          const exists = alerts.some(
            (a) => a.type === 'refuse_food' && a.caseId === record.caseId
          );
          if (!exists) {
            const petCase = cases.find((c) => c.id === record.caseId);
            if (petCase) {
              newAlerts.push({
                id: generateId(),
                caseId: record.caseId,
                type: 'refuse_food',
                level: 'danger',
                title: '拒食超过24小时',
                description: `${petCase.petName}（主人：${petCase.ownerName}）回访记录显示食欲极差，疑似拒食超过24小时`,
                status: 'unread',
                createdAt: today,
              });
            }
          }
        }

        if (record.doctorMark === 'recheck') {
          const exists = alerts.some(
            (a) => a.type === 'recheck_schedule' && a.caseId === record.caseId
          );
          if (!exists) {
            const petCase = cases.find((c) => c.id === record.caseId);
            if (petCase) {
              newAlerts.push({
                id: generateId(),
                caseId: record.caseId,
                type: 'recheck_schedule',
                level: 'warning',
                title: '复诊安排提醒',
                description: `${petCase.petName}（主人：${petCase.ownerName}）已标注需要尽快复诊，请确认复诊安排`,
                status: 'unread',
                createdAt: today,
              });
            }
          }
        }
      });

      if (newAlerts.length > 0) {
        set((state) => {
          const newState = { alerts: [...state.alerts, ...newAlerts] };
          persist({
            cases: state.cases,
            visitPlans: state.visitPlans,
            visitRecords: state.visitRecords,
            ...newState,
          });
          return newState;
        });
      }
    },
  };
});
