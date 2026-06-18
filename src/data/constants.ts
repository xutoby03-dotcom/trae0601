import type { CategoryMeta, StatusMeta } from "@/types";

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "tent",
    name: "帐篷",
    emoji: "⛺",
    color: "text-forest-700",
    bgColor: "bg-forest-100",
  },
  {
    id: "tarp",
    name: "天幕",
    emoji: "🏕️",
    color: "text-earth-600",
    bgColor: "bg-earth-100",
  },
  {
    id: "sleepingbag",
    name: "睡袋",
    emoji: "🛌",
    color: "text-sky2-600",
    bgColor: "bg-sky2-100",
  },
  {
    id: "stove",
    name: "炉具",
    emoji: "🔥",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    id: "furniture",
    name: "桌椅",
    emoji: "🪑",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  {
    id: "lighting",
    name: "灯具",
    emoji: "💡",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
];

export const STATUSES: StatusMeta[] = [
  {
    id: "available",
    name: "可用",
    color: "text-forest-700",
    bgColor: "bg-forest-100",
  },
  {
    id: "drying",
    name: "晾晒中",
    color: "text-sky2-700",
    bgColor: "bg-sky2-100",
  },
  {
    id: "repairing",
    name: "维修中",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  {
    id: "missing",
    name: "缺件",
    color: "text-amber-700",
    bgColor: "bg-amber-100",
  },
  {
    id: "unavailable",
    name: "不可用",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
];

export const DRYING_LOCATIONS = [
  "阳台",
  "庭院",
  "楼顶",
  "车库通风区",
  "客厅窗边",
  "储物间",
];

export const STORAGE_BOXES = [
  "A-01 帐篷箱",
  "A-02 天幕箱",
  "B-01 睡袋箱",
  "B-02 寝具箱",
  "C-01 炉具箱",
  "C-02 燃料箱",
  "D-01 桌椅袋",
  "E-01 灯具箱",
  "E-02 电器箱",
  "F-01 杂项箱",
];

export function getCategory(id: string): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

export function getStatus(id: string): StatusMeta {
  return STATUSES.find((s) => s.id === id) || STATUSES[0];
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
