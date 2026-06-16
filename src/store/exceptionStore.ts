import { create } from 'zustand';
import { ExceptionRecord } from '@/types';
import { mockExceptions } from '@/data/exceptions';
import { getStorage, setStorage, generateId } from '@/utils/storage';
import { getToday, formatDateTime } from '@/utils/date';

interface ExceptionState {
  exceptions: ExceptionRecord[];
  loading: boolean;
  initExceptions: () => void;
  createException: (elderlyId: string, type: 'timeout' | 'abnormal') => void;
  escalateException: (id: string) => void;
  resolveException: (id: string, data: Partial<ExceptionRecord>) => void;
  updateException: (id: string, data: Partial<ExceptionRecord>) => void;
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

  updateException: (id, data) => {
    const newList = get().exceptions.map(e =>
      e.id === id ? { ...e, ...data } : e
    );
    set({ exceptions: newList });
    setStorage(STORAGE_KEY, newList);
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
