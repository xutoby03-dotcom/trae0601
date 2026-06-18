export type SupplyType = 'blackPen' | 'redPen' | 'bluePen' | 'eraser' | 'cleaner' | 'magnet';

export type EraserStatus = 'clean' | 'normal' | 'replace';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export type TaskSource = 'inspection' | 'feedback' | 'low_stock' | 'manual';

export type FeedbackType = 'pen_empty' | 'supply_missing' | 'other';

export interface Room {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  whiteboardCount: number;
  responsiblePerson: string;
  photoUrl: string;
  createdAt: string;
}

export interface SupplyItem {
  id: string;
  roomId: string;
  type: SupplyType;
  color?: string;
  quantity: number;
  remainingPercent?: number;
  openDate?: string;
  location: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  roomId: string;
  inspector: string;
  inspectionDate: string;
  penStatus: Record<string, boolean>;
  eraserStatus: EraserStatus;
  cleanerLevel: number;
  notes: string;
}

export interface Task {
  id: string;
  roomId: string;
  source: TaskSource;
  supplyType: SupplyType;
  priority: TaskPriority;
  status: TaskStatus;
  description: string;
  createdAt: string;
  completedAt?: string;
  assignee: string;
}

export interface Feedback {
  id: string;
  roomId: string;
  reporter: string;
  type: FeedbackType;
  description: string;
  createdAt: string;
  status: 'pending' | 'resolved';
}
