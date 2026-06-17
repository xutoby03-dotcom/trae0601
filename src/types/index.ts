export enum StarterStatus {
  HEALTHY = 'healthy',
  LOCKED = 'locked',
  COLD = 'cold',
  ARCHIVED = 'archived'
}

export enum StorageType {
  ROOM_TEMP = 'room_temp',
  REFRIGERATED = 'refrigerated'
}

export enum AnomalyType {
  COLLAPSE = 'collapse',
  ODOR = 'odor',
  MOLD = 'mold'
}

export type OdorDescription = 'fruity' | 'vinegar' | 'alcohol' | 'bready' | 'putrid' | 'cheesy';

export interface MotherStarter {
  id: string;
  name: string;
  flourType: string;
  waterRatio: number;
  container: string;
  storageType: StorageType;
  createdAt: string;
  photoUrl?: string;
  currentWeight: number;
  status: StarterStatus;
  feedingInterval: number;
  lastFedAt?: string;
  notes?: string;
}

export interface FeedingRecord {
  id: string;
  starterId: string;
  fedAt: string;
  discardAmount: number;
  flourAdded: number;
  waterAdded: number;
  temperature: number;
  odor: OdorDescription;
  riseMultiplier: number;
  peakTime: number;
  anomalies: AnomalyType[];
  notes?: string;
  activityScore: number;
}

export interface ProductionOrder {
  id: string;
  orderNo: string;
  productName: string;
  plannedDate: string;
  plannedQuantity: number;
  starterId?: string;
  starterAmount?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface AnomalyRecord {
  id: string;
  starterId: string;
  type: AnomalyType;
  detectedAt: string;
  reportedBy: string;
  description: string;
  status: 'open' | 'resolved' | 'discarded';
  resolvedAt?: string;
  resolutionNotes?: string;
  affectedOrderIds: string[];
}

export interface PendingFeeding {
  starterId: string;
  starterName: string;
  dueAt: string;
  overdue: boolean;
}

export interface ActivityTrendItem {
  date: string;
  starterId: string;
  starterName: string;
  score: number;
}

export interface DashboardData {
  totalStarters: number;
  healthyStarters: number;
  lockedStarters: number;
  pendingFeedings: PendingFeeding[];
  recentAnomalies: AnomalyRecord[];
  affectedOrders: ProductionOrder[];
  activityTrend: ActivityTrendItem[];
}
