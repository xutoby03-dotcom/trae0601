import { create } from 'zustand';
import type { Exception, ExceptionStatus, ExceptionType } from '../types';
import { mockExceptions } from '../mock/exceptions';
import { generateId } from '../utils/date';

interface ExceptionState {
  exceptions: Exception[];
  loading: boolean;
  fetchExceptions: () => void;
  addException: (exception: Omit<Exception, 'id' | 'status' | 'createdAt'>) => Exception;
  updateException: (id: string, data: Partial<Exception>) => void;
  deleteException: (id: string) => void;
  updateStatus: (id: string, status: ExceptionStatus) => void;
  getExceptionById: (id: string) => Exception | undefined;
  getExceptionsByStatus: (status: ExceptionStatus) => Exception[];
  getExceptionsByType: (type: ExceptionType) => Exception[];
  getUnresolvedCount: () => number;
}

const STORAGE_KEY = 'poster_management_exceptions';

const loadFromStorage = (): Exception[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load exceptions from storage:', e);
  }
  return mockExceptions;
};

const saveToStorage = (exceptions: Exception[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(exceptions));
  } catch (e) {
    console.error('Failed to save exceptions to storage:', e);
  }
};

export const useExceptionStore = create<ExceptionState>((set, get) => ({
  exceptions: loadFromStorage(),
  loading: false,

  fetchExceptions: () => {
    set({ loading: true });
    const exceptions = loadFromStorage();
    set({ exceptions, loading: false });
  },

  addException: (exceptionData) => {
    const newException: Exception = {
      ...exceptionData,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const exceptions = [...get().exceptions, newException];
    set({ exceptions });
    saveToStorage(exceptions);
    return newException;
  },

  updateException: (id, data) => {
    const exceptions = get().exceptions.map((e) =>
      e.id === id ? { ...e, ...data } : e
    );
    set({ exceptions });
    saveToStorage(exceptions);
  },

  deleteException: (id) => {
    const exceptions = get().exceptions.filter((e) => e.id !== id);
    set({ exceptions });
    saveToStorage(exceptions);
  },

  updateStatus: (id, status) => {
    const exceptions = get().exceptions.map((e) =>
      e.id === id
        ? {
            ...e,
            status,
            resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
          }
        : e
    );
    set({ exceptions });
    saveToStorage(exceptions);
  },

  getExceptionById: (id) => {
    return get().exceptions.find((e) => e.id === id);
  },

  getExceptionsByStatus: (status) => {
    return get().exceptions.filter((e) => e.status === status);
  },

  getExceptionsByType: (type) => {
    return get().exceptions.filter((e) => e.type === type);
  },

  getUnresolvedCount: () => {
    return get().exceptions.filter((e) => e.status !== 'resolved').length;
  },
}));
