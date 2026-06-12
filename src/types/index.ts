export type Priority = 'high' | 'medium' | 'low';

export type TaskStatus = 'pending' | 'claimed' | 'confirmed' | 'in_progress' | 'completed';

export type TaskCategory = 'pickup' | 'ceremony' | 'banquet' | 'logistics' | 'photo' | 'other';

export interface Person {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  phone?: string;
}

export interface Item {
  id: string;
  name: string;
  isChecked: boolean;
}

export interface ChangeLog {
  id: string;
  type: 'time' | 'person' | 'location' | 'item' | 'other';
  reason: string;
  timestamp: string;
  operatorId: string;
  oldValue?: string;
  newValue?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  startTime: string;
  endTime?: string;
  location: string;
  status: TaskStatus;
  assigneeId?: string;
  backupId?: string;
  itemList: Item[];
  photos: string[];
  changeLogs: ChangeLog[];
  confirmedAt?: string;
  isCompleted: boolean;
  completedAt?: string;
  isOvertime: boolean;
  overtimeReason?: string;
}

export interface ReviewRecord {
  id: string;
  type: 'missed' | 'overtime' | 'suggestion';
  taskId?: string;
  content: string;
  createdAt: string;
}

export interface PersonStats {
  personId: string;
  totalTasks: number;
  completedTasks: number;
  onTimeTasks: number;
  rating: number;
}

export type ViewType = 'board' | 'timeline' | 'review';

export type FilterStatus = 'all' | TaskStatus;
export type FilterPriority = 'all' | Priority;
export type FilterCategory = 'all' | TaskCategory;

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  pickup: '接亲',
  ceremony: '仪式',
  banquet: '婚宴',
  logistics: '后勤',
  photo: '摄影',
  other: '其他',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: '待认领',
  claimed: '已认领',
  confirmed: '已确认',
  in_progress: '进行中',
  completed: '已完成',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级',
};
