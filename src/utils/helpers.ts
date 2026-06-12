import { CoffeeBean, FlavorTag, StockStatus } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};

export const getStockStatus = (bean: CoffeeBean): StockStatus => {
  if (bean.remainingWeight <= 0) return 'empty';
  if (bean.remainingWeight <= bean.lowStockThreshold) return 'low';
  return 'normal';
};

export const getStockPercentage = (bean: CoffeeBean): number => {
  if (bean.initialWeight <= 0) return 0;
  return Math.max(0, Math.min(100, (bean.remainingWeight / bean.initialWeight) * 100));
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateRatio = (coffeeDose: number, waterAmount: number): string => {
  if (coffeeDose <= 0) return '0';
  return `1:${(waterAmount / coffeeDose).toFixed(1)}`;
};

export const formatBrewTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const hasAnyFlavor = (tags: FlavorTag[], filterTags: FlavorTag[]): boolean => {
  if (filterTags.length === 0) return true;
  return filterTags.some((tag) => tags.includes(tag));
};

export const pricePerGram = (price: number, weight: number): number => {
  if (weight <= 0) return 0;
  return price / weight;
};
