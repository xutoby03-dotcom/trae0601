export type BadgeStatus = 'active' | 'inactive' | 'lost';
export type VisitorStatus = 'visiting' | 'returned' | 'overtime' | 'lost';
export type LossRecordStatus = 'pending' | 'completed';
export type VisitorFilter = 'all' | 'visiting' | 'returned' | 'overtime';

export interface Badge {
  id: string;
  number: string;
  color: string;
  colorHex: string;
  allowedArea: string;
  deposit: number;
  status: BadgeStatus;
  createdAt: string;
}

export interface Visitor {
  id: string;
  name: string;
  company: string;
  phone: string;
  hostName: string;
  badgeId: string;
  checkInTime: string;
  expectedLeaveTime: string;
  actualLeaveTime?: string;
  status: VisitorStatus;
  notes?: string;
}

export interface LossRecord {
  id: string;
  badgeId: string;
  visitorId: string;
  compensation: number;
  status: LossRecordStatus;
  reportedAt: string;
  remark?: string;
}

export interface DashboardStats {
  todayTotal: number;
  notReturned: number;
  overtimeCount: number;
  avgStayDuration: string;
  areaDistribution: { area: string; count: number }[];
}

export interface VisitorWithBadge extends Visitor {
  badge?: Badge;
}

export const BADGE_COLORS = [
  { name: '蓝色', hex: '#3b82f6' },
  { name: '红色', hex: '#ef4444' },
  { name: '绿色', hex: '#22c55e' },
  { name: '黄色', hex: '#eab308' },
  { name: '紫色', hex: '#8b5cf6' },
  { name: '橙色', hex: '#f97316' },
  { name: '青色', hex: '#06b6d4' },
  { name: '粉色', hex: '#ec4899' },
];

export const ALLOWED_AREAS = [
  '1F 前台大厅',
  '2F 办公区A',
  '3F 办公区B',
  '4F 会议中心',
  '5F 研发部',
  '全区域通行',
];
