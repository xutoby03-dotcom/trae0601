import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Student, AllergyType } from '@/types';
import { mockStudents, randomName, randomPhone, randomAllergies, CLASSES } from '@/utils/mockData';
import { todayStr } from '@/utils/dateUtils';

interface StudentStore {
  students: Student[];
  currentStudent: Student | null;
  setCurrentStudent: (student: Student | null) => void;
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;
  filterByClass: (className: string) => Student[];
  filterByAllergy: (allergyType: AllergyType) => Student[];
  searchStudents: (keyword: string) => Student[];
  getClasses: () => string[];
}

export const useStudentStore = create<StudentStore>()(
  persist(
    (set, get) => ({
      students: mockStudents,
      currentStudent: null,

      setCurrentStudent: (student) => set({ currentStudent: student }),

      addStudent: (student) =>
        set((state) => ({
          students: [
            ...state.students,
            {
              ...student,
              id: `stu-${Date.now()}`,
              createdAt: todayStr(),
              updatedAt: todayStr(),
            },
          ],
        })),

      updateStudent: (id, updates) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: todayStr() } : s
          ),
          currentStudent:
            state.currentStudent?.id === id
              ? { ...state.currentStudent, ...updates, updatedAt: todayStr() }
              : state.currentStudent,
        })),

      deleteStudent: (id) =>
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
          currentStudent: state.currentStudent?.id === id ? null : state.currentStudent,
        })),

      getStudentById: (id) => get().students.find((s) => s.id === id),

      filterByClass: (className) =>
        get().students.filter((s) => s.className === className),

      filterByAllergy: (allergyType) =>
        get().students.filter((s) =>
          s.allergies.some((a) => a.type === allergyType)
        ),

      searchStudents: (keyword) => {
        const kw = keyword.toLowerCase().trim();
        if (!kw) return get().students;
        return get().students.filter(
          (s) =>
            s.name.toLowerCase().includes(kw) ||
            s.studentNo.includes(kw) ||
            s.className.toLowerCase().includes(kw)
        );
      },

      getClasses: () => {
        const classes = new Set(get().students.map((s) => s.className));
        return Array.from(classes).sort();
      },
    }),
    {
      name: 'allergy-student-store',
    }
  )
);
