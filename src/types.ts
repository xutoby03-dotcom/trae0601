export type LightningType = 'cloud-to-ground' | 'cloud-to-cloud' | 'intra-cloud' | 'sheet' | 'bead' | 'rocket';

export type BrightnessLevel = 1 | 2 | 3 | 4 | 5;

export type RainIntensity = 'none' | 'light' | 'moderate' | 'heavy' | 'torrential';

export type CardinalDirection = 'N' | 'NNE' | 'NE' | 'ENE' | 'E' | 'ESE' | 'SE' | 'SSE' | 'S' | 'SSW' | 'SW' | 'WSW' | 'W' | 'WNW' | 'NW' | 'NNW';

export interface LightningRecord {
  id: string;
  timestamp: number;
  observationPoint: string;
  viewDirection: CardinalDirection;
  lightningAzimuth: number;
  lightningType: LightningType;
  brightness: BrightnessLevel;
  thunderDelaySeconds: number;
  rainIntensity: RainIntensity;
  estimatedDistanceKm: number;
  riskLevel: 'safe' | 'caution' | 'danger' | 'extreme';
}

export interface StormSession {
  id: string;
  startedAt: number;
  records: LightningRecord[];
}

export interface MovementSummary {
  dominantDirection: CardinalDirection | null;
  directionTrend: 'approaching' | 'receding' | 'stationary' | 'unclear';
  averageDistanceKm: number | null;
  distanceTrend: number | null;
  totalFlashes: number;
  lastActivityMinutesAgo: number | null;
}

export const LIGHTNING_TYPE_LABELS: Record<LightningType, string> = {
  'cloud-to-ground': '云地闪',
  'cloud-to-cloud': '云间闪',
  'intra-cloud': '云内闪',
  'sheet': '片状闪电',
  'bead': '串珠闪电',
  'rocket': '火箭闪电',
};

export const BRIGHTNESS_LABELS: Record<BrightnessLevel, { label: string; description: string }> = {
  1: { label: '极暗', description: '隐约可见，需仔细观察' },
  2: { label: '较暗', description: '弱闪光，轮廓模糊' },
  3: { label: '中等', description: '清晰可见，正常亮度' },
  4: { label: '明亮', description: '照亮天空，刺眼感' },
  5: { label: '极亮', description: '白昼般明亮，伴随光晕' },
};

export const RAIN_INTENSITY_LABELS: Record<RainIntensity, { label: string; icon: string }> = {
  'none': { label: '无雨', icon: '☀️' },
  'light': { label: '小雨', icon: '🌦️' },
  'moderate': { label: '中雨', icon: '🌧️' },
  'heavy': { label: '大雨', icon: '⛈️' },
  'torrential': { label: '暴雨', icon: '🌊' },
};

export const CARDINAL_DIRECTIONS: { code: CardinalDirection; label: string; degrees: number }[] = [
  { code: 'N', label: '北', degrees: 0 },
  { code: 'NNE', label: '北东北', degrees: 22.5 },
  { code: 'NE', label: '东北', degrees: 45 },
  { code: 'ENE', label: '东东北', degrees: 67.5 },
  { code: 'E', label: '东', degrees: 90 },
  { code: 'ESE', label: '东东南', degrees: 112.5 },
  { code: 'SE', label: '东南', degrees: 135 },
  { code: 'SSE', label: '南东南', degrees: 157.5 },
  { code: 'S', label: '南', degrees: 180 },
  { code: 'SSW', label: '南西南', degrees: 202.5 },
  { code: 'SW', label: '西南', degrees: 225 },
  { code: 'WSW', label: '西西南', degrees: 247.5 },
  { code: 'W', label: '西', degrees: 270 },
  { code: 'WNW', label: '西西北', degrees: 292.5 },
  { code: 'NW', label: '西北', degrees: 315 },
  { code: 'NNW', label: '北西北', degrees: 337.5 },
];

export const getDirectionFromDegrees = (deg: number): CardinalDirection => {
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return CARDINAL_DIRECTIONS[index].code;
};

export const getDegreesFromDirection = (dir: CardinalDirection): number => {
  return CARDINAL_DIRECTIONS.find(d => d.code === dir)?.degrees ?? 0;
};

export const OBSERVATION_POINTS = [
  '教学楼天台',
  '操场主席台',
  '图书馆楼顶',
  '宿舍区广场',
  '实验楼顶层',
  '校园东门',
  '校园西门',
  '体育馆门口',
];

export const THUNDER_SPEED_M_PER_S = 343;

export const estimateDistance = (delaySeconds: number): number => {
  return Math.round((delaySeconds * THUNDER_SPEED_M_PER_S) / 100) / 10;
};

export const getRiskLevel = (distanceKm: number): LightningRecord['riskLevel'] => {
  if (distanceKm <= 1) return 'extreme';
  if (distanceKm <= 3) return 'danger';
  if (distanceKm <= 8) return 'caution';
  return 'safe';
};

export const RISK_CONFIG: Record<LightningRecord['riskLevel'], { label: string; color: string; bgColor: string; advice: string }> = {
  safe: {
    label: '安全',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20 border-emerald-500/40',
    advice: '距离较远，可继续观测，注意天气变化',
  },
  caution: {
    label: '注意',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20 border-yellow-500/40',
    advice: '雷雨正在接近，建议准备进入室内',
  },
  danger: {
    label: '危险',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20 border-orange-500/40',
    advice: '危险！请立即进入室内，避免使用电话',
  },
  extreme: {
    label: '极度危险',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20 border-red-500/40',
    advice: '极度危险！关闭门窗，远离电源和导体',
  },
};
