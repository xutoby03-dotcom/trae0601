import { create } from 'zustand';
import type { Attendance } from '@/types';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { mockAttendances, mockVolunteers } from '@/utils/mockData';
import { generateId } from '@/utils/format';

interface AttendanceState {
  attendances: Attendance[];
  volunteers: typeof mockVolunteers;
  fetchAttendances: () => void;
  fetchVolunteers: () => void;
  getAttendanceById: (id: string) => Attendance | undefined;
  getAttendancesByElderId: (elderId: string) => Attendance[];
  getAttendancesByCourseId: (courseId: string) => Attendance[];
  addAttendance: (attendance: Omit<Attendance, 'id' | 'createdAt'>) => void;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => void;
  deleteAttendance: (id: string) => void;
  getVolunteerHours: () => { name: string; hours: number }[];
  getStuckProblems: () => { problem: string; count: number }[];
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  attendances: [],
  volunteers: [],

  fetchAttendances: () => {
    const initialized = storage.get(STORAGE_KEYS.INITIALIZED, false);
    let attendances: Attendance[];
    
    if (!initialized) {
      attendances = mockAttendances;
      storage.set(STORAGE_KEYS.ATTENDANCES, attendances);
    } else {
      attendances = storage.get<Attendance[]>(STORAGE_KEYS.ATTENDANCES, []);
    }
    
    set({ attendances });
  },

  fetchVolunteers: () => {
    const initialized = storage.get(STORAGE_KEYS.INITIALIZED, false);
    let volunteers;
    
    if (!initialized) {
      volunteers = mockVolunteers;
      storage.set(STORAGE_KEYS.VOLUNTEERS, volunteers);
    } else {
      volunteers = storage.get(STORAGE_KEYS.VOLUNTEERS, mockVolunteers);
    }
    
    set({ volunteers });
  },

  getAttendanceById: (id) => {
    return get().attendances.find(a => a.id === id);
  },

  getAttendancesByElderId: (elderId) => {
    return get().attendances
      .filter(a => a.elderId === elderId)
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  },

  getAttendancesByCourseId: (courseId) => {
    return get().attendances
      .filter(a => a.courseId === courseId)
      .sort((a, b) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime());
  },

  addAttendance: (attendanceData) => {
    const newAttendance: Attendance = {
      ...attendanceData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const attendances = [...get().attendances, newAttendance];
    storage.set(STORAGE_KEYS.ATTENDANCES, attendances);
    set({ attendances });
  },

  updateAttendance: (id, attendanceData) => {
    const attendances = get().attendances.map(a =>
      a.id === id ? { ...a, ...attendanceData } : a
    );
    storage.set(STORAGE_KEYS.ATTENDANCES, attendances);
    set({ attendances });
  },

  deleteAttendance: (id) => {
    const attendances = get().attendances.filter(a => a.id !== id);
    storage.set(STORAGE_KEYS.ATTENDANCES, attendances);
    set({ attendances });
  },

  getVolunteerHours: () => {
    const hoursMap: Record<string, number> = {};
    get().attendances.forEach(a => {
      if (!hoursMap[a.volunteerName]) {
        hoursMap[a.volunteerName] = 0;
      }
      hoursMap[a.volunteerName] += a.duration;
    });
    return Object.entries(hoursMap)
      .map(([name, minutes]) => ({ name, hours: Math.round(minutes / 60 * 10) / 10 }))
      .sort((a, b) => b.hours - a.hours);
  },

  getStuckProblems: () => {
    const problemMap: Record<string, number> = {};
    get().attendances.forEach(a => {
      if (a.stuckProblems) {
        const problems = a.stuckProblems.split(/[，,、。\n]+/).filter(p => p.trim());
        problems.forEach(p => {
          const trimmed = p.trim();
          if (trimmed) {
            problemMap[trimmed] = (problemMap[trimmed] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(problemMap)
      .map(([problem, count]) => ({ problem, count }))
      .sort((a, b) => b.count - a.count);
  },
}));
