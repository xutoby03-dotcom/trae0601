export type Orientation = '东' | '南' | '西' | '北' | '东南' | '东北' | '西南' | '西北';

export type DampLevel = 'none' | 'light' | 'medium' | 'severe';

export type DrainStatus = 'normal' | 'slow' | 'blocked';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'review';

export type RainIntensity = 'light' | 'moderate' | 'heavy' | 'storm';

export interface Area {
  id: string;
  name: string;
  orientation: Orientation;
  areaSize: number;
  drainCount: number;
  pavingMaterial: string;
  lastRepairDate?: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  areaId: string;
  inspectionDate: string;
  rainEventId: string;
  waterPoints: string[];
  wallDampLevel: DampLevel;
  drainStatus: DrainStatus;
  thresholdLeak: boolean;
  flowerPotLayout: string;
  notes: string;
  photos: string[];
  hasAnomaly: boolean;
  createdAt: string;
}

export interface MaintenanceTask {
  id: string;
  areaId: string;
  inspectionId?: string;
  title: string;
  status: TaskStatus;
  responsiblePerson: string;
  constructionPlan: string;
  estimatedCost?: number;
  actualCost?: number;
  reviewDate?: string;
  reviewNotes?: string;
  isRepeatedAnomaly: boolean;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RainEvent {
  id: string;
  date: string;
  intensity: RainIntensity;
  duration: string;
  allChecked: boolean;
}
