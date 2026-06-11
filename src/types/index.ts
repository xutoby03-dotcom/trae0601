export type Surface = 'asphalt' | 'concrete' | 'track' | 'trail' | 'treadmill';
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'cold' | 'hot';

export interface Shoe {
  id: string;
  brand: string;
  model: string;
  purchasePrice: number;
  startDate: string;
  suitableSurfaces: Surface[];
  maxKilometers: number;
  photo?: string;
  isRaceLocked: boolean;
  createdAt: string;
}

export interface Run {
  id: string;
  shoeId: string;
  date: string;
  kilometers: number;
  surface: Surface;
  weather: Weather;
  feelRating: number;
  wearNotes?: string;
  createdAt: string;
}

export interface ShoeWithStats extends Shoe {
  totalKilometers: number;
  remainingKilometers: number;
  lifePercentage: number;
  costPerKilometer: number;
  runCount: number;
}

export const SURFACE_LABELS: Record<Surface, string> = {
  asphalt: '柏油路',
  concrete: '水泥路',
  track: '塑胶跑道',
  trail: '越野小径',
  treadmill: '跑步机',
};

export const WEATHER_LABELS: Record<Weather, string> = {
  sunny: '晴天',
  cloudy: '多云',
  rainy: '雨天',
  cold: '寒冷',
  hot: '炎热',
};

export const SURFACE_COLORS: Record<Surface, string> = {
  asphalt: 'bg-gray-500/20 text-gray-300',
  concrete: 'bg-stone-500/20 text-stone-300',
  track: 'bg-red-500/20 text-red-300',
  trail: 'bg-green-500/20 text-green-300',
  treadmill: 'bg-blue-500/20 text-blue-300',
};

export const WEATHER_ICONS: Record<Weather, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  rainy: '🌧️',
  cold: '❄️',
  hot: '🔥',
};
