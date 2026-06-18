import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RecoveryPoint } from '../types';
import { mockRecoveryPoints } from '../data/recoveryPoints';
import { generateId } from '../utils/formatters';
import { calculateStatus } from '../utils/calculations';

interface RecoveryPointsState {
  recoveryPoints: RecoveryPoint[];
  addRecoveryPoint: (point: Omit<RecoveryPoint, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateRecoveryPoint: (id: string, updates: Partial<RecoveryPoint>) => void;
  deleteRecoveryPoint: (id: string) => void;
  getRecoveryPoint: (id: string) => RecoveryPoint | undefined;
  updateCurrentWeight: (id: string, weightKg: number, increment: boolean) => void;
  updateStatus: (id: string) => void;
  resetMockData: () => void;
}

export const useRecoveryPointsStore = create<RecoveryPointsState>()(
  persist(
    (set, get) => ({
      recoveryPoints: mockRecoveryPoints,
      
      addRecoveryPoint: (point) => {
        const newPoint: RecoveryPoint = {
          ...point,
          id: generateId(),
          status: 'normal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        newPoint.status = calculateStatus(newPoint);
        set((state) => ({
          recoveryPoints: [...state.recoveryPoints, newPoint],
        }));
      },
      
      updateRecoveryPoint: (id, updates) => {
        set((state) => ({
          recoveryPoints: state.recoveryPoints.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
        get().updateStatus(id);
      },
      
      deleteRecoveryPoint: (id) => {
        set((state) => ({
          recoveryPoints: state.recoveryPoints.filter((p) => p.id !== id),
        }));
      },
      
      getRecoveryPoint: (id) => {
        return get().recoveryPoints.find((p) => p.id === id);
      },
      
      updateCurrentWeight: (id, weightKg, increment) => {
        set((state) => ({
          recoveryPoints: state.recoveryPoints.map((p) => {
            if (p.id === id) {
              const newWeight = increment
                ? p.currentKg + weightKg
                : Math.max(0, p.currentKg - weightKg);
              const updated = { ...p, currentKg: newWeight, updatedAt: new Date().toISOString() };
              updated.status = calculateStatus(updated);
              return updated;
            }
            return p;
          }),
        }));
      },
      
      updateStatus: (id) => {
        set((state) => ({
          recoveryPoints: state.recoveryPoints.map((p) =>
            p.id === id ? { ...p, status: calculateStatus(p) } : p
          ),
        }));
      },
      
      resetMockData: () => {
        set({ recoveryPoints: mockRecoveryPoints });
      },
    }),
    {
      name: 'recovery-points-storage',
    }
  )
);
