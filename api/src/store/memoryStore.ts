import type { Course, Application } from '../../../shared/types';
import { mockCourses, mockApplications, generateMockId } from '../data/mockData';

interface Store {
  courses: Course[];
  applications: Application[];
}

const initStore = (): Store => {
  const courses = JSON.parse(JSON.stringify(mockCourses));
  const applications = JSON.parse(JSON.stringify(mockApplications));

  applications.forEach((app: Application) => {
    if (app.seatId && (app.status === 'approved' || app.status === 'checked_in')) {
      const course = courses.find((c: Course) => c.id === app.courseId);
      if (course) {
        for (const row of course.seats) {
          for (const seat of row) {
            if (seat.id === app.seatId) {
              seat.status = app.status === 'checked_in' ? 'checked_in' : 'reserved';
              seat.applicationId = app.id;
              seat.studentName = app.studentName;
            }
          }
        }
      }
    }
  });

  const store: Store = { courses, applications };
  
  const tempStore = store;
  const courseIds = [...new Set(applications.map((a: Application) => a.courseId))];
  courseIds.forEach((courseId) => {
    const waitlist = tempStore.applications.filter(
      (a: Application) => a.courseId === courseId && a.status === 'waitlist'
    );
    waitlist
      .sort(
        (a: Application, b: Application) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .forEach((app: Application, index: number) => {
        app.waitlistPosition = index + 1;
      });
  });

  return store;
};

const store: Store = initStore();

export const courseStore = {
  getAll: (): Course[] => store.courses,

  getById: (id: string): Course | undefined =>
    store.courses.find((c) => c.id === id),

  create: (course: Omit<Course, 'id'>): Course => {
    const newCourse: Course = {
      ...course,
      id: generateMockId(),
    };
    store.courses.push(newCourse);
    return newCourse;
  },

  update: (id: string, updates: Partial<Course>): Course | undefined => {
    const index = store.courses.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    store.courses[index] = { ...store.courses[index], ...updates };
    return store.courses[index];
  },

  delete: (id: string): boolean => {
    const index = store.courses.findIndex((c) => c.id === id);
    if (index === -1) return false;
    store.courses.splice(index, 1);
    return true;
  },

  updateSeats: (id: string, seats: Course['seats']): Course | undefined => {
    const course = store.courses.find((c) => c.id === id);
    if (!course) return undefined;
    course.seats = seats;
    return course;
  },
};

export const applicationStore = {
  getAll: (courseId?: string, studentName?: string): Application[] => {
    let apps = [...store.applications];
    if (courseId) {
      apps = apps.filter((a) => a.courseId === courseId);
    }
    if (studentName) {
      apps = apps.filter((a) =>
        a.studentName.includes(studentName)
      );
    }
    return apps.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById: (id: string): Application | undefined =>
    store.applications.find((a) => a.id === id),

  create: (
    application: Omit<Application, 'id' | 'createdAt'>
  ): Application => {
    const newApp: Application = {
      ...application,
      id: generateMockId(),
      createdAt: new Date().toISOString(),
    };
    store.applications.push(newApp);
    return newApp;
  },

  update: (
    id: string,
    updates: Partial<Application>
  ): Application | undefined => {
    const index = store.applications.findIndex((a) => a.id === id);
    if (index === -1) return undefined;
    store.applications[index] = {
      ...store.applications[index],
      ...updates,
    };
    return store.applications[index];
  },

  getApprovedCount: (courseId: string): number =>
    store.applications.filter(
      (a) =>
        a.courseId === courseId &&
        (a.status === 'approved' || a.status === 'checked_in')
    ).length,

  getWaitlist: (courseId: string): Application[] =>
    store.applications
      .filter((a) => a.courseId === courseId && a.status === 'waitlist')
      .sort(
        (a, b) =>
      (a.waitlistPosition || 0) - (b.waitlistPosition || 0)
      ),

  updateWaitlistPositions: (courseId: string): void => {
    const waitlist = store.applications.filter(
      (a) =>
        a.courseId === courseId && a.status === 'waitlist'
    );
    waitlist
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .forEach((app, index) => {
        app.waitlistPosition = index + 1;
      });
  },
};

export { generateMockId };
