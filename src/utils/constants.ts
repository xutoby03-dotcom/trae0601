import type { RouteCategory, RiskType, SupplyType, RoadCondition, BikeType } from '@/types';

export const CATEGORY_LABELS: Record<RouteCategory, { label: string; emoji: string; color: string }> = {
  easy: { label: '轻松骑', emoji: '🌿', color: 'from-emerald-500 to-green-400' },
  climbing: { label: '爬坡多', emoji: '⛰️', color: 'from-orange-500 to-amber-400' },
  night: { label: '夜骑友好', emoji: '🌙', color: 'from-indigo-500 to-violet-400' },
  construction: { label: '施工绕行', emoji: '🚧', color: 'from-rose-500 to-pink-400' },
};

export const RISK_LABELS: Record<RiskType, { label: string; emoji: string; level: 'warning' | 'danger' }> = {
  tunnel_no_light: { label: '隧道无照明', emoji: '🔦', level: 'danger' },
  heavy_traffic: { label: '机动车密集', emoji: '🚗', level: 'warning' },
  no_parking: { label: '共享单车禁停', emoji: '🅿️', level: 'warning' },
  slippery_when_rain: { label: '雨天路滑', emoji: '🌧️', level: 'warning' },
};

export const SUPPLY_LABELS: Record<SupplyType, { label: string; emoji: string }> = {
  convenience_store: { label: '便利店', emoji: '🏪' },
  water: { label: '饮水点', emoji: '💧' },
  restroom: { label: '卫生间', emoji: '🚻' },
  bike_shop: { label: '修车店', emoji: '🔧' },
};

export const ROAD_CONDITION_LABELS: Record<RoadCondition, { label: string; emoji: string }> = {
  asphalt: { label: '柏油路', emoji: '🛣️' },
  concrete: { label: '水泥路', emoji: '🧱' },
  gravel: { label: '砂石路', emoji: '🪨' },
  mixed: { label: '混合路况', emoji: '🔀' },
};

export const BIKE_TYPE_LABELS: Record<BikeType, { label: string; emoji: string }> = {
  road: { label: '公路车', emoji: '🚴' },
  mountain: { label: '山地车', emoji: '🚵' },
  hybrid: { label: '旅行车', emoji: '🚲' },
  folding: { label: '折叠车', emoji: '🪂' },
  city: { label: '城市车', emoji: '🛴' },
  other: { label: '其他', emoji: '✨' },
};

export const DIFFICULTY_LABELS = ['', '很轻松', '较轻松', '中等', '较困难', '很困难'];
