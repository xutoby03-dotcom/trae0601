import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Area } from '../types';
import { mockAreas } from '../data/mockData';
import { generateId } from '../utils/date';

interface AreaState {
  areas: Area[];
  addArea: (area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateArea: (id: string, area: Partial<Area>) => void;
  deleteArea: (id: string) => void;
  getAreaById: (id: string) => Area | undefined;
}

export const useAreaStore = create<AreaState>()(
  persist(
    (set, get) => ({
      areas: mockAreas,
      addArea: (area) =>
        set((state) => ({
          areas: [
            ...state.areas,
            {
              ...area,
              id: generateId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateArea: (id, area) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === id ? { ...a, ...area, updatedAt: new Date().toISOString() } : a
          ),
        })),
      deleteArea: (id) =>
        set((state) => ({
          areas: state.areas.filter((a) => a.id !== id),
        })),
      getAreaById: (id) => get().areas.find((a) => a.id === id),
    }),
    {
      name: 'terrace-areas-storage',
    }
  )
);
