export type Scene = 'indoor' | 'outdoor' | 'both';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type SkipReason = 'too_tired' | 'no_materials' | 'dont_want_out' | 'other';

export interface Step {
  id: string;
  description: string;
  order: number;
}

export interface Task {
  id: string;
  name: string;
  ageRange: string;
  durationMin: number;
  budget: number;
  scene: Scene;
  energyLevel: EnergyLevel;
  preparationItems: string[];
  steps: Step[];
  createdAt: number;
}

export interface Photo {
  id: string;
  dataUrl: string;
  order: number;
}

export interface Completion {
  id: string;
  taskId: string;
  starRating: number;
  reflection: string;
  photos: Photo[];
  checkedSteps: string[];
  completedAt: number;
}

export interface SkipRecord {
  id: string;
  taskId: string;
  reason: SkipReason;
  customReason?: string;
  skippedAt: number;
}

export interface FilterState {
  weather?: 'sunny' | 'rainy';
  maxDuration?: number;
  maxBudget?: number;
  energyLevel?: EnergyLevel;
  scene?: Scene;
}

export const SCENE_LABELS: Record<Scene, string> = {
  indoor: '室内',
  outdoor: '室外',
  both: '室内+室外',
};

export const ENERGY_LABELS: Record<EnergyLevel, string> = {
  low: '轻松',
  medium: '适中',
  high: '旺盛',
};

export const SKIP_REASON_LABELS: Record<SkipReason, string> = {
  too_tired: '太累了',
  no_materials: '没准备材料',
  dont_want_out: '不想出门',
  other: '其他原因',
};

export const SCENE_COLORS: Record<Scene, string> = {
  indoor: 'bg-blue-100 text-blue-700',
  outdoor: 'bg-green-100 text-green-700',
  both: 'bg-purple-100 text-purple-700',
};

export const ENERGY_COLORS: Record<EnergyLevel, string> = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};
