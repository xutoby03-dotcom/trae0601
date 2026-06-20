export type MoonPhase = 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type TargetType = 'galaxy' | 'nebula' | 'cluster' | 'planet' | 'star';

export type EquipmentCategory = 'optics' | 'imaging' | 'mount' | 'accessory' | 'power';

export type FailReason = 'weather' | 'equipment' | 'too_low' | 'light_pollution' | 'fatigue' | 'other';

export interface MoonData {
  phase: MoonPhase;
  phaseName: string;
  illumination: number;
  moonRise: string;
  moonSet: string;
  age: number;
}

export interface WeatherHour {
  hour: number;
  cloudCover: number;
  temperature: number;
  windSpeed: number;
  humidity: number;
  visibility: number;
  score: number;
}

export interface Constellation {
  id: string;
  name: string;
  latinName: string;
  symbol: string;
  riseTime: string;
  setTime: string;
  bestTime: string;
  altitude: number;
  season: string;
}

export interface DeepSkyTarget {
  id: string;
  name: string;
  commonName?: string;
  type: TargetType;
  typeLabel: string;
  magnitude: number;
  size: string;
  distance: string;
  constellation: string;
  constellationId: string;
  difficulty: Difficulty;
  bestTime: string;
  description: string;
  recommendedEquipment: string;
  exposureSuggestion: string;
}

export interface ChecklistTarget {
  id: string;
  planDate: string;
  targetId: string;
  target: DeepSkyTarget;
  order: number;
  notes: string;
  completed: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  category: EquipmentCategory;
  categoryLabel: string;
  essential: boolean;
  packed: boolean;
}

export interface ObservationRecord {
  id: string;
  date: string;
  targetId: string;
  targetName: string;
  seen: boolean;
  seeing: number;
  iso: string;
  shutter: string;
  aperture: string;
  frames: number;
  darkFrames: string;
  flatFrames: string;
  biasFrames: string;
  failReason: FailReason | '';
  failReasonLabel: string;
  stackNotes: string;
  software: string;
  totalExposure: string;
  notes: string;
  createdAt: number;
}
