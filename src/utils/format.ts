import type { BasketStatus, BasketSize } from "@/types";

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const absMin = Math.floor(Math.abs(diff) / 60000);
  if (absMin < 60) return `${Math.floor(absMin)} 分钟${diff >= 0 ? "前" : "后"}`;
  const absHr = Math.floor(absMin / 60);
  if (absHr < 24) return `${absHr} 小时${diff >= 0 ? "前" : "后"}`;
  const absDay = Math.floor(absHr / 24);
  return `${absDay} 天${diff >= 0 ? "前" : "后"}`;
};

export const overdueDays = (expectedIso: string) => {
  const expected = new Date(expectedIso).getTime();
  const now = Date.now();
  if (now <= expected) return 0;
  return Math.floor((now - expected) / 86400000);
};

export const basketStatusLabel: Record<BasketStatus, string> = {
  available: "可用",
  lent: "借出中",
  repair: "维修中",
  scrapped: "已报废",
};

export const basketStatusClass: Record<BasketStatus, string> = {
  available: "bg-forest-50 text-forest-600 ring-1 ring-inset ring-forest-200",
  lent: "bg-steel-50 text-steel-600 ring-1 ring-inset ring-steel-200",
  repair: "bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200",
  scrapped: "bg-slate2-100 text-slate2-500 ring-1 ring-inset ring-slate2-200",
};

export const lendStatusLabel: Record<"active" | "returned" | "overdue", string> = {
  active: "借出中",
  returned: "已归还",
  overdue: "已逾期",
};

export const lendStatusClass: Record<"active" | "returned" | "overdue", string> = {
  active: "bg-steel-50 text-steel-600 ring-1 ring-inset ring-steel-200",
  returned: "bg-forest-50 text-forest-600 ring-1 ring-inset ring-forest-200",
  overdue: "bg-signal-50 text-signal-500 ring-1 ring-inset ring-signal-100",
};

export const sizeLabel: Record<BasketSize, string> = {
  S: "小号 (S)",
  M: "中号 (M)",
  L: "大号 (L)",
  XL: "特大号 (XL)",
};

export const sizeLoadMap: Record<BasketSize, number> = {
  S: 8,
  M: 15,
  L: 25,
  XL: 40,
};
