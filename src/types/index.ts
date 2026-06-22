export type GhostLevel = 'none' | 'light' | 'severe';
export type OcclusionLevel = 'none' | 'partial' | 'full';
export type ColorTempBias = 'cool' | 'normal' | 'warm';

export interface Screen {
  id: string;
  widthCm: number;
  heightCm: number;
  material: string;
  heightFromGroundCm: number;
  notes?: string;
}

export interface Lamp {
  id: string;
  model: string;
  positionDistanceCm: number;
  positionAngleDeg: number;
  positionHeightCm: number;
  brightnessLevel: number;
  colorTemp: string;
}

export interface Puppet {
  id: string;
  name: string;
  material: string;
  thicknessMm: number;
  rodLengthCm: number;
}

export interface Actor {
  id: string;
  name: string;
  role: string;
  standingZone: string;
}

export interface LightPosition {
  id: string;
  name: string;
  lampId: string;
  distanceCm: number;
  angleDeg: number;
  heightCm: number;
  brightness: number;
}

export interface Calibration {
  id: string;
  lightPositionId: string;
  sharpnessScore: number;
  ghostLevel: GhostLevel;
  occlusionLevel: OcclusionLevel;
  colorTempBias: ColorTempBias;
  notes?: string;
  createdAt: string;
}

export interface Scene {
  id: string;
  name: string;
  act: string;
  durationSec: number;
}

export interface CharacterEntry {
  id: string;
  sceneId: string;
  puppetId: string;
  lightPositionId: string;
  startTimeSec: number;
  endTimeSec: number;
  notes?: string;
}

export const GHOST_LEVEL_LABELS: Record<GhostLevel, string> = {
  none: '无重影',
  light: '轻微重影',
  severe: '严重重影',
};

export const OCCLUSION_LEVEL_LABELS: Record<OcclusionLevel, string> = {
  none: '无遮挡',
  partial: '局部遮挡',
  full: '完全遮挡',
};

export const COLOR_TEMP_LABELS: Record<ColorTempBias, string> = {
  cool: '偏冷',
  normal: '正常',
  warm: '偏暖',
};

export const PUPPET_MATERIALS = ['牛皮', '驴皮', '羊皮', '塑料', '硬纸板', '其他'];
export const SCREEN_MATERIALS = ['白布', '棉麻布', '真丝', '合成纤维', '其他'];
export const STANDING_ZONES = ['左侧区域', '中央区域', '右侧区域', '流动区域'];
