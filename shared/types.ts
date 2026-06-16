export type SeatType = 'fixed' | 'auditor' | 'aisle' | 'empty';

export type SeatStatus = 'available' | 'reserved' | 'checked_in' | 'blocked';

export interface Seat {
  id: string;
  row: number;
  col: number;
  type: SeatType;
  status: SeatStatus;
  applicationId?: string;
  studentName?: string;
  hasOutlet: boolean;
}

export interface Course {
  id: string;
  name: string;
  classroom: string;
  capacity: number;
  teacher: string;
  fixedStudents: number;
  auditorQuota: number;
  isKeyCourse: boolean;
  date: string;
  startTime: string;
  endTime: string;
  seats: Seat[][];
  description?: string;
}

export type ApplicationStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'waitlist'
  | 'checked_in'
  | 'no_show'
  | 'cancelled';

export interface Application {
  id: string;
  courseId: string;
  studentName: string;
  className: string;
  reason: string;
  arrivalTime: string;
  needsOutlet: boolean;
  status: ApplicationStatus;
  waitlistPosition?: number;
  seatId?: string;
  createdAt: string;
  checkedInAt?: string;
}

export interface Statistics {
  totalCourses: number;
  totalApplications: number;
  averageAuditorRate: number;
  averageWaitlistCount: number;
  highRiskCourses: number;
  topBorrowClasses: { className: string; count: number }[];
  weeklyTrend: { date: string; auditorCount: number; waitlistCount: number }[];
}

export interface CourseStatistics {
  courseId: string;
  courseName: string;
  totalApplications: number;
  approvedCount: number;
  checkedInCount: number;
  waitlistCount: number;
  noShowCount: number;
  auditorRate: number;
  aisleRiskScore: number;
}
