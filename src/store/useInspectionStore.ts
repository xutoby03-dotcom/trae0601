import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Inspection, InspectionItemKey, INSPECTION_ITEMS } from '@/types';
import { generateId, STORAGE_KEYS } from '@/utils/storage';

interface InspectionState {
  inspections: Inspection[];
  setInspections: (inspections: Inspection[]) => void;
  addInspection: (inspection: Omit<Inspection, 'id'>) => Inspection;
  updateInspection: (id: string, data: Partial<Inspection>) => void;
  deleteInspection: (id: string) => void;
  getInspectionById: (id: string) => Inspection | undefined;
  getInspectionsByInstallationId: (installationId: string) => Inspection[];
  getLatestInspectionByInstallationId: (installationId: string) => Inspection | undefined;
  createEmptyInspection: (installationId: string) => Inspection;
}

export const useInspectionStore = create<InspectionState>()(
  persist(
    (set, get) => ({
      inspections: [],
      
      setInspections: (inspections) => set({ inspections }),
      
      addInspection: (inspectionData) => {
        const newInspection: Inspection = {
          ...inspectionData,
          id: generateId(),
        };
        set({ inspections: [...get().inspections, newInspection] });
        return newInspection;
      },
      
      updateInspection: (id, data) => {
        set({
          inspections: get().inspections.map(i =>
            i.id === id ? { ...i, ...data } : i
          ),
        });
      },
      
      deleteInspection: (id) => {
        set({ inspections: get().inspections.filter(i => i.id !== id) });
      },
      
      getInspectionById: (id) => {
        return get().inspections.find(i => i.id === id);
      },
      
      getInspectionsByInstallationId: (installationId) => {
        return get().inspections
          .filter(i => i.installationId === installationId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      
      getLatestInspectionByInstallationId: (installationId) => {
        const inspections = get().getInspectionsByInstallationId(installationId);
        return inspections.length > 0 ? inspections[0] : undefined;
      },
      
      createEmptyInspection: (installationId) => {
        const emptyItems: Record<string, { name: string; checked: boolean }> = {};
        INSPECTION_ITEMS.forEach(item => {
          emptyItems[item.key as InspectionItemKey] = {
            name: item.label,
            checked: false,
          };
        });
        
        return {
          id: generateId(),
          installationId,
          date: new Date().toISOString().split('T')[0],
          ...emptyItems,
          passed: false,
        } as Inspection;
      },
    }),
    {
      name: STORAGE_KEYS.INSPECTIONS,
    }
  )
);
