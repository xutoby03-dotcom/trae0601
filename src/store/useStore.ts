import { create } from 'zustand';
import type {
  CourseWithQuota,
  Application,
  Statistics,
  CourseStatistics,
} from '../types';
import { courseApi, applicationApi, statisticsApi } from '../services/api';

interface AppState {
  courses: CourseWithQuota[];
  applications: Application[];
  statistics: Statistics | null;
  courseStatistics: Map<string, CourseStatistics>;
  loading: boolean;
  error: string | null;

  fetchCourses: () => Promise<void>;
  fetchApplications: (courseId?: string, studentName?: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchCourseStatistics: (courseId: string) => Promise<void>;

  addCourse: (course: any) => Promise<void>;
  updateCourse: (id: string, data: any) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;

  submitApplication: (data: any) => Promise<Application>;
  approveApplication: (id: string) => Promise<void>;
  rejectApplication: (id: string) => Promise<void>;
  checkInApplication: (id: string) => Promise<void>;
  releaseApplication: (id: string) => Promise<void>;
  cancelApplication: (id: string) => Promise<void>;

  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  courses: [],
  applications: [],
  statistics: null,
  courseStatistics: new Map(),
  loading: false,
  error: null,

  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const courses = await courseApi.getAll();
      set({ courses });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchApplications: async (courseId?: string, studentName?: string) => {
    set({ loading: true, error: null });
    try {
      const applications = await applicationApi.getAll(courseId, studentName);
      set({ applications });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchStatistics: async () => {
    set({ loading: true, error: null });
    try {
      const statistics = await statisticsApi.getOverall();
      set({ statistics });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchCourseStatistics: async (courseId: string) => {
    try {
      const stats = await statisticsApi.getCourse(courseId);
      set((state) => {
        const newMap = new Map(state.courseStatistics);
        newMap.set(courseId, stats);
        return { courseStatistics: newMap };
      });
    } catch (error) {
      console.error('Failed to fetch course statistics:', error);
    }
  },

  addCourse: async (courseData: any) => {
    set({ loading: true, error: null });
    try {
      await courseApi.create(courseData);
      await get().fetchCourses();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateCourse: async (id: string, data: any) => {
    set({ loading: true, error: null });
    try {
      await courseApi.update(id, data);
      await get().fetchCourses();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteCourse: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await courseApi.delete(id);
      await get().fetchCourses();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  submitApplication: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const app = await applicationApi.submit(data);
      await get().fetchCourses();
      return app;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  approveApplication: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await applicationApi.approve(id);
      await Promise.all([get().fetchApplications(), get().fetchCourses()]);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  rejectApplication: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await applicationApi.reject(id);
      await get().fetchApplications();
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  checkInApplication: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await applicationApi.checkIn(id);
      await Promise.all([get().fetchApplications(), get().fetchCourses()]);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  releaseApplication: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await applicationApi.release(id);
      await Promise.all([get().fetchApplications(), get().fetchCourses()]);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  cancelApplication: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await applicationApi.cancel(id);
      await Promise.all([get().fetchApplications(), get().fetchCourses()]);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  setError: (error: string | null) => set({ error }),
}));
