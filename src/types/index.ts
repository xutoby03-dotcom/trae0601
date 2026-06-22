export type RiskType = 'dullness' | 'redness' | 'shine' | 'colorShift';
export type RiskLevel = 'mild' | 'moderate' | 'severe';
export type LightSceneKey = 'naturalLight' | 'warmLight' | 'coolLight' | 'mixedLight';
export type FillAngle = 'front' | '45-side' | 'side' | 'top' | 'bottom' | 'back';

export interface RiskMark {
  type: RiskType;
  level: RiskLevel;
}

export interface LightScene {
  photoUrl: string;
  notes: string;
  risks: RiskMark[];
}

export interface TrialRecord {
  id: string;
  modelSkinTone: string;
  foundationShade: string;
  colorTemperature: number;
  fillAngle: FillAngle;
  cameraWhiteBalance: number;
  naturalLight: LightScene;
  warmLight: LightScene;
  coolLight: LightScene;
  mixedLight: LightScene;
  createdAt: string;
}

export const SKIN_TONES = [
  { id: 'fair', name: '白皙', color: '#F5E6D3' },
  { id: 'light', name: '浅肤', color: '#E8C9A0' },
  { id: 'medium', name: '自然', color: '#C9986B' },
  { id: 'tan', name: '小麦', color: '#A67B4D' },
  { id: 'olive', name: '橄榄', color: '#8B6B4A' },
  { id: 'deep', name: '深肤', color: '#5E3F2A' },
];

export const FOUNDATION_SHADES = [
  '#C40', 'N10', 'W12', 'I20', 'N25', 'W30', 'C35', 'I40', 'N45',
  'W50', 'C55', 'I60', 'N65', 'W70', 'C75', 'I80', 'N85', 'W90',
];

export const LIGHT_SCENE_META: Record<LightSceneKey, {
  name: string;
  colorTemp: string;
  color: string;
  icon: string;
}> = {
  naturalLight: { name: '自然光', colorTemp: '≈ 5500K', color: '#FFF4E0', icon: 'Sun' },
  warmLight: { name: '暖光', colorTemp: '≈ 3200K', color: '#FFB060', icon: 'Flame' },
  coolLight: { name: '冷光', colorTemp: '≈ 6500K', color: '#A8C5E8', icon: 'Snowflake' },
  mixedLight: { name: '混合光', colorTemp: '≈ 4500K', color: '#D4B896', icon: 'Sparkles' },
};

export const RISK_META: Record<RiskType, {
  name: string;
  color: string;
  bgColor: string;
  description: string;
}> = {
  dullness: {
    name: '暗沉',
    color: '#6B6B6B',
    bgColor: 'rgba(107, 107, 107, 0.12)',
    description: '底妆在灯光下发灰、缺乏光泽',
  },
  redness: {
    name: '泛红',
    color: '#D97059',
    bgColor: 'rgba(217, 112, 89, 0.12)',
    description: '肤色偏红、底妆无法遮盖',
  },
  shine: {
    name: '反光',
    color: '#B8A67A',
    bgColor: 'rgba(184, 166, 122, 0.15)',
    description: 'T区或面部油光过强',
  },
  colorShift: {
    name: '色差',
    color: '#8B6AAE',
    bgColor: 'rgba(139, 106, 174, 0.12)',
    description: '面颈色差或粉底氧化变色',
  },
};

export const FILL_ANGLES: { id: FillAngle; name: string; desc: string }[] = [
  { id: 'front', name: '正面', desc: '0° 正前方' },
  { id: '45-side', name: '45°侧', desc: '斜前方 45°' },
  { id: 'side', name: '侧面', desc: '90° 正侧方' },
  { id: 'top', name: '顶光', desc: '上方 45° 俯射' },
  { id: 'bottom', name: '底光', desc: '下方仰射' },
  { id: 'back', name: '逆光', desc: '背后轮廓光' },
];

export const RISK_LEVELS: { id: RiskLevel; name: string; weight: number }[] = [
  { id: 'mild', name: '轻度', weight: 1 },
  { id: 'moderate', name: '中度', weight: 2 },
  { id: 'severe', name: '重度', weight: 3 },
];
