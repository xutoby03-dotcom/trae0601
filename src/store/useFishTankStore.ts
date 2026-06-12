import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, WaterChangeRecord, Observation, Fish, Tank } from '@/types';
import { mockAppState } from '@/data/mockData';

interface FishTankStore extends AppState {
  updateTank: (data: Partial<Tank>) => void;
  addWaterChange: (record: Omit<WaterChangeRecord, 'id'>) => void;
  addObservation: (obs: Omit<Observation, 'id'>) => void;
  updateObservationStatus: (id: string, status: Observation['status']) => void;
  addFish: (fish: Omit<Fish, 'id'>) => void;
  updateFish: (id: string, data: Partial<Fish>) => void;
  updateFishStatus: (id: string, status: Fish['status']) => void;
  removeFish: (id: string) => void;
  resetToMock: () => void;
}

export const useFishTankStore = create<FishTankStore>()(
  persist(
    (set) => ({
      ...mockAppState,

      updateTank: (data) =>
        set((state) => ({
          tank: {
            ...state.tank,
            ...data,
          },
        })),

      addWaterChange: (record) =>
        set((state) => ({
          waterChanges: [
            {
              ...record,
              id: `wc-${Date.now()}`,
            },
            ...state.waterChanges,
          ],
          tank: {
            ...state.tank,
            lastWaterChange: record.date,
          },
        })),

      addObservation: (obs) =>
        set((state) => ({
          observations: [
            {
              ...obs,
              id: `obs-${Date.now()}`,
            },
            ...state.observations,
          ],
        })),

      updateObservationStatus: (id, status) =>
        set((state) => ({
          observations: state.observations.map((obs) =>
            obs.id === id ? { ...obs, status } : obs
          ),
        })),

      addFish: (fish) =>
        set((state) => ({
          fishes: [
            {
              ...fish,
              id: `fish-${Date.now()}`,
            },
            ...state.fishes,
          ],
        })),

      updateFishStatus: (id, status) =>
        set((state) => ({
          fishes: state.fishes.map((fish) =>
            fish.id === id ? { ...fish, status } : fish
          ),
        })),

      updateFish: (id, data) =>
        set((state) => ({
          fishes: state.fishes.map((fish) =>
            fish.id === id ? { ...fish, ...data } : fish
          ),
        })),

      removeFish: (id) =>
        set((state) => ({
          fishes: state.fishes.filter((fish) => fish.id !== id),
        })),

      resetToMock: () => set(mockAppState),
    }),
    {
      name: 'fish-tank-storage',
    }
  )
);
