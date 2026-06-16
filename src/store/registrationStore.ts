import { create } from 'zustand';
import type { Registration, RegistrationStatus } from '@/types';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { mockRegistrations } from '@/utils/mockData';
import { generateId } from '@/utils/format';
import { useCourseStore } from './courseStore';

interface RegistrationState {
  registrations: Registration[];
  fetchRegistrations: () => void;
  getRegistrationById: (id: string) => Registration | undefined;
  getRegistrationsByElderId: (elderId: string) => Registration[];
  getRegistrationsByCourseId: (courseId: string) => Registration[];
  getConfirmedCount: (courseId: string) => number;
  getWaitlistCount: (courseId: string) => number;
  addRegistration: (reg: Omit<Registration, 'id' | 'status' | 'waitlistPosition' | 'createdAt'>) => { success: boolean; message: string; registration?: Registration };
  cancelRegistration: (id: string) => void;
  confirmRegistration: (id: string) => void;
  completeRegistration: (id: string) => void;
  completeRegistrationByElderAndCourse: (elderId: string, courseId: string) => boolean;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  registrations: [],

  fetchRegistrations: () => {
    const initialized = storage.get(STORAGE_KEYS.INITIALIZED, false);
    let registrations: Registration[];
    
    if (!initialized) {
      registrations = mockRegistrations;
      storage.set(STORAGE_KEYS.REGISTRATIONS, registrations);
    } else {
      registrations = storage.get<Registration[]>(STORAGE_KEYS.REGISTRATIONS, []);
    }
    
    set({ registrations });
  },

  getRegistrationById: (id) => {
    return get().registrations.find(r => r.id === id);
  },

  getRegistrationsByElderId: (elderId) => {
    return get().registrations.filter(r => r.elderId === elderId);
  },

  getRegistrationsByCourseId: (courseId) => {
    return get().registrations.filter(r => r.courseId === courseId);
  },

  getConfirmedCount: (courseId) => {
    return get().registrations.filter(
      r => r.courseId === courseId && r.status === 'confirmed'
    ).length;
  },

  getWaitlistCount: (courseId) => {
    return get().registrations.filter(
      r => r.courseId === courseId && r.status === 'waitlist'
    ).length;
  },

  addRegistration: (regData) => {
    const { courseId, elderId } = regData;
    const course = useCourseStore.getState().getCourseById(courseId);
    
    if (!course) {
      return { success: false, message: '课程不存在' };
    }

    const existing = get().registrations.find(
      r => r.elderId === elderId && r.courseId === courseId && (r.status === 'confirmed' || r.status === 'waitlist')
    );
    
    if (existing) {
      return { success: false, message: '该老人已报名此课程' };
    }

    const confirmedCount = get().getConfirmedCount(courseId);
    const isFull = confirmedCount >= course.capacity;

    let status: RegistrationStatus = 'confirmed';
    let waitlistPosition = 0;

    if (isFull) {
      status = 'waitlist';
      const waitlistCount = get().getWaitlistCount(courseId);
      waitlistPosition = waitlistCount + 1;
    }

    const newRegistration: Registration = {
      ...regData,
      id: generateId(),
      status,
      waitlistPosition,
      createdAt: new Date().toISOString(),
    };

    const registrations = [...get().registrations, newRegistration];
    storage.set(STORAGE_KEYS.REGISTRATIONS, registrations);
    set({ registrations });

    return {
      success: true,
      message: isFull ? '名额已满，已加入候补队列' : '报名成功',
      registration: newRegistration,
    };
  },

  cancelRegistration: (id) => {
    const registration = get().getRegistrationById(id);
    if (!registration) return;

    const { courseId, status, waitlistPosition } = registration;

    let registrations = get().registrations.map(r =>
      r.id === id ? { ...r, status: 'cancelled' as const } : r
    );

    if (status === 'confirmed') {
      const waitlistRegistrations = registrations
        .filter(r => r.courseId === courseId && r.status === 'waitlist')
        .sort((a, b) => a.waitlistPosition - b.waitlistPosition);

      if (waitlistRegistrations.length > 0) {
        const firstWaitlist = waitlistRegistrations[0];
        registrations = registrations.map(r => {
          if (r.id === firstWaitlist.id) {
            return { ...r, status: 'confirmed' as const, waitlistPosition: 0 };
          }
          if (r.courseId === courseId && r.status === 'waitlist' && r.waitlistPosition > 1) {
            return { ...r, waitlistPosition: r.waitlistPosition - 1 };
          }
          return r;
        });
      }
    } else if (status === 'waitlist') {
      registrations = registrations.map(r => {
        if (r.courseId === courseId && r.status === 'waitlist' && r.waitlistPosition > waitlistPosition) {
          return { ...r, waitlistPosition: r.waitlistPosition - 1 };
        }
        return r;
      });
    }

    storage.set(STORAGE_KEYS.REGISTRATIONS, registrations);
    set({ registrations });
  },

  confirmRegistration: (id) => {
    const registrations = get().registrations.map(r =>
      r.id === id ? { ...r, status: 'confirmed' as const } : r
    );
    storage.set(STORAGE_KEYS.REGISTRATIONS, registrations);
    set({ registrations });
  },

  completeRegistration: (id) => {
    const registrations = get().registrations.map(r =>
      r.id === id ? { ...r, status: 'completed' as const } : r
    );
    storage.set(STORAGE_KEYS.REGISTRATIONS, registrations);
    set({ registrations });
  },

  completeRegistrationByElderAndCourse: (elderId, courseId) => {
    const targetRegistration = get().registrations.find(
      r => r.elderId === elderId && r.courseId === courseId && r.status === 'confirmed'
    );
    
    if (!targetRegistration) {
      return false;
    }

    const registrations = get().registrations.map(r =>
      r.id === targetRegistration.id ? { ...r, status: 'completed' as const } : r
    );
    storage.set(STORAGE_KEYS.REGISTRATIONS, registrations);
    set({ registrations });
    return true;
  },
}));
