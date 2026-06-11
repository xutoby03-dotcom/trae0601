export type PlatformType = 'damai' | 'maoyan' | 'piaoxingqiu' | 'fenwandao' | 'others';

export type PlanStatus = 'upcoming' | 'ongoing' | 'completed';

export type TicketStatus = 'success' | 'pending_transfer' | 'failed';

export type AccountStatus = 'normal' | 'warning' | 'blocked';

export interface BudgetTier {
  id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
}

export interface SeatArea {
  id: string;
  name: string;
  priority: number;
}

export interface PlatformClaim {
  id: string;
  platform: PlatformType;
  isVerified: boolean;
  hasPrivilegeCode: boolean;
  accountStatus: AccountStatus;
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  platformClaims: PlatformClaim[];
  backupPlan?: string;
  maxTickets: number;
}

export interface ConcertPlan {
  id: string;
  artist: string;
  artistImage?: string;
  city: string;
  venue: string;
  concertDate: string;
  saleStartTime: string;
  status: PlanStatus;
  budgetTiers: BudgetTier[];
  preferredAreas: SeatArea[];
  memberIds: string[];
  createdAt: string;
}

export interface SplitRecord {
  memberId: string;
  amount: number;
  isPaid: boolean;
}

export interface TicketRecord {
  id: string;
  planId: string;
  platform: PlatformType;
  memberId: string;
  seatInfo: string;
  price: number;
  paymentScreenshot?: string;
  status: TicketStatus;
  splitRecords: SplitRecord[];
  obtainedAt: string;
}

export interface PlatformStat {
  platform: PlatformType;
  attempts: number;
  success: number;
  successRate: number;
}

export interface Statistics {
  totalAttempts: number;
  successCount: number;
  successRate: number;
  overBudgetAmount: number;
  platformStats: PlatformStat[];
}

export interface AppSettings {
  theme: 'dark' | 'light';
  notifications: boolean;
}

export interface AppState {
  plans: ConcertPlan[];
  members: Member[];
  tickets: TicketRecord[];
  settings: AppSettings;
}

export const PLATFORM_INFO: Record<PlatformType, { name: string; color: string }> = {
  damai: { name: '大麦', color: '#FF6B35' },
  maoyan: { name: '猫眼', color: '#E91E63' },
  piaoxingqiu: { name: '票星球', color: '#9C27B0' },
  fenwandao: { name: '纷玩岛', color: '#673AB7' },
  others: { name: '其他', color: '#607D8B' },
};
