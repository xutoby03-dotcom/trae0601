export type RoastLevel = 'light' | 'medium' | 'dark';
export type NegativeReason = 'sour' | 'bitter' | 'weak' | 'other' | null;

export interface CoffeeRecord {
  id: string;
  beanName: string;
  roastLevel: RoastLevel;
  batchDate: string;
  grinder: string;
  dripper: string;
  grindSetting: number;
  waterTemp: number;
  ratio: string;
  pourStages: number;
  brewTime: number;
  flavorNotes: string;
  isTodayRecommended: boolean;
  parentId: string | null;
  negativeReason: NegativeReason;
  adjustmentNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  beanName: string;
  roastLevel: RoastLevel | 'all';
  grinder: string;
  dripper: string;
}

export const ROAST_LABELS: Record<RoastLevel, string> = {
  light: '浅烘',
  medium: '中烘',
  dark: '深烘',
};

export const NEGATIVE_REASON_LABELS: Record<Exclude<NegativeReason, null>, string> = {
  sour: '太酸',
  bitter: '太苦',
  weak: '太淡',
  other: '其他',
};

export const GRINDER_OPTIONS = ['Fellow Ode', 'Baratza Encore', '1Zpresso JX Pro', 'Niche Zero', 'DF64'];
export const DRIPPER_OPTIONS = ['V60 01', 'V60 02', 'Kalita Wave 155', 'Kalita Wave 185', 'Origami', 'April'];
