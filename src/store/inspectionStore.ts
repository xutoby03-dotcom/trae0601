import { create } from 'zustand';
import { Inspection } from '@/types';
import { mockInspections } from '@/data/inspections';
import { generateId } from '@/utils/date';

interface InspectionStore {
  inspections: Inspection[];
  getInspectionsByDeviceId: (deviceId: string) => Inspection[];
  getInspectionById: (id: string) => Inspection | undefined;
  getInspectionsThisMonth: () => Inspection[];
  addInspection: (inspection: Omit<Inspection, 'id'>) => Inspection;
  getLatestInspection: (deviceId: string) => Inspection | undefined;
  getAnomalyCount: (deviceId: string) => number;
}

export const useInspectionStore = create<InspectionStore>((set, get) => ({
  inspections: mockInspections,

  getInspectionsByDeviceId: (deviceId) => {
    return get().inspections
      .filter(i => i.deviceId === deviceId)
      .sort((a, b) => new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime());
  },

  getInspectionById: (id) => {
    return get().inspections.find(i => i.id === id);
  },

  getInspectionsThisMonth: () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    return get().inspections.filter(i => {
      const d = new Date(i.inspectDate);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  addInspection: (inspection) => {
    const newInspection: Inspection = {
      ...inspection,
      id: 'ins' + generateId()
    };
    set(state => ({ inspections: [newInspection, ...state.inspections] }));
    return newInspection;
  },

  getLatestInspection: (deviceId) => {
    const deviceInspections = get().inspections
      .filter(i => i.deviceId === deviceId)
      .sort((a, b) => new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime());
    return deviceInspections[0];
  },

  getAnomalyCount: (deviceId) => {
    return get().inspections.filter(i => i.deviceId === deviceId && i.result === 'abnormal').length;
  }
}));
