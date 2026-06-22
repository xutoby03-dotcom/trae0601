export type ElementType = 'jump' | 'arrow' | 'step' | 'turn' | 'forbidden';

export type ErrorType = 'miss' | 'reverse' | 'detour' | 'pause';

export interface CourseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  order: number;
  rotation?: number;
  label?: string;
  steps?: number;
  radius?: number;
  width?: number;
  height?: number;
}

export interface Course {
  id: string;
  name: string;
  createdAt: string;
  elements: CourseElement[];
  width: number;
  height: number;
}

export interface Student {
  id: string;
  name: string;
}

export interface ErrorRecord {
  type: ErrorType;
  elementOrder: number;
  description: string;
  timestamp: number;
}

export interface TrainingSession {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  startTime: string;
  endTime?: string;
  errors: ErrorRecord[];
  totalTime: number;
  userSequence: number[];
}

export interface ConfusionPair {
  elementA: number;
  elementB: number;
  count: number;
  type: 'order' | 'direction';
}

export type UserRole = 'coach' | 'student' | null;
