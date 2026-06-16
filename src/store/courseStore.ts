import { create } from 'zustand';
import type { Course, CourseStatus } from '@/types';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { mockCourses } from '@/utils/mockData';
import { generateId } from '@/utils/format';

interface CourseState {
  courses: Course[];
  fetchCourses: () => void;
  getCourseById: (id: string) => Course | undefined;
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'status'>) => void;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  getCoursesByStatus: (status: CourseStatus) => Course[];
  getTodayCourses: () => Course[];
  getUpcomingCourses: () => Course[];
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],

  fetchCourses: () => {
    const initialized = storage.get(STORAGE_KEYS.INITIALIZED, false);
    let courses: Course[];
    
    if (!initialized) {
      courses = mockCourses;
      storage.set(STORAGE_KEYS.COURSES, courses);
    } else {
      courses = storage.get<Course[]>(STORAGE_KEYS.COURSES, []);
    }
    
    set({ courses });
  },

  getCourseById: (id) => {
    return get().courses.find(c => c.id === id);
  },

  addCourse: (courseData) => {
    const newCourse: Course = {
      ...courseData,
      id: generateId(),
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };
    const courses = [...get().courses, newCourse];
    storage.set(STORAGE_KEYS.COURSES, courses);
    set({ courses });
  },

  updateCourse: (id, courseData) => {
    const courses = get().courses.map(course =>
      course.id === id ? { ...course, ...courseData } : course
    );
    storage.set(STORAGE_KEYS.COURSES, courses);
    set({ courses });
  },

  deleteCourse: (id) => {
    const courses = get().courses.filter(course => course.id !== id);
    storage.set(STORAGE_KEYS.COURSES, courses);
    set({ courses });
  },

  getCoursesByStatus: (status) => {
    return get().courses.filter(c => c.status === status);
  },

  getTodayCourses: () => {
    const today = new Date();
    return get().courses.filter(course => {
      const courseDate = new Date(course.startTime);
      return (
        courseDate.getFullYear() === today.getFullYear() &&
        courseDate.getMonth() === today.getMonth() &&
        courseDate.getDate() === today.getDate()
      );
    });
  },

  getUpcomingCourses: () => {
    const now = new Date();
    return get().courses
      .filter(course => new Date(course.startTime) > now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  },
}));
