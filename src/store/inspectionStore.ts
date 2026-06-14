import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Inspection } from '@/types';

const generateId = (): string => Date.now().toString() + Math.random().toString(36).slice(2, 9);

interface InspectionState {
  inspections: Inspection[];
  addInspection: (data: Omit<Inspection, 'id' | 'created_at'>) => void;
  getInspectionsByFacilityId: (facilityId: string) => Inspection[];
}

export const useInspectionStore = create<InspectionState>()(
  persist(
    (set, get) => ({
      inspections: [],
      addInspection: (data) => {
        const now = new Date().toISOString();
        const newInspection: Inspection = {
          ...data,
          id: generateId(),
          created_at: now,
        };
        set({ inspections: [...get().inspections, newInspection] });
      },
      getInspectionsByFacilityId: (facilityId) => {
        return get()
          .inspections.filter((i) => i.facility_id === facilityId)
          .sort((a, b) => new Date(b.inspection_date).getTime() - new Date(a.inspection_date).getTime());
      },
    }),
    {
      name: 'playground-inspections',
    }
  )
);
