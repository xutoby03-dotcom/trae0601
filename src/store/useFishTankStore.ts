import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, WaterChangeRecord, Observation, Fish } from '@/types';
import { mockAppState } from '@/data/mockData';

interface FishTankStore extends AppState {
  addWaterChange: (record: Omit<WaterChangeRecord, 'id'>) => void;
  addObservation: (obs: Omit<Observation, 'id'>) => void;
  updateObservationStatus: (id: string, status: Observation['status']) => void;
  addFish: (fish: Omit<Fish, 'id'>) => void;
  updateFishStatus: (id: string, status: Fish['status']) => void;
  resetToMock: () => void;
}

export const useFishTankStore = create<FishTankStore>()(
  persist(
    (set) => ({
      ...mockAppState,

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

      resetToMock: () => set(mockAppState),
    }),
    {
      name: 'fish-tank-storage',
    }
  )
);
