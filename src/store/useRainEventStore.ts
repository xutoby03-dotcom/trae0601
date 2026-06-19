import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RainEvent } from '../types';
import { mockRainEvents } from '../data/mockData';
import { generateId } from '../utils/date';

interface RainEventState {
  rainEvents: RainEvent[];
  addRainEvent: (event: Omit<RainEvent, 'id'>) => void;
  updateRainEvent: (id: string, event: Partial<RainEvent>) => void;
  deleteRainEvent: (id: string) => void;
  getLatestRainEvent: () => RainEvent | undefined;
}

export const useRainEventStore = create<RainEventState>()(
  persist(
    (set, get) => ({
      rainEvents: mockRainEvents,
      addRainEvent: (event) =>
        set((state) => ({
          rainEvents: [
            { ...event, id: generateId() },
            ...state.rainEvents,
          ],
        })),
      updateRainEvent: (id, event) =>
        set((state) => ({
          rainEvents: state.rainEvents.map((r) =>
            r.id === id ? { ...r, ...event } : r
          ),
        })),
      deleteRainEvent: (id) =>
        set((state) => ({
          rainEvents: state.rainEvents.filter((r) => r.id !== id),
        })),
      getLatestRainEvent: () => {
        const sorted = [...get().rainEvents].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        return sorted[0];
      },
    }),
    {
      name: 'terrace-rain-events-storage',
    }
  )
);
