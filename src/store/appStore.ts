import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Facility, InspectionRecord, IssueRecord, RepairRecord } from '@/types';
import { mockFacilities, mockInspections, mockIssues, mockRepairs, generateId } from '@/data/mockData';

interface AppState {
  facilities: Facility[];
  inspections: InspectionRecord[];
  issues: IssueRecord[];
  repairs: RepairRecord[];
  
  addFacility: (facility: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFacility: (id: string, data: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;
  getFacility: (id: string) => Facility | undefined;
  
  addInspection: (inspection: Omit<InspectionRecord, 'id' | 'createdAt'>) => void;
  updateInspection: (id: string, data: Partial<InspectionRecord>) => void;
  getInspectionsByFacility: (facilityId: string) => InspectionRecord[];
  
  addIssue: (issue: Omit<IssueRecord, 'id'>) => void;
  updateIssue: (id: string, data: Partial<IssueRecord>) => void;
  getIssuesByFacility: (facilityId: string) => IssueRecord[];
  
  addRepair: (repair: Omit<RepairRecord, 'id' | 'createdAt'>) => void;
  updateRepair: (id: string, data: Partial<RepairRecord>) => void;
  getRepairsByFacility: (facilityId: string) => RepairRecord[];
}

const now = () => new Date().toISOString();

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      facilities: mockFacilities,
      inspections: mockInspections,
      issues: mockIssues,
      repairs: mockRepairs,

      addFacility: (data) =>
        set((state) => ({
          facilities: [
            ...state.facilities,
            { ...data, id: generateId(), createdAt: now(), updatedAt: now() },
          ],
        })),

      updateFacility: (id, data) =>
        set((state) => ({
          facilities: state.facilities.map((f) =>
            f.id === id ? { ...f, ...data, updatedAt: now() } : f
          ),
        })),

      deleteFacility: (id) =>
        set((state) => ({
          facilities: state.facilities.filter((f) => f.id !== id),
        })),

      getFacility: (id) => get().facilities.find((f) => f.id === id),

      addInspection: (data) =>
        set((state) => ({
          inspections: [...state.inspections, { ...data, id: generateId(), createdAt: now() }],
        })),

      updateInspection: (id, data) =>
        set((state) => ({
          inspections: state.inspections.map((i) =>
            i.id === id ? { ...i, ...data } : i
          ),
        })),

      getInspectionsByFacility: (facilityId) =>
        get().inspections.filter((i) => i.facilityId === facilityId),

      addIssue: (data) =>
        set((state) => ({
          issues: [...state.issues, { ...data, id: generateId() }],
        })),

      updateIssue: (id, data) =>
        set((state) => ({
          issues: state.issues.map((i) =>
            i.id === id ? { ...i, ...data } : i
          ),
        })),

      getIssuesByFacility: (facilityId) =>
        get().issues.filter((i) => i.facilityId === facilityId),

      addRepair: (data) =>
        set((state) => ({
          repairs: [...state.repairs, { ...data, id: generateId(), createdAt: now() }],
        })),

      updateRepair: (id, data) =>
        set((state) => ({
          repairs: state.repairs.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      getRepairsByFacility: (facilityId) =>
        get().repairs.filter((r) => r.facilityId === facilityId),
    }),
    {
      name: 'playground-inspection-store',
    }
  )
);
