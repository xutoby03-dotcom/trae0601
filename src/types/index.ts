export interface Course {
  id: string;
  name: string;
  teacher: string;
  schedule: string;
  credits: number;
  color: string;
}

export interface Step {
  id: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Assignment {
  id: string;
  title: string;
  courseId: string;
  deadline: string;
  estimatedHours: number;
  submitMethod: string;
  attachmentUrl: string;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  steps: Step[];
}
