import { format, differenceInHours, differenceInMinutes, isToday } from 'date-fns';
import type { PackageItem, DelayLevel } from '@/types';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generatePickupCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getDelayLevel(storedAt: string): DelayLevel {
  const hours = differenceInHours(new Date(), new Date(storedAt));
  if (hours >= 72) return 'critical';
  if (hours >= 48) return 'danger';
  if (hours >= 24) return 'warning';
  return 'normal';
}

export function getDelayHours(storedAt: string): number {
  return Math.floor(differenceInMinutes(new Date(), new Date(storedAt)) / 60);
}

export function formatDelayTime(storedAt: string): string {
  const totalMinutes = differenceInMinutes(new Date(), new Date(storedAt));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainHours = hours % 24;
    return `${days}天${remainHours}小时`;
  }
  return `${hours}小时${minutes}分钟`;
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'yyyy-MM-dd HH:mm');
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'yyyy-MM-dd');
}

export function formatTime(dateStr: string): string {
  return format(new Date(dateStr), 'HH:mm');
}

export function isTodayDate(dateStr: string): boolean {
  return isToday(new Date(dateStr));
}

export function getSlotLabel(floor: number, slotNumber: number): string {
  return `${floor}层-${String(slotNumber).padStart(2, '0')}格`;
}

export function getDelayLevelColor(level: DelayLevel): string {
  const colors: Record<DelayLevel, string> = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-orange-500',
    critical: 'bg-red-600',
  };
  return colors[level];
}

export function getDelayLevelTextColor(level: DelayLevel): string {
  const colors: Record<DelayLevel, string> = {
    normal: 'text-emerald-600',
    warning: 'text-amber-600',
    danger: 'text-orange-600',
    critical: 'text-red-600',
  };
  return colors[level];
}

export function getDelayLevelBgColor(level: DelayLevel): string {
  const colors: Record<DelayLevel, string> = {
    normal: 'bg-emerald-50 border-emerald-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-orange-50 border-orange-200',
    critical: 'bg-red-50 border-red-200',
  };
  return colors[level];
}

export function isPackageDelayed(pkg: PackageItem): boolean {
  return getDelayLevel(pkg.storedAt) !== 'normal';
}

export function sizeLabel(size: 'S' | 'M' | 'L'): string {
  const map = { S: '小件', M: '中件', L: '大件' };
  return map[size];
}

export function currentTimeStr(): string {
  return new Date().toISOString();
}
