import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import type { LeftoverLevel, FishStatus, FeedingPeriod } from "@/types";

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const todayStr = () => format(new Date(), "yyyy-MM-dd");

export const nowStr = () => new Date().toISOString();

export const formatDate = (dateStr: string, pattern = "yyyy年M月d日") => {
  try {
    return format(parseISO(dateStr), pattern, { locale: zhCN });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (isoStr: string) => {
  try {
    return format(parseISO(isoStr), "yyyy年M月d日 HH:mm", { locale: zhCN });
  } catch {
    return isoStr;
  }
};

export const formatTime = (isoStr: string) => {
  try {
    return format(parseISO(isoStr), "HH:mm");
  } catch {
    return isoStr;
  }
};

export const weekdayName = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), "EEEE", { locale: zhCN });
  } catch {
    return "";
  }
};

export const periodLabel: Record<FeedingPeriod, string> = {
  morning: "早晨",
  evening: "傍晚",
};

export const leftoverMeta: Record<
  LeftoverLevel,
  { label: string; color: string; bg: string; dot: string }
> = {
  none: {
    label: "无剩食",
    color: "text-green-700",
    bg: "bg-green-100/80",
    dot: "bg-green-500",
  },
  little: {
    label: "少量剩食",
    color: "text-lime-700",
    bg: "bg-lime-100/80",
    dot: "bg-lime-500",
  },
  medium: {
    label: "剩食较多",
    color: "text-amber-700",
    bg: "bg-amber-100/80",
    dot: "bg-amber-500",
  },
  lots: {
    label: "大量剩食",
    color: "text-red-700",
    bg: "bg-red-100/80",
    dot: "bg-red-500",
  },
};

export const fishStatusMeta: Record<
  FishStatus,
  { label: string; color: string; bg: string; emoji: string }
> = {
  normal: {
    label: "状态正常",
    color: "text-brand-700",
    bg: "bg-brand-100/70",
    emoji: "🐟",
  },
  active: {
    label: "活跃度高",
    color: "text-water-700",
    bg: "bg-water-100/80",
    emoji: "🐠",
  },
  sluggish: {
    label: "反应迟缓",
    color: "text-coral-600",
    bg: "bg-coral-100",
    emoji: "💤",
  },
  sick: {
    label: "疑似生病",
    color: "text-red-700",
    bg: "bg-red-100/80",
    emoji: "🩺",
  },
};

export const greetByTime = () => {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
};

export const round1 = (n: number) => Math.round(n * 10) / 10;
export const round2 = (n: number) => Math.round(n * 100) / 100;
