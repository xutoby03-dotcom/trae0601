export type CourageLevel = 1 | 2 | 3 | 4 | 5;

export type Weekday = "周一" | "周二" | "周三" | "周四" | "周五" | "周六" | "周日";

export type TimeSlot = "上午" | "下午" | "晚上" | "深夜";

export type AvailableSlot = `${Weekday}${TimeSlot}`;

export type SessionType = "恐怖" | "悬疑" | "解谜" | "情感" | "谍战" | "欢乐" | "古风" | "科幻";

export type SessionStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type RegistrationStatus = "registered" | "withdrew" | "substitute" | "checkedIn";

export interface Player {
  id: string;
  nickname: string;
  contact: string;
  courageLevel: CourageLevel;
  tabooThemes: string[];
  isNewbie: boolean;
  availableSlots: AvailableSlot[];
  avatar: string;
  createdAt: string;
}

export interface GameSession {
  id: string;
  storeName: string;
  theme: string;
  type: SessionType;
  durationMinutes: number;
  minPlayers: number;
  maxPlayers: number;
  price: number;
  difficulty: CourageLevel;
  isHorror: boolean;
  scheduledAt: string;
  status: SessionStatus;
  notes?: string;
  needCarpool?: boolean;
  createdAt: string;
}

export interface Registration {
  id: string;
  playerId: string;
  sessionId: string;
  status: RegistrationStatus;
  isPaid: boolean;
  isSubstitute: boolean;
  substituteOfId?: string;
  registeredAt: string;
  paidAt?: string;
  checkedInAt?: string;
  notes?: string;
}

export interface CapacityInfo {
  currentCount: number;
  enough: boolean;
  gap: number;
  overflow: number;
}

export interface HorrorConflict {
  playerId: string;
  playerName: string;
  reason: string;
  severity: "warning" | "danger";
}

export interface RegistrationCheck {
  capacity: CapacityInfo;
  horrorConflicts: HorrorConflict[];
  npcReductionSuggestion: "none" | "mild" | "moderate" | "strong";
  needCarpool: boolean;
}
