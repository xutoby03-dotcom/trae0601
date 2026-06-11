export type MeetingType = 'weekly' | 'monthly' | 'project' | 'review' | 'emergency' | 'other';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export type UserRole = 'user' | 'admin';

export interface Attachment {
  name: string;
  url: string;
  type: string;
}

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  date: string;
  participants: string[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  meetingId: string;
  title: string;
  relatedTopic: string;
  deliverable: string;
  assignee: string;
  department: string;
  priority: Priority;
  dueDate: string;
  status: TodoStatus;
  resultNote?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type TodoAction = 'create' | 'update_status' | 'update_priority' | 'update_due_date' | 'update_assignee' | 'complete';

export interface ChangeLog {
  id: string;
  todoId: string;
  action: TodoAction;
  fromValue?: string;
  toValue?: string;
  operator: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  department: string;
  role: UserRole;
}

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  weekly: '周例会',
  monthly: '月度会议',
  project: '项目会议',
  review: '复盘会议',
  emergency: '紧急会议',
  other: '其他',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: '紧急',
  high: '高',
  medium: '中',
  low: '低',
};

export const STATUS_LABELS: Record<TodoStatus, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
  overdue: '已逾期',
};

export const DEPARTMENTS = [
  '产品部',
  '研发部',
  '设计部',
  '运营部',
  '市场部',
  '人力资源部',
  '财务部',
];
