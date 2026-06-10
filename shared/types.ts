export type ActivityType = 'lecture' | 'boardgame' | 'photoshoot' | 'volunteer';

export type ActivityStatus = 'upcoming' | 'ongoing' | 'ended';

export type RegistrationStatus = 'registered' | 'waitlist' | 'cancelled';

export type CheckInStatus = 'pending' | 'checked' | 'absent';

export interface Activity {
  id: string;
  title: string;
  type: ActivityType;
  location: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  fee: number;
  bringItems: string;
  coverImage: string;
  description: string;
  requiresApproval: boolean;
  createdAt: string;
}

export interface Registration {
  id: string;
  activityId: string;
  name: string;
  college: string;
  phone: string;
  isFirstTime: boolean;
  remark: string;
  status: RegistrationStatus;
  checkInStatus: CheckInStatus;
  waitlistPosition: number;
  createdAt: string;
  promotedFromWaitlist: boolean;
}

export interface ActivityStats {
  activityId: string;
  activityTitle: string;
  activityType: ActivityType;
  totalRegistered: number;
  checkedIn: number;
  attendanceRate: number;
  waitlistPromoted: number;
}

export interface CreateActivityDto {
  title: string;
  type: ActivityType;
  location: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  fee: number;
  bringItems: string;
  coverImage: string;
  description: string;
  requiresApproval: boolean;
}

export interface RegisterDto {
  name: string;
  college: string;
  phone: string;
  isFirstTime: boolean;
  remark: string;
}

export interface TypeStats {
  type: ActivityType;
  label: string;
  count: number;
}
