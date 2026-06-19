import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Inspection } from '../types';
import { mockInspections } from '../data/mockData';
import { generateId } from '../utils/date';

interface InspectionState {
  inspections: Inspection[];
  addInspection: (inspection: Omit<Inspection, 'id' | 'createdAt'>) => string;
  updateInspection: (id: string, inspection: Partial<Inspection>) => void;
  deleteInspection: (id: string) => void;
  getInspectionsByArea: (areaId: string) => Inspection[];
  getInspectionsByRainEvent: (rainEventId: string) => Inspection[];
}

export const useInspectionStore = create<InspectionState>()(
  persist(
    (set, get) => ({
      inspections: mockInspections,
      addInspection: (inspection) => {
        const newId = generateId();
        const newInspection: Inspection = {
          ...inspection,
          id: newId,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          inspections: [...state.inspections, newInspection],
        }));
        return newId;
      },
      updateInspection: (id, inspection) =>
        set((state) => ({
          inspections: state.inspections.map((i) =>
            i.id === id ? { ...i, ...inspection } : i
          ),
        })),
      deleteInspection: (id) =>
        set((state) => ({
          inspections: state.inspections.filter((i) => i.id !== id),
        })),
      getInspectionsByArea: (areaId) =>
        get()
          .inspections.filter((i) => i.areaId === areaId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      getInspectionsByRainEvent: (rainEventId) =>
        get().inspections.filter((i) => i.rainEventId === rainEventId),
    }),
    {
      name: 'terrace-inspections-storage',
    }
  )
);
