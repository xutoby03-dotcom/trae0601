import { create } from 'zustand';
import { ExceptionRecord } from '@/types';
import { mockExceptions } from '@/data/exceptions';
import { getStorage, setStorage, generateId } from '@/utils/storage';
import { getToday, formatDateTime, isTimePassed } from '@/utils/date';

interface ExceptionState {
  exceptions: ExceptionRecord[];
  loading: boolean;
  initExceptions: () => void;
  createException: (elderlyId: string, type: 'timeout' | 'abnormal') => void;
  escalateException: (id: string) => void;
  resolveException: (id: string, data: Partial<ExceptionRecord>) => void;
  resolveElderlyTodayException: (elderlyId: string) => void;
  updateException: (id: string, data: Partial<ExceptionRecord>) => void;
  processTimeouts: (todayUnconfirmedIds: string[]) => { created: number; escalated: number };
  getOpenExceptions: () => ExceptionRecord[];
  getEscalatedExceptions: () => ExceptionRecord[];
  getExceptionByElderly: (elderlyId: string) => ExceptionRecord | undefined;
}

const STORAGE_KEY = 'exception_records';

export const useExceptionStore = create<ExceptionState>((set, get) => ({
  exceptions: [],
  loading: true,

  initExceptions: () => {
    const stored = getStorage<ExceptionRecord[]>(STORAGE_KEY, []);
    const initialData = stored.length > 0 ? stored : mockExceptions;
    set({ exceptions: initialData, loading: false });
    if (stored.length === 0) {
      setStorage(STORAGE_KEY, mockExceptions);
    }
  },

  createException: (elderlyId, type) => {
    const today = getToday();
    const existing = get().exceptions.find(
      e => e.elderlyId === elderlyId && e.exceptionDate === today && e.status !== 'resolved'
    );
    
    if (existing) return;
    
    const newException: ExceptionRecord = {
      id: generateId(),
      elderlyId,
      exceptionDate: today,
      type,
      status: 'pending',
      firstReminderTime: null,
      escalationTime: null,
      knockResult: null,
      contactedFamily: null,
      needMedical: null,
      handlingNotes: '',
      resolvedTime: null,
      resolverId: null,
    };
    
    const newList = [...get().exceptions, newException];
    set({ exceptions: newList });
    setStorage(STORAGE_KEY, newList);
  },

  escalateException: (id) => {
    const newList = get().exceptions.map(e =>
      e.id === id
        ? { ...e, status: 'escalated' as const, escalationTime: formatDateTime(new Date()) }
        : e
    );
    set({ exceptions: newList });
    setStorage(STORAGE_KEY, newList);
  },

  resolveException: (id, data) => {
    const newList = get().exceptions.map(e =>
      e.id === id
        ? {
            ...e,
            ...data,
            status: 'resolved' as const,
            resolvedTime: formatDateTime(new Date()),
            resolverId: 'user-1',
          }
        : e
    );
    set({ exceptions: newList });
    setStorage(STORAGE_KEY, newList);
  },

  resolveElderlyTodayException: (elderlyId) => {
    const today = getToday();
    const target = get().exceptions.find(
      e => e.elderlyId === elderlyId && e.exceptionDate === today && e.status !== 'resolved'
    );
    if (!target) return;
    const newList = get().exceptions.map(e =>
      e.id === target.id
        ? {
            ...e,
            status: 'resolved' as const,
            resolvedTime: formatDateTime(new Date()),
            resolverId: 'user-1',
            handlingNotes: e.handlingNotes || '老人已确认平安，异常自动关闭',
          }
        : e
    );
    set({ exceptions: newList });
    setStorage(STORAGE_KEY, newList);
  },

  updateException: (id, data) => {
    const newList = get().exceptions.map(e =>
      e.id === id ? { ...e, ...data } : e
    );
    set({ exceptions: newList });
    setStorage(STORAGE_KEY, newList);
  },

  processTimeouts: (todayUnconfirmedIds) => {
    const today = getToday();
    const now = formatDateTime(new Date());
    let createdCount = 0;
    let escalatedCount = 0;

    let newList = [...get().exceptions];

    if (isTimePassed(10)) {
      for (const elderlyId of todayUnconfirmedIds) {
        const existing = newList.find(
          e => e.elderlyId === elderlyId && e.exceptionDate === today && e.status !== 'resolved'
        );
        if (!existing) {
          newList.push({
            id: generateId(),
            elderlyId,
            exceptionDate: today,
            type: 'timeout',
            status: 'pending',
            firstReminderTime: now,
            escalationTime: null,
            knockResult: null,
            contactedFamily: null,
            needMedical: null,
            handlingNotes: '10:00已自动提醒网格员处理',
            resolvedTime: null,
            resolverId: null,
          });
          createdCount++;
        } else if (!existing.firstReminderTime) {
          newList = newList.map(e =>
            e.id === existing.id
              ? { ...e, firstReminderTime: now, handlingNotes: e.handlingNotes || '10:00已自动提醒网格员处理' }
              : e
          );
        }
      }
    }

    if (isTimePassed(12)) {
      newList = newList.map(e => {
        if (
          e.exceptionDate === today &&
          (e.status === 'pending' || e.status === 'processing') &&
          !e.escalationTime
        ) {
          escalatedCount++;
          return {
            ...e,
            status: 'escalated' as const,
            escalationTime: now,
            handlingNotes: e.handlingNotes
              ? `${e.handlingNotes}；12:00已自动升级至社区负责人`
              : '12:00已自动升级至社区负责人',
          };
        }
        return e;
      });
    }

    if (createdCount > 0 || escalatedCount > 0) {
      set({ exceptions: newList });
      setStorage(STORAGE_KEY, newList);
    }

    return { created: createdCount, escalated: escalatedCount };
  },

  getOpenExceptions: () => {
    return get().exceptions.filter(e => e.status !== 'resolved');
  },

  getEscalatedExceptions: () => {
    return get().exceptions.filter(e => e.status === 'escalated');
  },

  getExceptionByElderly: (elderlyId) => {
    const today = getToday();
    return get().exceptions.find(
      e => e.elderlyId === elderlyId && e.exceptionDate === today && e.status !== 'resolved'
    );
  },
}));
