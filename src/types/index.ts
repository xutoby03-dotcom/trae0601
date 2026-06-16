export type LightRequirement = '低光' | '散射光' | '半日照' | '全日照';

export type TimelineEventType = 'water' | 'move' | 'prune' | 'fertilize' | 'photo' | 'other' | 'repot';

export type RootCondition = '健康' | '轻微缠绕' | '严重缠绕' | '有烂根';

export type SoilType = '颗粒土' | '营养土' | '珍珠岩' | '其他';

export interface Plant {
  id: string;
  name: string;
  species?: string;
  position: string;
  potDiameterCm: number;
  currentSoilMixId: string;
  lightRequirement: LightRequirement;
  wateringRhythm: string;
  lastWatered?: string;
  latestPhotoUrl?: string;
  createdAt: string;
  isAlive: boolean;
  deathReason?: string;
  deathDate?: string;
}

export interface SoilMix {
  id: string;
  name: string;
  granularRatio: number;
  nutrientRatio: number;
  perliteRatio: number;
  otherIngredients?: string;
}

export interface TimelineEvent {
  id: string;
  plantId: string;
  type: TimelineEventType;
  date: string;
  description?: string;
  photoUrl?: string;
}

export interface RepotRecord {
  id: string;
  plantId: string;
  date: string;
  newPotDiameterCm: number;
  rootPruned: boolean;
  rootCondition: RootCondition;
  baseFertilizer?: string;
  hadPests: boolean;
  pestType?: string;
  hadRootRot: boolean;
  soilMixId: string;
  recoveryEndDate: string;
  notes?: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
}

export interface SoilInventory {
  id: string;
  type: SoilType;
  name: string;
  remainingLiters: number;
  thresholdLiters: number;
}

export interface PlantStore {
  plants: Plant[];
  soilMixes: SoilMix[];
  timelineEvents: TimelineEvent[];
  repotRecords: RepotRecord[];
  soilInventories: SoilInventory[];

  addPlant: (plant: Omit<Plant, 'id' | 'createdAt'>) => void;
  updatePlant: (id: string, data: Partial<Plant>) => void;
  deletePlant: (id: string) => void;

  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;
  addRepotRecord: (record: Omit<RepotRecord, 'id'>) => void;
  updateSoilInventory: (id: string, data: Partial<SoilInventory>) => void;

  getPlantById: (id: string) => Plant | undefined;
  getSoilMixById: (id: string) => SoilMix | undefined;
  getRepotRecordsByPlantId: (plantId: string) => RepotRecord[];
  getTimelineEventsByPlantId: (plantId: string) => TimelineEvent[];
  isPlantInRecovery: (plantId: string) => boolean;
  getRecoveryDaysLeft: (plantId: string) => number;
}
