import type {
  SeatType,
  SeatStatus,
  Seat,
  Course,
  ApplicationStatus,
  Application,
  Statistics,
  CourseStatistics,
} from '../../shared/types';

export type {
  SeatType,
  SeatStatus,
  Seat,
  Course,
  ApplicationStatus,
  Application,
  Statistics,
  CourseStatistics,
};

export interface CourseWithQuota extends Course {
  usedQuota: number;
}

export type TabKey = 'courses' | 'apply' | 'checkin' | 'statistics';

export const statusLabels: Record<ApplicationStatus, string> = {
  pending_approval: '待审批',
  approved: '已通过',
  rejected: '已拒绝',
  waitlist: '候补中',
  checked_in: '已签到',
  no_show: '未到',
  cancelled: '已取消',
};

export const statusColors: Record<ApplicationStatus, string> = {
  pending_approval: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  waitlist: 'bg-blue-100 text-blue-800',
  checked_in: 'bg-emerald-100 text-emerald-800',
  no_show: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-slate-100 text-slate-800',
};

export const seatTypeLabels: Record<string, string> = {
  fixed: '固定座位',
  auditor: '旁听座位',
  aisle: '过道',
  empty: '空白',
};

export const seatStatusColors: Record<string, string> = {
  available: 'bg-green-500 hover:bg-green-400',
  reserved: 'bg-yellow-500 hover:bg-yellow-400',
  checked_in: 'bg-blue-600 hover:bg-blue-500',
  blocked: 'bg-gray-400 cursor-not-allowed',
};
