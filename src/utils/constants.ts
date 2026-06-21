import type { VoicePart } from '@/types';

export const VOICE_PART_CONFIG: Record<VoicePart, {
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
  emoji: string;
  order: number;
}> = {
  soprano: {
    label: '女高音',
    shortLabel: 'S',
    color: '#FF6B9D',
    bgColor: 'rgba(255, 107, 157, 0.15)',
    borderColor: 'rgba(255, 107, 157, 0.6)',
    glowColor: 'rgba(255, 107, 157, 0.4)',
    textColor: '#FFB6CC',
    emoji: '🎀',
    order: 0,
  },
  alto: {
    label: '女低音',
    shortLabel: 'A',
    color: '#7B68EE',
    bgColor: 'rgba(123, 104, 238, 0.15)',
    borderColor: 'rgba(123, 104, 238, 0.6)',
    glowColor: 'rgba(123, 104, 238, 0.4)',
    textColor: '#B8AFF8',
    emoji: '💜',
    order: 1,
  },
  tenor: {
    label: '男高音',
    shortLabel: 'T',
    color: '#FFA94D',
    bgColor: 'rgba(255, 169, 77, 0.15)',
    borderColor: 'rgba(255, 169, 77, 0.6)',
    glowColor: 'rgba(255, 169, 77, 0.4)',
    textColor: '#FFCF99',
    emoji: '🧡',
    order: 2,
  },
  bass: {
    label: '男低音',
    shortLabel: 'B',
    color: '#4CAF7D',
    bgColor: 'rgba(76, 175, 125, 0.15)',
    borderColor: 'rgba(76, 175, 125, 0.6)',
    glowColor: 'rgba(76, 175, 125, 0.4)',
    textColor: '#9FD8B9',
    emoji: '💚',
    order: 3,
  },
};

export const VOICE_PARTS: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass'];

export const STAGE_CONFIG = {
  DEFAULT_ROWS: 4,
  DEFAULT_COLS: 6,
  MIN_ROWS: 2,
  MAX_ROWS: 8,
  MIN_COLS: 3,
  MAX_COLS: 12,
  DISTANCE_ATTENUATION: 0.08,
  HEIGHT_COMPENSATION: 0.04,
  CENTER_BONUS: 0.12,
  ADJACENCY_BONUS: 0.06,
  BLOCKING_FACTOR: 0.05,
};

export const SCORE_CONFIG = {
  BALANCE_WEIGHT: 0.4,
  CLARITY_WEIGHT: 0.3,
  BLEND_WEIGHT: 0.3,
  BALANCE_K: 3.5,
  CLUSTER_BONUS_BASE: 25,
  POSITION_BONUS_MAX: 20,
  TRANSITION_PENALTY_BASE: 18,
  UNIFORMITY_BONUS_BASE: 25,
  GRADIENT_SMOOTH_BASE: 20,
};

export const AUDITION_PASSAGES = [
  '全曲完整试听',
  '主歌段落',
  '副歌段落',
  '过门/间奏',
  '高潮段落',
  '结束段落',
];

export const APP_NAME = '和声台 · 合唱团站位试听工具';
export const APP_TAGLINE = '找到属于你们的完美和声排列';
