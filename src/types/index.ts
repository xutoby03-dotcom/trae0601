export type TicketStatus = 'waiting' | 'calling' | 'served' | 'passed';

export type BusinessType = 'haircut' | 'milktea' | 'repair' | 'other';

export interface Queue {
  id: string;
  businessType: BusinessType;
  businessName: string;
  estimatedTimePerPerson: number;
  isPaused: boolean;
  currentNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  queueId: string;
  number: number;
  nickname: string;
  phoneLast4: string;
  peopleCount: number;
  note: string;
  allowSkip: boolean;
  status: TicketStatus;
  passedCount: number;
  createdAt: string;
  calledAt?: string;
  completedAt?: string;
}

export interface DailyStats {
  date: string;
  totalServed: number;
  totalWaitTime: number;
  hourlyDistribution: Record<number, number>;
}

export interface TicketFormData {
  nickname: string;
  phoneLast4: string;
  peopleCount: number;
  note: string;
  allowSkip: boolean;
}

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  haircut: '理发',
  milktea: '奶茶',
  repair: '修手机',
  other: '其他',
};

export const BUSINESS_TYPE_ICONS: Record<BusinessType, string> = {
  haircut: 'scissors',
  milktea: 'coffee',
  repair: 'wrench',
  other: 'store',
};
