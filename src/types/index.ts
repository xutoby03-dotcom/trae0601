export interface Annotations {
  sibilance: number;
  nasality: number;
  plosives: number;
  noiseFloor: number;
  emotion: number;
}

export interface AudioTake {
  id: string;
  name: string;
  microphone: string;
  preamp: string;
  distance: number;
  gain: number;
  roomPosition: string;
  popFilter: boolean;
  audioUrl: string;
  duration: number;
  starred: boolean;
  annotations: Annotations;
  notes: string;
  createdAt: string;
}

export interface ComparisonSlot {
  a: AudioTake | null;
  b: AudioTake | null;
  active: 'a' | 'b';
}

export interface FilterState {
  microphones: string[];
  preamps: string[];
  distances: [number, number];
  gains: [number, number];
  roomPositions: string[];
  popFilter: boolean | null;
  starredOnly: boolean;
  sortBy: 'name' | 'distance' | 'gain' | 'createdAt' | 'emotion';
  sortOrder: 'asc' | 'desc';
}

export type AnnotationKey = keyof Annotations;

export const ANNOTATION_LABELS: Record<AnnotationKey, string> = {
  sibilance: '齿音',
  nasality: '鼻音',
  plosives: '爆破音',
  noiseFloor: '底噪',
  emotion: '情绪表现',
};

export const ANNOTATION_DESCRIPTIONS: Record<AnnotationKey, string> = {
  sibilance: '高频嘶声控制，越低越清晰',
  nasality: '鼻腔共鸣，越低越自然',
  plosives: 'P/B 爆破音控制，越低越好',
  noiseFloor: '环境底噪，越低越干净',
  emotion: '声音感染力，越高越好',
};

export const ANNOTATION_LOW_BETTER: Record<AnnotationKey, boolean> = {
  sibilance: true,
  nasality: true,
  plosives: true,
  noiseFloor: true,
  emotion: false,
};
