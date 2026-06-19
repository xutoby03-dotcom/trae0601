import { create } from 'zustand';
import type { Inspection } from '@/types';
import { mockInspections } from '@/utils/mockData';
import { evaluateInspectionStatus } from '@/utils/status';
import { persist } from 'zustand/middleware';

interface InspectionState {
  inspections: Inspection[];
  addInspection: (inspection: Omit<Inspection, 'id' | 'status'>) => Inspection;
  updateInspection: (id: string, inspection: Partial<Inspection>) => void;
  deleteInspection: (id: string) => void;
  getInspection: (id: string) => Inspection | undefined;
  getInspectionsByRoom: (roomId: string) => Inspection[];
  getPendingInspections: () => string[];
}

export const useInspectionStore = create<InspectionState>()(
  persist(
    (set, get) => ({
      inspections: mockInspections,
      addInspection: (inspectionData) => {
        const status = evaluateInspectionStatus(inspectionData);
        const newInspection: Inspection = {
          ...inspectionData,
          id: `insp-${Date.now()}`,
          status,
        };
        set((state) => ({ inspections: [newInspection, ...state.inspections] }));
        return newInspection;
      },
      updateInspection: (id, inspectionData) => {
        set((state) => ({
          inspections: state.inspections.map((inspection) =>
            inspection.id === id ? { ...inspection, ...inspectionData } : inspection
          ),
        }));
      },
      deleteInspection: (id) => {
        set((state) => ({
          inspections: state.inspections.filter((inspection) => inspection.id !== id),
        }));
      },
      getInspection: (id) => {
        return get().inspections.find((inspection) => inspection.id === id);
      },
      getInspectionsByRoom: (roomId) => {
        return get()
          .inspections.filter((inspection) => inspection.roomId === roomId)
          .sort(
            (a, b) =>
              new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime()
          );
      },
      getPendingInspections: () => {
        const today = new Date().toISOString().split('T')[0];
        const todayInspections = get().inspections.filter(
          (i) => i.inspectionDate === today
        );
        const inspectedRoomIds = new Set(todayInspections.map((i) => i.roomId));
        return Array.from(inspectedRoomIds);
      },
    }),
    {
      name: 'water-heater-inspections',
    }
  )
);
