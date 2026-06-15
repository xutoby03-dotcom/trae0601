import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BUILDINGS = ['1栋', '2栋', '3栋', '4栋', '5栋'];
export const UNITS = ['A单元', 'B单元', 'C单元', '综合'];
export const FLOORS = Array.from({ length: 30 }, (_, i) => i + 1);

export const TIME_SLOTS = [
  { start: '08:00', end: '10:00', label: '08:00 - 10:00' },
  { start: '10:00', end: '12:00', label: '10:00 - 12:00' },
  { start: '13:00', end: '15:00', label: '13:00 - 15:00' },
  { start: '15:00', end: '17:00', label: '15:00 - 17:00' },
  { start: '17:00', end: '19:00', label: '17:00 - 19:00' },
  { start: '19:00', end: '21:00', label: '19:00 - 21:00' },
];

export const ESTIMATED_WEIGHT_PER_ITEM = 50;

export const calculateEstimatedWeight = (itemCount: number): number => {
  return itemCount * ESTIMATED_WEIGHT_PER_ITEM;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export const formatDisplayDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};

export const getTomorrowDate = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDate(tomorrow);
};

export const getNextWeekDates = (): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(formatDate(date));
  }
  return dates;
};

export const getStatusBadgeStyle = (status: string): string => {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    conflict: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-orange-100 text-orange-800',
    disabled: 'bg-gray-100 text-gray-800',
  };
  return styles[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '待处理',
    approved: '已确认',
    conflict: '有冲突',
    completed: '已完成',
    cancelled: '已取消',
    active: '正常',
    maintenance: '检修中',
    disabled: '禁用',
  };
  return labels[status] || status;
};

export const getWallDamageLabel = (damage: string): string => {
  const labels: Record<string, string> = {
    none: '无磕碰',
    minor: '轻微磕碰',
    major: '严重磕碰',
  };
  return labels[damage] || damage;
};

export const getDepositStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    collected: '已收取',
    refunded: '已退还',
    deducted: '已扣除',
  };
  return labels[status] || status;
};

export const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
