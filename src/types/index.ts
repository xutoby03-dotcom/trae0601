export interface HourlyWindData {
  hour: number;
  windDirection: number;
  windSpeed: number;
  gustSpeed: number;
  noiseLevel: number;
  tanglingIndex: number;
}

export interface WindData24h {
  date: string;
  hours: HourlyWindData[];
}

export interface Point {
  x: number;
  y: number;
}

export interface Rooftop {
  id: string;
  name: string;
  width: number;
  height: number;
  outline: Point[];
}

export type PoleStatus = 'normal' | 'warning' | 'danger';
export type PoleMaterial = 'aluminum' | 'steel' | 'fiberglass';
export type FlagMaterial = 'polyester' | 'nylon' | 'cotton';
export type RiskType = 'reduce_height' | 'change_material' | 'relocate';

export interface FlagPole {
  id: string;
  x: number;
  y: number;
  height: number;
  poleMaterial: PoleMaterial;
  flagMaterial: FlagMaterial;
  status: PoleStatus;
}

export interface Sensor {
  id: string;
  x: number;
  y: number;
  type: 'anemometer' | 'wind_vane' | 'noise';
}

export interface RiskMark {
  id: string;
  poleId: string;
  type: RiskType;
  note: string;
  createdAt: string;
}

export interface PoleStats {
  poleId: string;
  avgWindSpeed: number;
  maxGustSpeed: number;
  tanglingHours: number;
  avgTanglingIndex: number;
  riskScore: number;
}

export interface AppState {
  currentHour: number;
  isPlaying: boolean;
  playbackSpeed: number;
  selectedPoleId: string | null;
  focusedPoleId: string | null;
  riskMarks: RiskMark[];
  zoom: number;
  pan: Point;
  contextMenu: { x: number; y: number; poleId: string } | null;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  opacity: number;
}

export const MATERIAL_DAMPING: Record<FlagMaterial, number> = {
  polyester: 0.8,
  nylon: 0.6,
  cotton: 0.4,
};

export const POLE_MATERIAL_STRENGTH: Record<PoleMaterial, number> = {
  steel: 1.2,
  aluminum: 1.0,
  fiberglass: 0.8,
};

export const RISK_TYPE_LABELS: Record<RiskType, string> = {
  reduce_height: '需降低高度',
  change_material: '需更换材质',
  relocate: '建议移位',
};

export const POLE_MATERIAL_LABELS: Record<PoleMaterial, string> = {
  aluminum: '铝合金',
  steel: '钢材',
  fiberglass: '玻璃纤维',
};

export const FLAG_MATERIAL_LABELS: Record<FlagMaterial, string> = {
  polyester: '聚酯纤维',
  nylon: '尼龙',
  cotton: '纯棉',
};
