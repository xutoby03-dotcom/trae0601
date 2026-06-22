import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Course, CourseElement, UserRole, Student, TrainingSession } from '@/types';
import { generateId } from '@/utils/id';

interface AppState {
  userRole: UserRole;
  currentStudent: Student | null;
  courses: Course[];
  students: Student[];
  trainingSessions: TrainingSession[];
  selectedElementId: string | null;
  setUserRole: (role: UserRole) => void;
  setCurrentStudent: (student: Student | null) => void;
  addCourse: (name: string) => Course;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  addElement: (courseId: string, element: Omit<CourseElement, 'id'>) => void;
  updateElement: (courseId: string, elementId: string, updates: Partial<CourseElement>) => void;
  deleteElement: (courseId: string, elementId: string) => void;
  setSelectedElementId: (id: string | null) => void;
  addStudent: (name: string) => Student;
  deleteStudent: (id: string) => void;
  addTrainingSession: (session: TrainingSession) => void;
  getStudentSessions: (studentId: string) => TrainingSession[];
}

const sampleCourses: Course[] = [
  {
    id: 'sample-1',
    name: '初级路线 A',
    createdAt: new Date().toISOString(),
    width: 800,
    height: 600,
    elements: [
      { id: 'e1', type: 'jump', x: 150, y: 150, order: 1, label: '1' },
      { id: 'e2', type: 'jump', x: 350, y: 150, order: 2, label: '2' },
      { id: 'e3', type: 'arrow', x: 250, y: 250, order: 0, rotation: 45 },
      { id: 'e4', type: 'jump', x: 550, y: 250, order: 3, label: '3' },
      { id: 'e5', type: 'jump', x: 350, y: 400, order: 4, label: '4' },
      { id: 'e6', type: 'step', x: 450, y: 320, order: 0, steps: 6 },
      { id: 'e7', type: 'forbidden', x: 100, y: 350, order: 0, width: 100, height: 80 },
    ],
  },
  {
    id: 'sample-2',
    name: '进阶路线 B',
    createdAt: new Date().toISOString(),
    width: 800,
    height: 600,
    elements: [
      { id: 'e1', type: 'jump', x: 100, y: 100, order: 1, label: '1' },
      { id: 'e2', type: 'jump', x: 300, y: 120, order: 2, label: '2' },
      { id: 'e3', type: 'turn', x: 500, y: 150, order: 0, radius: 60 },
      { id: 'e4', type: 'jump', x: 650, y: 250, order: 3, label: '3' },
      { id: 'e5', type: 'jump', x: 500, y: 400, order: 4, label: '4' },
      { id: 'e6', type: 'jump', x: 250, y: 450, order: 5, label: '5' },
      { id: 'e7', type: 'jump', x: 100, y: 300, order: 6, label: '6' },
    ],
  },
];

const sampleStudents: Student[] = [
  { id: 's1', name: '小明' },
  { id: 's2', name: '小红' },
  { id: 's3', name: '小华' },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userRole: null,
      currentStudent: null,
      courses: sampleCourses,
      students: sampleStudents,
      trainingSessions: [],
      selectedElementId: null,

      setUserRole: (role) => set({ userRole: role }),

      setCurrentStudent: (student) => set({ currentStudent: student }),

      addCourse: (name) => {
        const newCourse: Course = {
          id: generateId(),
          name,
          createdAt: new Date().toISOString(),
          elements: [],
          width: 800,
          height: 600,
        };
        set((state) => ({ courses: [...state.courses, newCourse] }));
        return newCourse;
      },

      updateCourse: (id, updates) =>
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
        })),

      addElement: (courseId, element) => {
        const newElement: CourseElement = {
          ...element,
          id: generateId(),
        };
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === courseId ? { ...c, elements: [...c.elements, newElement] } : c
          ),
        }));
      },

      updateElement: (courseId, elementId, updates) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  elements: c.elements.map((e) =>
                    e.id === elementId ? { ...e, ...updates } : e
                  ),
                }
              : c
          ),
        })),

      deleteElement: (courseId, elementId) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === courseId
              ? { ...c, elements: c.elements.filter((e) => e.id !== elementId) }
              : c
          ),
          selectedElementId: get().selectedElementId === elementId ? null : get().selectedElementId,
        })),

      setSelectedElementId: (id) => set({ selectedElementId: id }),

      addStudent: (name) => {
        const newStudent: Student = {
          id: generateId(),
          name,
        };
        set((state) => ({ students: [...state.students, newStudent] }));
        return newStudent;
      },

      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        })),

      addTrainingSession: (session) =>
        set((state) => ({
          trainingSessions: [...state.trainingSessions, session],
        })),

      getStudentSessions: (studentId) =>
        get().trainingSessions.filter((s) => s.studentId === studentId),
    }),
    {
      name: 'equestrian-memory-board',
      partialize: (state) => ({
        courses: state.courses,
        students: state.students,
        trainingSessions: state.trainingSessions,
        userRole: state.userRole,
        currentStudent: state.currentStudent,
      }),
    }
  )
);
