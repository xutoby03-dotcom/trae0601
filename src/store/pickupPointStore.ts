import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PickupPoint, PickupRecord, PickupPointStats } from '../types';
import { mockPickupPoints } from '../data/mockData';

interface PickupPointState {
  pickupPoints: PickupPoint[];
  currentPickupPoint: string;
  pickupRecords: PickupRecord[];
  setCurrentPickupPoint: (id: string) => void;
  addPickupPoint: (point: Omit<PickupPoint, 'id'>) => void;
  getCurrentPickupPoint: () => PickupPoint | undefined;
  addPickupRecord: (record: Omit<PickupRecord, 'id'>) => void;
  getPickupPointStats: (pickupPointId: string) => PickupPointStats;
  getAllPickupPointStats: () => PickupPointStats[];
  getLongestQueuePoint: () => PickupPointStats | null;
}

export const usePickupPointStore = create<PickupPointState>()(
  persist(
    (set, get) => ({
      pickupPoints: mockPickupPoints,
      currentPickupPoint: mockPickupPoints[0]?.id || '',
      pickupRecords: [],

      setCurrentPickupPoint: (id) => set({ currentPickupPoint: id }),

      addPickupPoint: (point) => set((state) => ({
        pickupPoints: [
          ...state.pickupPoints,
          { ...point, id: `pp-${Date.now()}` },
        ],
      })),

      getCurrentPickupPoint: () =>
        get().pickupPoints.find((p) => p.id === get().currentPickupPoint),

      addPickupRecord: (record) => set((state) => ({
        pickupRecords: [
          { ...record, id: `record-${Date.now()}` },
          ...state.pickupRecords,
        ],
      })),

      getPickupPointStats: (pickupPointId) => {
        const { pickupRecords, pickupPoints } = get();
        const pointRecords = pickupRecords.filter((r) => r.pickupPointId === pickupPointId);
        const point = pickupPoints.find((p) => p.id === pickupPointId);

        if (pointRecords.length === 0) {
          return {
            id: pickupPointId,
            name: point?.name || '',
            totalPickups: 0,
            avgWaitTime: 0,
            maxWaitTime: 0,
          };
        }

        const totalWaitTime = pointRecords.reduce((sum, r) => sum + r.waitDuration, 0);
        const maxWaitTime = Math.max(...pointRecords.map((r) => r.waitDuration));

        return {
          id: pickupPointId,
          name: point?.name || '',
          totalPickups: pointRecords.length,
          avgWaitTime: Math.round(totalWaitTime / pointRecords.length),
          maxWaitTime,
        };
      },

      getAllPickupPointStats: () => {
        const { pickupPoints, getPickupPointStats } = get();
        return pickupPoints.map((p) => getPickupPointStats(p.id));
      },

      getLongestQueuePoint: () => {
        const stats = get().getAllPickupPointStats();
        if (stats.length === 0) return null;
        return stats.reduce((max, curr) => (curr.maxWaitTime > max.maxWaitTime ? curr : max));
      },
    }),
    {
      name: 'pickup-point-storage-v2',
    }
  )
);
