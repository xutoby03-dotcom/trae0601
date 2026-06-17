export type MemberRole = '伴郎' | '伴娘' | '总协调' | '摄影师' | '化妆师' | '司机' | '其他';

export type TimelineNodeName = '接亲' | '外景' | '仪式' | '午宴' | '晚宴';

export type TaskStatus = 'pending' | 'confirmed' | 'completed' | 'late';

export type ItemStatus = 'idle' | 'intransit' | 'handedover';

export interface Member {
  id: string;
  name: string;
  role: MemberRole;
  phone: string;
  arrivalTime: string;
  canDrive: boolean;
  canKeepValuables: boolean;
  avatar: string;
}

export interface TimelineNode {
  id: string;
  name: TimelineNodeName;
  time: string;
  location: string;
  description: string;
  sortOrder: number;
}

export interface Task {
  id: string;
  timelineNodeId: string;
  name: string;
  description: string;
  location: string;
  remindTime: string;
  itemsToBring: string[];
  responsibleId: string;
  backupId: string;
  status: TaskStatus;
  confirmedAt?: string;
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  description: string;
  currentHolderId: string;
  status: ItemStatus;
}

export interface Handover {
  id: string;
  itemId: string;
  fromMemberId: string;
  toMemberId: string;
  handoverTime: string;
  location: string;
  note: string;
  fromConfirmed: boolean;
  toConfirmed: boolean;
}

export interface TimeConflict {
  memberId: string;
  memberName: string;
  tasks: Task[];
  overlapMinutes: number;
}

export interface MemberWorkload {
  memberId: string;
  memberName: string;
  memberRole: MemberRole;
  totalTasks: number;
  confirmedTasks: number;
  pendingTasks: number;
  conflicts: TimeConflict[];
  tasks: Task[];
}
