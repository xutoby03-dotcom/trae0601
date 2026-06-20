export type DryingStatus = "drying" | "collected" | "rewash";

export type WeatherType = "sunny" | "cloudy" | "rainy" | "windy";

export type RiskLevel = 1 | 2 | 3;

export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface DryingRecord {
  id: string;
  clothingType: string;
  quantity: number;
  location: string;
  startTime: string;
  expectedTime: string;
  owner: string;
  ownerId: string;
  photo?: string;
  status: DryingStatus;
  collectedAt?: string;
  isDry?: boolean;
  isDamp?: boolean;
  needRewash?: boolean;
  notes?: string;
}

export interface BalconyProfile {
  id: string;
  orientation: string;
  isSealed: boolean;
  poleCount: number;
  rainCover: string;
  ventilation: string;
  notes?: string;
}

export interface WeatherData {
  timestamp: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  weatherType: WeatherType;
  riskLevel: RiskLevel;
  riskReasons: string[];
}

export interface MemberStats {
  memberId: string;
  memberName: string;
  avatar: string;
  color: string;
  dryCount: number;
  collectCount: number;
}
