import type { ExpiryStatus } from "@/types";

export function getExpiryDate(purchaseDate: string, shelfLifeDays: number): Date {
  const d = new Date(purchaseDate);
  d.setDate(d.getDate() + shelfLifeDays);
  return d;
}

export function getDaysRemaining(purchaseDate: string, shelfLifeDays: number): number {
  const expiryDate = getExpiryDate(purchaseDate, shelfLifeDays);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getExpiryStatus(purchaseDate: string, shelfLifeDays: number): ExpiryStatus {
  const days = getDaysRemaining(purchaseDate, shelfLifeDays);
  if (days <= 0) return "expired";
  if (days <= 3) return "expiring";
  if (days <= 7) return "warning";
  return "fresh";
}

export function getExpiryColor(status: ExpiryStatus): string {
  switch (status) {
    case "expired": return "border-red-500 bg-red-50";
    case "expiring": return "border-orange-400 bg-orange-50";
    case "warning": return "border-yellow-400 bg-yellow-50";
    case "fresh": return "border-emerald-200 bg-white";
  }
}

export function getExpiryBadgeColor(status: ExpiryStatus): string {
  switch (status) {
    case "expired": return "bg-red-500 text-white";
    case "expiring": return "bg-orange-400 text-white";
    case "warning": return "bg-yellow-400 text-yellow-900";
    case "fresh": return "bg-emerald-400 text-white";
  }
}

export function getExpiryLabel(status: ExpiryStatus, daysRemaining: number): string {
  switch (status) {
    case "expired": return `已过期${Math.abs(daysRemaining)}天`;
    case "expiring": return `剩${daysRemaining}天`;
    case "warning": return `剩${daysRemaining}天`;
    case "fresh": return `剩${daysRemaining}天`;
  }
}

export function getFreshnessPercent(purchaseDate: string, shelfLifeDays: number): number {
  const daysRemaining = getDaysRemaining(purchaseDate, shelfLifeDays);
  return Math.max(0, Math.min(100, (daysRemaining / shelfLifeDays) * 100));
}
