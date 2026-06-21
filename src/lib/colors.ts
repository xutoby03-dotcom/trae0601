// @ts-nocheck
import type {
  EnvironmentTag,
  AnnotationType,
  WeatherCondition,
  MicPolarPattern,
  DistanceSense,
  Distance,
  DeviceModel,
} from "@/types";

export interface EnvColorInfo {
  dot: string;
  bg: string;
  border: string;
  text: string;
  label: string;
  emoji: string;
}

export const envColorMap: Record<EnvironmentTag, EnvColorInfo> = {
  forest: {
    dot: "#22c55e",
    bg: "bg-green-500/20",
    border: "border-green-500/40",
    text: "text-green-400",
    label: "森林",
    emoji: "🌲",
  },
  mountain: {
    dot: "#64748b",
    bg: "bg-slate-500/20",
    border: "border-slate-500/40",
    text: "text-slate-400",
    label: "山脉",
    emoji: "⛰️",
  },
  ocean: {
    dot: "#0ea5e9",
    bg: "bg-sky-500/20",
    border: "border-sky-500/40",
    text: "text-sky-400",
    label: "海洋",
    emoji: "🌊",
  },
  river: {
    dot: "#06b6d4",
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/40",
    text: "text-cyan-400",
    label: "河流",
    emoji: "🏞️",
  },
  city: {
    dot: "#f59e0b",
    bg: "bg-amber-500/20",
    border: "border-amber-500/40",
    text: "text-amber-400",
    label: "城市",
    emoji: "🏙️",
  },
  indoor: {
    dot: "#a78bfa",
    bg: "bg-violet-500/20",
    border: "border-violet-500/40",
    text: "text-violet-400",
    label: "室内",
    emoji: "🏠",
  },
  desert: {
    dot: "#f97316",
    bg: "bg-orange-500/20",
    border: "border-orange-500/40",
    text: "text-orange-400",
    label: "沙漠",
    emoji: "🏜️",
  },
  wetland: {
    dot: "#10b981",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
    label: "湿地",
    emoji: "🌿",
  },
  village: {
    dot: "#84cc16",
    bg: "bg-lime-500/20",
    border: "border-lime-500/40",
    text: "text-lime-400",
    label: "乡村",
    emoji: "🏡",
  },
  cave: {
    dot: "#78716c",
    bg: "bg-stone-500/20",
    border: "border-stone-500/40",
    text: "text-stone-400",
    label: "洞穴",
    emoji: "🕳️",
  },
};

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

export interface AnnotationColorInfo {
  bg: string;
  text: string;
  border: string;
  solid: string;
  label: string;
  emoji: string;
}

export const annotationColorMap: Record<AnnotationType, AnnotationColorInfo> = {
  loop: {
    bg: "bg-moss-400/20",
    text: "text-moss-400",
    border: "border-moss-400/40",
    solid: "#84cc16",
    label: "循环段",
    emoji: "🌿",
  },
  wind_noise: {
    bg: "bg-slate-400/20",
    text: "text-slate-300",
    border: "border-slate-400/40",
    solid: "#94a3b8",
    label: "风噪",
    emoji: "💨",
  },
  traffic: {
    bg: "bg-yellow-400/20",
    text: "text-yellow-300",
    border: "border-yellow-400/40",
    solid: "#facc15",
    label: "车辆干扰",
    emoji: "🚗",
  },
  voice: {
    bg: "bg-rust-500/20",
    text: "text-rust-400",
    border: "border-rust-500/40",
    solid: "#ef4444",
    label: "人声",
    emoji: "🗣",
  },
  needs_editing: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/40",
    solid: "#f59e0b",
    label: "待剪辑",
    emoji: "✨",
  },
};

export const annotationTypeList: AnnotationType[] = [
  "loop",
  "wind_noise",
  "traffic",
  "voice",
  "needs_editing",
];

export interface WeatherInfo {
  emoji: string;
  label: string;
}

export const weatherInfoMap: Record<WeatherCondition, WeatherInfo> = {
  sunny: { emoji: "☀️", label: "晴" },
  cloudy: { emoji: "☁️", label: "多云" },
  rainy: { emoji: "🌧️", label: "雨" },
  foggy: { emoji: "🌫️", label: "雾" },
  windy: { emoji: "💨", label: "大风" },
  snowy: { emoji: "❄️", label: "雪" },
  stormy: { emoji: "⛈️", label: "雷暴" },
};

export const weatherList: WeatherCondition[] = [
  "sunny",
  "cloudy",
  "rainy",
  "foggy",
  "windy",
  "snowy",
  "stormy",
];

export interface MicPatternInfo {
  label: string;
  icon: string;
}

export const micPatternInfoMap: Record<MicPolarPattern, MicPatternInfo> = {
  cardioid: { label: "心形", icon: "❤️" },
  omnidirectional: { label: "全指向", icon: "⭕" },
  figure8: { label: "8字", icon: "∞" },
  shotgun: { label: "枪式", icon: "🔫" },
  xy: { label: "XY", icon: "✚" },
};

export const micPatternList: MicPolarPattern[] = [
  "cardioid",
  "omnidirectional",
  "figure8",
  "shotgun",
  "xy",
];

export interface DistanceInfo {
  label: string;
  key: Distance;
  sense: DistanceSense;
}

const DISTANCE_TABLE: Record<Distance, { label: string; sense: DistanceSense }> = {
  near: { label: "近", sense: "close" },
  medium: { label: "中", sense: "medium" },
  far: { label: "远", sense: "far" },
  extreme: { label: "极远", sense: "distant" },
};

const DISTANCE_FROM_SENSE: Record<DistanceSense, Distance> = {
  close: "near",
  medium: "medium",
  far: "far",
  distant: "extreme",
};

export const distanceInfoMap: Record<Distance, DistanceInfo> = {
  near: { label: "近", key: "near", sense: "close" },
  medium: { label: "中", key: "medium", sense: "medium" },
  far: { label: "远", key: "far", sense: "far" },
  extreme: { label: "极远", key: "extreme", sense: "distant" },
};

export const distanceList: Distance[] = ["near", "medium", "far", "extreme"];
export const distanceSenseList: DistanceSense[] = [
  "close",
  "medium",
  "far",
  "distant",
];

export function distanceToSense(d: Distance): DistanceSense {
  return DISTANCE_TABLE[d].sense;
}

export function senseToDistance(s: DistanceSense): Distance {
  return DISTANCE_FROM_SENSE[s];
}

export const deviceModelList: DeviceModel[] = [
  "Sony PCM-D100",
  "Zoom F6",
  "Tascam DR-44WL",
  "Sound Devices MixPre-6 II",
];

export const licenseTypeLabelMap: Record<string, string> = {
  exclusive: "独家授权",
  non_exclusive: "非独家授权",
};

export function getLockProjectName(
  licenseInfo: { projectName?: string } | null | undefined
): string {
  return licenseInfo?.projectName ?? "";
}
