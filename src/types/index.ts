export type MaterialType = 'wood' | 'plastic' | 'silicone' | 'plush' | 'rubber' | 'metal' | 'cloth' | 'other';

export type CleanMethodType = 'water' | 'wipe' | 'uv' | 'water_wipe' | 'special';

export type CleanMethodAction = 'water' | 'wipe' | 'uv' | 'dry';

export type DamageType = 'peeling' | 'loose' | 'mold' | 'crack' | 'other';

export type TaskTrigger = 'manual' | 'teething' | 'flu' | 'visitor';

export type TaskPriority = 'normal' | 'urgent' | 'critical';

export type AlertStatus = 'pending' | 'resolved' | 'disabled';

export interface Toy {
  id: string;
  name: string;
  material: MaterialType;
  ageRange: string;
  cleanMethod: CleanMethodType;
  purchaseDate: string;
  storageLocation: string;
  photo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CleaningRecord {
  id: string;
  toyId: string;
  date: string;
  methods: CleanMethodAction[];
  hasDamage: boolean;
  hasOdor: boolean;
  damageType?: DamageType;
  notes?: string;
}

export interface DisinfectionTask {
  id: string;
  title: string;
  trigger: TaskTrigger;
  toyIds: string[];
  priority: TaskPriority;
  dueDate: string;
  completed: boolean;
  completedToyIds: string[];
  createdAt: string;
}

export interface AlertItem {
  id: string;
  toyId: string;
  type: DamageType;
  recordId: string;
  status: AlertStatus;
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
}

export interface DailyStat {
  date: string;
  count: number;
}

export interface MethodStat {
  name: string;
  value: number;
  color: string;
}

export interface StatsSummary {
  totalToys: number;
  monthlyCleanCount: number;
  pendingCleanCount: number;
  alertCount: number;
  dailyTrend: DailyStat[];
  methodBreakdown: MethodStat[];
}

export interface StorageGroup {
  location: string;
  toys: Toy[];
  completedCount: number;
  totalCount: number;
}
