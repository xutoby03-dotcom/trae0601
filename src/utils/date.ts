import type { Room, LifespanInfo } from '@/types';

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export const getDaysAgo = (date: string): number => {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = today.getTime() - targetDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const addDays = (date: string | Date, days: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

export const isToday = (date: string): boolean => {
  return formatDate(date) === formatDate(new Date());
};
