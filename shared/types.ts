export interface Session {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  description?: string;
}

export type GuestStatus = 'invited' | 'confirmed' | 'checked_in' | 'no_show' | 'left';

export interface Guest {
  id: string;
  name: string;
  source: string;
  relationship: string;
  sessionId: string;
  headcount: number;
  dietaryRestrictions: string;
  phone: string;
  isConfirmed: boolean;
  isVIP: boolean;
  status: GuestStatus;
  createdAt: string;
  confirmedAt?: string;
  checkedInAt?: string;
  leftAt?: string;
  noShowReason?: string;
  notes?: string;
}

export interface Feedback {
  id: string;
  guestId: string;
  sessionId: string;
  tasteScore: number;
  serviceScore: number;
  flowScore: number;
  priceAcceptance: number;
  positiveTags: string[];
  negativeTags: string[];
  photos: string[];
  comment: string;
  createdAt: string;
  isFollowedUp: boolean;
  followedUpAt?: string;
}

export interface Reminder {
  id: string;
  type: 'unconfirmed' | 'no_show' | 'follow_up';
  guestId: string;
  sessionId: string;
  message: string;
  createdAt: string;
  isDismissed: boolean;
}

export interface SessionStats {
  sessionId: string;
  sessionName: string;
  totalInvited: number;
  totalConfirmed: number;
  totalCheckedIn: number;
  totalNoShow: number;
  checkInRate: number;
  avgTasteScore: number;
  avgServiceScore: number;
  avgFlowScore: number;
  avgPriceAcceptance: number;
}

export interface KeywordCount {
  keyword: string;
  count: number;
}

export interface OverviewStats {
  totalSessions: number;
  totalGuests: number;
  totalCheckedIn: number;
  overallCheckInRate: number;
  avgOverallScore: number;
  sessionStats: SessionStats[];
  positiveKeywords: KeywordCount[];
  negativeKeywords: KeywordCount[];
  vipGuests: Guest[];
  needFollowUp: Feedback[];
}
