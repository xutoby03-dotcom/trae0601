export interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  isMainCharacter: boolean;
}

export type TaskColumn = 'secret' | 'same_day' | 'advance';
export type SecrecyLevel = 'normal' | 'high' | 'extreme';

export interface Task {
  id: string;
  column: TaskColumn;
  title: string;
  codeName: string;
  assigneeId: string | null;
  deadline: string;
  budget: number;
  isPaid: boolean;
  photoEvidence: string[];
  isSecret: boolean;
  completed: boolean;
  notes: string;
}

export interface TimelineNode {
  id: string;
  time: string;
  title: string;
  description: string;
  assigneeId: string | null;
  icon: string;
  order: number;
  completed: boolean;
}

export interface BirthdayPlan {
  id: string;
  mainCharacter: string;
  date: string;
  meetingPoint: string;
  totalBudget: number;
  secrecyLevel: SecrecyLevel;
  participants: Participant[];
  tasks: Task[];
  timeline: TimelineNode[];
}

export const COLUMN_META: Record<TaskColumn, { title: string; emoji: string; gradient: string; borderColor: string; description: string }> = {
  secret: {
    title: '不能被主角发现',
    emoji: '🤫',
    gradient: 'from-purple-500 to-indigo-500',
    borderColor: 'border-purple-300',
    description: '这些任务绝对不能让主角知道',
  },
  same_day: {
    title: '当天必须完成',
    emoji: '⚡',
    gradient: 'from-coral-500 to-orange-400',
    borderColor: 'border-coral-300',
    description: '生日当天一定要搞定的事',
  },
  advance: {
    title: '可提前准备',
    emoji: '📋',
    gradient: 'from-mint-500 to-teal-500',
    borderColor: 'border-mint-300',
    description: '提前安排好的，当天就省心了',
  },
};

export const SECRECY_LEVEL_META: Record<SecrecyLevel, { label: string; emoji: string; color: string }> = {
  normal: { label: '普通保密', emoji: '🔒', color: 'bg-slate2-100 text-slate2-700' },
  high: { label: '高度保密', emoji: '🔐', color: 'bg-amber-100 text-amber-700' },
  extreme: { label: '绝密行动', emoji: '🛡️', color: 'bg-red-100 text-red-700' },
};
