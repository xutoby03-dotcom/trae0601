import { create } from 'zustand';
import type { Classroom, Inspection, Repair, DashboardStats, InspectionItem, RepairMaterial, RepairStatus } from '@/types';
import { mockClassrooms, mockInspections, mockRepairs } from '@/data/mockData';
import { getOverallStatus, isCriticalHazard } from '@/utils/statusUtils';
import { generateId, getTodayString, isFloorLifeWarning } from '@/utils/dateUtils';

interface AppState {
  classrooms: Classroom[];
  inspections: Inspection[];
  repairs: Repair[];
  currentUser: { name: string; role: string };
  
  addClassroom: (classroom: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateClassroom: (id: string, data: Partial<Classroom>) => void;
  getClassroomById: (id: string) => Classroom | undefined;
  
  addInspection: (inspection: Omit<Inspection, 'id' | 'createdAt' | 'overallStatus' | 'autoSuspended'>) => void;
  getInspectionsByClassroom: (classroomId: string) => Inspection[];
  
  addRepair: (repair: Omit<Repair, 'id' | 'createdAt' | 'updatedAt'> & { status?: RepairStatus }) => void;
  updateRepair: (id: string, data: Partial<Repair>) => void;
  getRepairsByClassroom: (classroomId: string) => Repair[];
  
  getDashboardStats: () => DashboardStats;
  
  suspendClassroom: (classroomId: string) => void;
  resumeClassroom: (classroomId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  classrooms: mockClassrooms,
  inspections: mockInspections,
  repairs: mockRepairs,
  currentUser: { name: '管理员', role: 'admin' },

  addClassroom: (classroom) => {
    const now = new Date().toISOString();
    const newClassroom: Classroom = {
      ...classroom,
      id: generateId(),
      status: 'normal',
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      classrooms: [...state.classrooms, newClassroom],
    }));
  },

  updateClassroom: (id, data) => {
    const now = new Date().toISOString();
    set((state) => ({
      classrooms: state.classrooms.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: now } : c
      ),
    }));
  },

  getClassroomById: (id) => {
    return get().classrooms.find((c) => c.id === id);
  },

  addInspection: (inspection) => {
    const now = new Date().toISOString();
    const overallStatus = getOverallStatus(inspection.items);
    const autoSuspended = isCriticalHazard(inspection.items);
    
    const newInspection: Inspection = {
      ...inspection,
      id: generateId(),
      overallStatus,
      autoSuspended,
      createdAt: now,
    };
    
    set((state) => {
      const updatedClassrooms = state.classrooms.map((c) =>
        c.id === inspection.classroomId
          ? { ...c, lastInspectionDate: inspection.date, updatedAt: now }
          : c
      );
      
      if (autoSuspended) {
        const idx = updatedClassrooms.findIndex((c) => c.id === inspection.classroomId);
        if (idx !== -1) {
          updatedClassrooms[idx] = { ...updatedClassrooms[idx], status: 'suspended' };
        }
      }
      
      return {
        inspections: [...state.inspections, newInspection],
        classrooms: updatedClassrooms,
      };
    });
    
    if (autoSuspended) {
      const state = get();
      const classroom = state.classrooms.find((c) => c.id === inspection.classroomId);
      const repair: Omit<Repair, 'id' | 'createdAt' | 'updatedAt'> = {
        classroomId: inspection.classroomId,
        classroomName: classroom?.name,
        inspectionId: newInspection.id,
        workerName: '',
        materials: [],
        status: 'pending',
        description: '严重隐患自动生成的维修工单',
      };
      get().addRepair(repair);
    }
  },

  getInspectionsByClassroom: (classroomId) => {
    return get()
      .inspections.filter((i) => i.classroomId === classroomId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  addRepair: (repair) => {
    const now = new Date().toISOString();
    const { status, ...rest } = repair;
    const newRepair: Repair = {
      ...rest,
      id: generateId(),
      status: status || 'pending',
      createdAt: now,
      updatedAt: now,
    };
    set((state) => {
      let updatedClassrooms = state.classrooms;
      if (newRepair.recheckResult === 'passed') {
        updatedClassrooms = state.classrooms.map((c) =>
          c.id === repair.classroomId ? { ...c, status: 'normal' as const, updatedAt: now } : c
        );
      }
      return {
        repairs: [...state.repairs, newRepair],
        classrooms: updatedClassrooms,
      };
    });
  },

  updateRepair: (id, data) => {
    const now = new Date().toISOString();
    set((state) => ({
      repairs: state.repairs.map((r) =>
        r.id === id ? { ...r, ...data, updatedAt: now } : r
      ),
    }));
  },

  getRepairsByClassroom: (classroomId) => {
    return get()
      .repairs.filter((r) => r.classroomId === classroomId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getDashboardStats: () => {
    const state = get();
    const today = getTodayString();
    
    const pendingInspections = state.classrooms.filter((c) => {
      if (!c.lastInspectionDate) return true;
      const lastDate = new Date(c.lastInspectionDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 3;
    }).length;
    
    const suspendedClassrooms = state.classrooms.filter(
      (c) => c.status === 'suspended' || c.status === 'maintenance'
    ).length;
    
    const repeatedHazards = 3;
    
    const affectedCourses = suspendedClassrooms * 5;
    
    const floorLifeWarnings = state.classrooms.filter((c) =>
      isFloorLifeWarning(c.installDate)
    ).length;
    
    return {
      pendingInspections,
      suspendedClassrooms,
      repeatedHazards,
      affectedCourses,
      floorLifeWarnings,
    };
  },

  suspendClassroom: (classroomId) => {
    set((state) => ({
      classrooms: state.classrooms.map((c) =>
        c.id === classroomId ? { ...c, status: 'suspended' } : c
      ),
    }));
  },

  resumeClassroom: (classroomId) => {
    set((state) => ({
      classrooms: state.classrooms.map((c) =>
        c.id === classroomId ? { ...c, status: 'normal' } : c
      ),
    }));
  },
}));
