import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exception } from '../types';
import { mockExceptions } from '../data/exceptions';
import { generateId } from '../utils/formatters';

interface ExceptionsState {
  exceptions: Exception[];
  addException: (
    exception: Omit<Exception, 'id' | 'createdAt' | 'status'>
  ) => void;
  updateException: (id: string, updates: Partial<Exception>) => void;
  deleteException: (id: string) => void;
  getException: (id: string) => Exception | undefined;
  getPendingExceptions: () => Exception[];
  getExceptionsByRecoveryPoint: (recoveryPointId: string) => Exception[];
  getExceptionsByType: (type: string) => Exception[];
  handleException: (id: string, handler: string) => void;
  resolveException: (id: string, handler: string) => void;
  resetMockData: () => void;
}

export const useExceptionsStore = create<ExceptionsState>()(
  persist(
    (set, get) => ({
      exceptions: mockExceptions,
      
      addException: (exception) => {
        const newException: Exception = {
          ...exception,
          id: generateId(),
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        set((state) => ({
          exceptions: [...state.exceptions, newException],
        }));
      },
      
      updateException: (id, updates) => {
        set((state) => ({
          exceptions: state.exceptions.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        }));
      },
      
      deleteException: (id) => {
        set((state) => ({
          exceptions: state.exceptions.filter((e) => e.id !== id),
        }));
      },
      
      getException: (id) => {
        return get().exceptions.find((e) => e.id === id);
      },
      
      getPendingExceptions: () => {
        return get().exceptions.filter((e) => e.status !== 'resolved');
      },
      
      getExceptionsByRecoveryPoint: (recoveryPointId) => {
        return get().exceptions.filter(
          (e) => e.recoveryPointId === recoveryPointId
        );
      },
      
      getExceptionsByType: (type) => {
        return get().exceptions.filter((e) => e.type === type);
      },
      
      handleException: (id, handler) => {
        set((state) => ({
          exceptions: state.exceptions.map((e) =>
            e.id === id
              ? { ...e, status: 'handling', handler }
              : e
          ),
        }));
      },
      
      resolveException: (id, handler) => {
        set((state) => ({
          exceptions: state.exceptions.map((e) =>
            e.id === id
              ? {
                  ...e,
                  status: 'resolved',
                  handler,
                  handledAt: new Date().toISOString(),
                }
              : e
          ),
        }));
      },
      
      resetMockData: () => {
        set({ exceptions: mockExceptions });
      },
    }),
    {
      name: 'exceptions-storage',
    }
  )
);
