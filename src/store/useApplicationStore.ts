import { create } from 'zustand';
import type { Application, ApplicationStatus } from '../types';
import { mockApplications } from '../mock/applications';
import { generateId } from '../utils/date';

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  fetchApplications: () => void;
  addApplication: (app: Omit<Application, 'id' | 'status' | 'createdAt'>) => Application;
  updateApplication: (id: string, data: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  approveApplication: (id: string) => void;
  rejectApplication: (id: string, reason: string) => void;
  getApplicationById: (id: string) => Application | undefined;
  getApplicationsByStatus: (status: ApplicationStatus) => Application[];
  getApplicationsByPosterId: (posterId: string) => Application[];
  getPendingCount: () => number;
  getAuditedApplications: () => Application[];
}

const STORAGE_KEY = 'poster_management_applications';

const loadFromStorage = (): Application[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load applications from storage:', e);
  }
  return mockApplications;
};

const saveToStorage = (applications: Application[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  } catch (e) {
    console.error('Failed to save applications to storage:', e);
  }
};

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: loadFromStorage(),
  loading: false,

  fetchApplications: () => {
    set({ loading: true });
    const applications = loadFromStorage();
    set({ applications, loading: false });
  },

  addApplication: (appData) => {
    const newApp: Application = {
      ...appData,
      id: generateId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const applications = [...get().applications, newApp];
    set({ applications });
    saveToStorage(applications);
    return newApp;
  },

  updateApplication: (id, data) => {
    const applications = get().applications.map((a) =>
      a.id === id ? { ...a, ...data } : a
    );
    set({ applications });
    saveToStorage(applications);
  },

  deleteApplication: (id) => {
    const applications = get().applications.filter((a) => a.id !== id);
    set({ applications });
    saveToStorage(applications);
  },

  approveApplication: (id) => {
    const applications = get().applications.map((a) =>
      a.id === id
        ? { ...a, status: 'approved' as const, auditedAt: new Date().toISOString() }
        : a
    );
    set({ applications });
    saveToStorage(applications);
  },

  rejectApplication: (id, reason) => {
    const applications = get().applications.map((a) =>
      a.id === id
        ? {
            ...a,
            status: 'rejected' as const,
            rejectReason: reason,
            auditedAt: new Date().toISOString(),
          }
        : a
    );
    set({ applications });
    saveToStorage(applications);
  },

  getApplicationById: (id) => {
    return get().applications.find((a) => a.id === id);
  },

  getApplicationsByStatus: (status) => {
    return get().applications.filter((a) => a.status === status);
  },

  getApplicationsByPosterId: (posterId) => {
    return get().applications.filter((a) => a.posterId === posterId);
  },

  getPendingCount: () => {
    return get().applications.filter((a) => a.status === 'pending').length;
  },

  getAuditedApplications: () => {
    return get().applications.filter((a) => a.status !== 'pending');
  },
}));
