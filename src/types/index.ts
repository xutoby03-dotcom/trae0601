export type LocationType = 'indoor' | 'outdoor';
export type RegistrationStatus = 'confirmed' | 'waitlist' | 'cancelled';
export type FilterType = 'all' | 'today' | 'weekend' | 'indoor' | 'outdoor';

export interface Activity {
  id: string;
  title: string;
  ageRange: string;
  location: string;
  locationType: LocationType;
  startTime: string;
  endTime: string;
  description: string;
  maxParticipants: number;
  needParent: boolean;
  notes: string;
  coverEmoji: string;
  createdAt: string;
  creatorName?: string;
}

export interface Registration {
  id: string;
  activityId: string;
  childNickname: string;
  allergyInfo: string;
  attendeeCount: number;
  parentPhone: string;
  status: RegistrationStatus;
  waitlistNumber: number | null;
  registeredAt: string;
}

export interface PublishFormData {
  title: string;
  ageRange: string;
  location: string;
  locationType: LocationType;
  startTime: string;
  endTime: string;
  description: string;
  maxParticipants: number;
  needParent: boolean;
  notes: string;
  coverEmoji: string;
}

export interface RegisterFormData {
  childNickname: string;
  allergyInfo: string;
  attendeeCount: number;
  parentPhone: string;
}

export const AGE_RANGES = [
  '0-2岁',
  '3-5岁',
  '6-8岁',
  '9-12岁',
  '全年龄段',
];

export const COVER_EMOJIS = [
  '🎨', '⚽', '🏀', '🎪', '📚', '🎮', '🧩', '🎵',
  '🌳', '🏊', '🚴', '🛝', '🎠', '🧸', '🎯', '🪁',
];
