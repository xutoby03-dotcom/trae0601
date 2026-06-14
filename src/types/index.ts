export type HarvestSeason = '春茶' | '夏茶' | '秋茶' | '冬茶';

export type JarStatus = 'sealed' | 'open' | 'sold' | 'damaged';

export type SealRingStatus = 'good' | 'normal' | 'poor';

export type OperationType = 'seal' | 'open' | 'sale' | 'refill' | 'damage';

export type DamageReason = 'moisture' | 'deterioration' | 'other';

export interface TeaBatch {
  id: string;
  name: string;
  origin: string;
  harvestSeason: HarvestSeason;
  purchaseDate: string;
  shelfLifeDays: number;
  totalWeight: number;
  remainingWeight: number;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeaJar {
  id: string;
  jarNo: string;
  batchId: string;
  sealedWeight: number;
  currentWeight: number;
  operator: string;
  sealStatus: SealRingStatus;
  desiccantBatch: string;
  sealedAt: string;
  openedAt: string | null;
  status: JarStatus;
  createdAt: string;
  updatedAt: string;
}

export type RefillSourceType = 'jar' | 'batch';

export interface JarOperation {
  id: string;
  jarId: string;
  type: OperationType;
  weight: number;
  operator: string;
  reason: string;
  operatedAt: string;
  sourceType?: RefillSourceType;
  sourceId?: string;
}

export interface AlertItem {
  id: string;
  type: 'expiry' | 'openTooLong';
  level: 'warning' | 'danger';
  jarId: string;
  jarNo: string;
  batchName: string;
  message: string;
  daysLeft: number;
}
