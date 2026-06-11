export type WaterStatus = 'normal' | 'low' | 'high' | 'consecutive_abnormal';

export interface PetProfile {
  id: string;
  name: string;
  weight: number;
  age: number;
  foodType: string;
  bowlLocation: string;
  healthNotes: string;
  waterBaseCoefficient: number;
  createdAt: string;
  updatedAt: string;
}

export interface WaterRecord {
  id: string;
  petId: string;
  date: string;
  waterAdded: number;
  waterRemaining: number;
  fountainOn: boolean;
  urineClumps: number;
  abnormalities: string;
  bowlLocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyWaterStats {
  date: string;
  waterConsumed: number;
  referenceWater: number;
  status: WaterStatus;
  urineClumps: number;
  fountainOn: boolean;
  bowlLocation: string;
  locationChanged?: boolean;
  previousLocation?: string;
}

export interface StatusLabel {
  key: WaterStatus;
  label: string;
  color: string;
  bgColor: string;
}

export interface LocationChangePoint {
  date: string;
  fromLocation: string;
  toLocation: string;
  index: number;
}

export interface LocationChangeComparison {
  changePoint: LocationChangePoint;
  before7Days: DailyWaterStats[];
  after7Days: DailyWaterStats[];
  beforeAvg: number;
  afterAvg: number;
  beforeDays: number;
  afterDays: number;
  diffMl: number;
  diffPercent: number;
  betterLocation: string | null;
}
