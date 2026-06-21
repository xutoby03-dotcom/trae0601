export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';

export interface Fabric {
  id: string;
  name: string;
  composition: string;
  weight: number;
  elasticity: number;
  drape: number;
  thickness: number;
  translucency: number;
  season: Season;
  softness: number;
  stiffness: number;
  roughness: number;
  coolness: number;
  photoSmooth: string;
  photoWrinkled: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardItem {
  id: string;
  fabricId: string;
  boardId: string;
  order: number;
  addedAt: string;
  notes?: string;
}

export interface FilterCriteria {
  season?: Season[];
  weightMin?: number;
  weightMax?: number;
  elasticityMin?: number;
  elasticityMax?: number;
  drapeMin?: number;
  drapeMax?: number;
  thicknessMin?: number;
  thicknessMax?: number;
  translucencyMin?: number;
  translucencyMax?: number;
  softnessMin?: number;
  softnessMax?: number;
  stiffnessMin?: number;
  stiffnessMax?: number;
  roughnessMin?: number;
  roughnessMax?: number;
  coolnessMin?: number;
  coolnessMax?: number;
  search?: string;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Partial<FilterCriteria>;
}

export interface TouchDimensions {
  softness: number;
  stiffness: number;
  roughness: number;
  coolness: number;
}

export interface FabricFormData {
  name: string;
  composition: string;
  weight: number;
  elasticity: number;
  drape: number;
  thickness: number;
  translucency: number;
  season: Season;
  softness: number;
  stiffness: number;
  roughness: number;
  coolness: number;
  photoSmooth: string;
  photoWrinkled: string;
  notes?: string;
}

export const SEASON_LABELS: Record<Season, string> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季',
  all: '四季',
};

export const TOUCH_DIMENSION_LABELS: Record<keyof TouchDimensions, string> = {
  softness: '柔软',
  stiffness: '挺括',
  roughness: '粗糙',
  coolness: '凉感',
};

export const PROPERTY_LABELS: Record<string, string> = {
  composition: '成分',
  weight: '克重',
  elasticity: '弹力',
  drape: '垂感',
  thickness: '厚薄',
  translucency: '透光',
  season: '适合季节',
  softness: '柔软',
  stiffness: '挺括',
  roughness: '粗糙',
  coolness: '凉感',
};
