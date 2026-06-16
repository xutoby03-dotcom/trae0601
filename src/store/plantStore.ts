import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';
import type {
  PlantStore,
  Plant,
  TimelineEvent,
  RepotRecord,
} from '../types';
import {
  mockPlants,
  mockSoilMixes,
  mockTimelineEvents,
  mockRepotRecords,
  mockSoilInventories,
} from '../data/mockData';

const generateId = () => Math.random().toString(36).slice(2, 11);

export const usePlantStore = create<PlantStore>()(
  persist(
    (set, get) => ({
      plants: mockPlants,
      soilMixes: mockSoilMixes,
      timelineEvents: mockTimelineEvents,
      repotRecords: mockRepotRecords,
      soilInventories: mockSoilInventories,

      addPlant: (plant) => {
        const newPlant: Plant = {
          ...plant,
          id: generateId(),
          createdAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ plants: [...state.plants, newPlant] }));
      },

      updatePlant: (id, data) => {
        set((state) => ({
          plants: state.plants.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }));
      },

      deletePlant: (id) => {
        set((state) => ({
          plants: state.plants.filter((p) => p.id !== id),
          timelineEvents: state.timelineEvents.filter((e) => e.plantId !== id),
          repotRecords: state.repotRecords.filter((r) => r.plantId !== id),
        }));
      },

      addTimelineEvent: (event) => {
        const newEvent: TimelineEvent = { ...event, id: generateId() };
        set((state) => ({
          timelineEvents: [...state.timelineEvents, newEvent],
        }));
      },

      addRepotRecord: (record) => {
        const newRecord: RepotRecord = { ...record, id: generateId() };
        set((state) => {
          const newEvent: TimelineEvent = {
            id: generateId(),
            plantId: record.plantId,
            type: 'repot',
            date: record.date,
            description: `换盆：${record.newPotDiameterCm}cm 盆`,
          };
          return {
            repotRecords: [...state.repotRecords, newRecord],
            timelineEvents: [...state.timelineEvents, newEvent],
            plants: state.plants.map((p) =>
              p.id === record.plantId
                ? {
                    ...p,
                    potDiameterCm: record.newPotDiameterCm,
                    currentSoilMixId: record.soilMixId,
                  }
                : p
            ),
          };
        });
      },

      updateSoilInventory: (id, data) => {
        set((state) => ({
          soilInventories: state.soilInventories.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        }));
      },

      getPlantById: (id) => {
        return get().plants.find((p) => p.id === id);
      },

      getSoilMixById: (id) => {
        return get().soilMixes.find((s) => s.id === id);
      },

      getRepotRecordsByPlantId: (plantId) => {
        return get()
          .repotRecords.filter((r) => r.plantId === plantId)
          .sort((a, b) =>
            isAfter(parseISO(a.date), parseISO(b.date)) ? -1 : 1
          );
      },

      getTimelineEventsByPlantId: (plantId) => {
        return get()
          .timelineEvents.filter((e) => e.plantId === plantId)
          .sort((a, b) =>
            isAfter(parseISO(a.date), parseISO(b.date)) ? -1 : 1
          );
      },

      isPlantInRecovery: (plantId) => {
        const records = get().repotRecords.filter((r) => r.plantId === plantId);
        if (records.length === 0) return false;
        const latest = records.sort((a, b) =>
          isAfter(parseISO(a.date), parseISO(b.date)) ? -1 : 1
        )[0];
        const today = new Date();
        const recoveryEnd = parseISO(latest.recoveryEndDate);
        return isBefore(today, recoveryEnd);
      },

      getRecoveryDaysLeft: (plantId) => {
        const records = get().repotRecords.filter((r) => r.plantId === plantId);
        if (records.length === 0) return 0;
        const latest = records.sort((a, b) =>
          isAfter(parseISO(a.date), parseISO(b.date)) ? -1 : 1
        )[0];
        const today = new Date();
        const recoveryEnd = parseISO(latest.recoveryEndDate);
        const days = differenceInDays(recoveryEnd, today);
        return Math.max(0, days);
      },
    }),
    {
      name: 'plant-care-storage',
    }
  )
);
