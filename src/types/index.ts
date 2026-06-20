export type TimePoint = '0min' | '30min' | '2h' | '6h';

export type SceneType = 'commute' | 'date' | 'rainy' | 'bedtime';

export interface ScentNote {
  top: string;
  middle: string;
  base: string;
  diffusion: number;
}

export interface PerfumeRecord {
  id: string;
  brand: string;
  name: string;
  scentFamily: string;
  sprayLocation: string;
  weather: string;
  humidity: number;
  createdAt: string;
  timeline: Record<TimePoint, ScentNote>;
  skinScore: number;
  clothScore: number;
  scenes: SceneType[];
}

export const TIME_POINTS: TimePoint[] = ['0min', '30min', '2h', '6h'];

export const TIME_POINT_LABELS: Record<TimePoint, string> = {
  '0min': '0 分钟',
  '30min': '30 分钟',
  '2h': '2 小时',
  '6h': '6 小时',
};

export const SCENE_LABELS: Record<SceneType, string> = {
  commute: '通勤',
  date: '约会',
  rainy: '雨天',
  bedtime: '睡前',
};

export const SCENE_ICONS: Record<SceneType, string> = {
  commute: '💼',
  date: '💕',
  rainy: '🌧️',
  bedtime: '🌙',
};

export const SCENE_COLORS: Record<SceneType, string> = {
  commute: 'bg-amber-100 text-amber-800',
  date: 'bg-rose-100 text-rose-800',
  rainy: 'bg-sky-100 text-sky-800',
  bedtime: 'bg-violet-100 text-violet-800',
};
