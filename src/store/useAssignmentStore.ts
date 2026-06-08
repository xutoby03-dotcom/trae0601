import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Course, Assignment, Step } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function computeProgressFromSteps(steps: Step[]): number {
  if (steps.length === 0) return 0;
  const completed = steps.filter((s) => s.completed).length;
  return Math.round((completed / steps.length) * 100);
}

function computeStatus(deadline: string, progress: number): Assignment['status'] {
  if (progress >= 100) return 'completed';
  const now = new Date();
  const dl = new Date(deadline);
  if (dl < now) return 'overdue';
  return 'in_progress';
}

interface AssignmentStore {
  courses: Course[];
  assignments: Assignment[];

  addCourse: (course: Omit<Course, 'id'>) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, data: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  toggleStep: (assignmentId: string, stepId: string) => void;
  addStep: (assignmentId: string, step: Omit<Step, 'id'>) => void;
  deleteStep: (assignmentId: string, stepId: string) => void;
  reorderSteps: (assignmentId: string, stepId: string, newOrder: number) => void;
}

export const useAssignmentStore = create<AssignmentStore>()(
  persist(
    (set) => ({
      courses: [],
      assignments: [],

      addCourse: (course) =>
        set((state) => ({
          courses: [...state.courses, { ...course, id: generateId() }],
        })),

      updateCourse: (id, data) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),

      deleteCourse: (id) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.id !== id),
          assignments: state.assignments.filter((a) => a.courseId !== id),
        })),

      addAssignment: (assignment) =>
        set((state) => {
          const id = generateId();
          const progress = computeProgressFromSteps(assignment.steps);
          const status = computeStatus(assignment.deadline, progress || assignment.progress);
          return {
            assignments: [
              ...state.assignments,
              { ...assignment, id, progress, status },
            ],
          };
        }),

      updateAssignment: (id, data) =>
        set((state) => ({
          assignments: state.assignments.map((a) => {
            if (a.id !== id) return a;
            const updated = { ...a, ...data };
            if (data.steps) {
              updated.progress = computeProgressFromSteps(data.steps);
            }
            updated.status = computeStatus(updated.deadline, updated.progress);
            return updated;
          }),
        })),

      deleteAssignment: (id) =>
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
        })),

      toggleStep: (assignmentId, stepId) =>
        set((state) => ({
          assignments: state.assignments.map((a) => {
            if (a.id !== assignmentId) return a;
            const steps = a.steps.map((s) =>
              s.id === stepId ? { ...s, completed: !s.completed } : s
            );
            const progress = computeProgressFromSteps(steps);
            const status = computeStatus(a.deadline, progress);
            return { ...a, steps, progress, status };
          }),
        })),

      addStep: (assignmentId, step) =>
        set((state) => ({
          assignments: state.assignments.map((a) => {
            if (a.id !== assignmentId) return a;
            const steps = [
              ...a.steps,
              { ...step, id: generateId(), order: a.steps.length },
            ];
            const progress = computeProgressFromSteps(steps);
            const status = computeStatus(a.deadline, progress);
            return { ...a, steps, progress, status };
          }),
        })),

      deleteStep: (assignmentId, stepId) =>
        set((state) => ({
          assignments: state.assignments.map((a) => {
            if (a.id !== assignmentId) return a;
            const steps = a.steps
              .filter((s) => s.id !== stepId)
              .map((s, i) => ({ ...s, order: i }));
            const progress = computeProgressFromSteps(steps);
            const status = computeStatus(a.deadline, progress);
            return { ...a, steps, progress, status };
          }),
        })),

      reorderSteps: (assignmentId, stepId, newOrder) =>
        set((state) => ({
          assignments: state.assignments.map((a) => {
            if (a.id !== assignmentId) return a;
            const steps = [...a.steps];
            const idx = steps.findIndex((s) => s.id === stepId);
            if (idx === -1) return a;
            const [moved] = steps.splice(idx, 1);
            steps.splice(newOrder, 0, moved);
            const reordered = steps.map((s, i) => ({ ...s, order: i }));
            return { ...a, steps: reordered };
          }),
        })),
    }),
    {
      name: 'deadline-radar-store',
    }
  )
);

export function isUrgent(deadline: string, progress: number): boolean {
  const now = new Date();
  const dl = new Date(deadline);
  const hoursUntil = (dl.getTime() - now.getTime()) / (1000 * 60 * 60);
  return (
    (hoursUntil < 24 && progress < 50) ||
    (hoursUntil < 48 && progress < 30) ||
    hoursUntil < 0
  );
}

export function getUrgencyScore(deadline: string, progress: number): number {
  const now = new Date();
  const dl = new Date(deadline);
  const daysUntil = (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const maxDays = 14;
  const timeFactor = Math.max(0, 1 - daysUntil / maxDays);
  const progressFactor = 1 - progress / 100;
  return Math.min(1, timeFactor * progressFactor);
}

export function formatDeadline(deadline: string): string {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffMs < 0) return '已过期';
  if (diffHours < 1) return `${Math.round(diffMs / (1000 * 60))}分钟后`;
  if (diffHours < 24) return `${Math.round(diffHours)}小时后`;
  if (diffDays < 7) return `${Math.round(diffDays)}天后`;
  return dl.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
