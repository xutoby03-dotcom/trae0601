export type DryingItemType = 'quilt' | 'clothes' | 'shoes' | 'other';

export type DryingPosition = 'roof-a' | 'roof-b' | 'roof-c' | 'courtyard' | 'balcony-south' | 'balcony-north';

export interface DryingMessage {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface DryingItem {
  id: string;
  owner: string;
  phone: string;
  position: DryingPosition;
  type: DryingItemType;
  startTime: string;
  expectedEndTime: string;
  fearRain: boolean;
  status: 'active' | 'retrieved';
  retrievedAt?: string;
  wasWet?: boolean;
  wasMoved?: boolean;
  messages: DryingMessage[];
  createdAt: string;
}

export interface CommunityRules {
  overtimeWarningMinutes: number;
  overtimeCriticalMinutes: number;
  rainAutoRemind: boolean;
  maxOccupancyHours: number;
}

export const POSITION_LABELS: Record<DryingPosition, string> = {
  'roof-a': 'A栋楼顶',
  'roof-b': 'B栋楼顶',
  'roof-c': 'C栋楼顶',
  'courtyard': '院子公共区',
  'balcony-south': '南阳台',
  'balcony-north': '北阳台',
};

export const TYPE_LABELS: Record<DryingItemType, string> = {
  'quilt': '被子',
  'clothes': '衣服',
  'shoes': '鞋子',
  'other': '其他',
};

export const TYPE_ICONS: Record<DryingItemType, string> = {
  'quilt': '🛏️',
  'clothes': '👕',
  'shoes': '👟',
  'other': '📦',
};

export const DEFAULT_RULES: CommunityRules = {
  overtimeWarningMinutes: 30,
  overtimeCriticalMinutes: 60,
  rainAutoRemind: true,
  maxOccupancyHours: 8,
};
