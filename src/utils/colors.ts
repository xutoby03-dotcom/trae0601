// @ts-nocheck
import type {
  EnvironmentTag,
  AnnotationType,
  WeatherCondition,
  MicPolarPattern,
  MicDirection,
  DistanceSense,
} from "@/types";

export const envColorMap: Record<EnvironmentTag, string> = {
  forest: "#22c55e",
  mountain: "#64748b",
  ocean: "#0ea5e9",
  river: "#06b6d4",
  city: "#f59e0b",
  indoor: "#a78bfa",
  desert: "#f97316",
  wetland: "#10b981",
  village: "#84cc16",
  cave: "#78716c",
};

export const annotationColorMap: Record<
  AnnotationType,
  { bg: string; text: string; label: string }
> = {
  loop: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    label: "可循环片段",
  },
  wind_noise: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    label: "风噪",
  },
  traffic: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    label: "交通噪声",
  },
  voice: {
    bg: "bg-violet-500/20",
    text: "text-violet-400",
    label: "人声",
  },
  needs_editing: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    label: "需编辑",
  },
};

export const weatherIconMap: Record<
  WeatherCondition,
  { emoji: string; label: string }
> = {
  sunny: { emoji: "☀️", label: "晴" },
  cloudy: { emoji: "☁️", label: "多云" },
  rainy: { emoji: "🌧️", label: "雨" },
  foggy: { emoji: "🌫️", label: "雾" },
  windy: { emoji: "💨", label: "大风" },
  snowy: { emoji: "❄️", label: "雪" },
  stormy: { emoji: "⛈️", label: "雷暴" },
};

export const polarPatternMap: Record<
  MicPolarPattern,
  { label: string; icon: string }
> = {
  cardioid: { label: "心形指向", icon: "🎯" },
  omnidirectional: { label: "全指向", icon: "⭕" },
  figure8: { label: "8字形", icon: "∞" },
  shotgun: { label: "枪式指向", icon: "🎤" },
  xy: { label: "XY立体声", icon: "✚" },
};

export const micDirectionLabel: Record<MicDirection, string> = {
  omnidirectional: "全指向",
  cardioid: "心形",
  figure8: "8字形",
  shotgun: "枪式",
  xy: "XY立体声",
};

export const distanceLabelMap: Record<DistanceSense, string> = {
  close: "近距离",
  medium: "中距离",
  far: "远距离",
  distant: "极远距离",
};

export const distanceSenseList: DistanceSense[] = [
  "close",
  "medium",
  "far",
  "distant",
];

export const envTagList: EnvironmentTag[] = [
  "forest",
  "mountain",
  "ocean",
  "river",
  "city",
  "indoor",
  "desert",
  "wetland",
  "village",
  "cave",
];

export const weatherList: WeatherCondition[] = [
  "sunny",
  "cloudy",
  "rainy",
  "foggy",
  "windy",
  "snowy",
  "stormy",
];

export const micDirectionList: MicDirection[] = [
  "omnidirectional",
  "cardioid",
  "figure8",
  "shotgun",
  "xy",
];

export const deviceBrandList: string[] = [
  "Sony PCM-D100",
  "Zoom F6",
  "Tascam DR-44WL",
  "Sound Devices MixPre-6 II",
  "Sound Devices MixPre-10T",
  "Zoom F8n Pro",
  "Sennheiser MKH 8040",
];

export const licenseTypeLabelMap: Record<string, string> = {
  exclusive: "独家授权",
  non_exclusive: "非独家授权",
};

export const defaultProjectGradients: Record<string, string> = {
  active: "from-emerald-600 via-teal-700 to-forest-900",
  planning: "from-sky-600 via-blue-700 to-indigo-900",
  completed: "from-amber-600 via-orange-700 to-rose-900",
};
