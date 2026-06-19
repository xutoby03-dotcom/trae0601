import type { BoxStatus } from '@/types';

export function evaluateBoxCondition(damp: number, hole: number, tape: number): BoxStatus {
  const total = damp + hole + tape;
  if (hole >= 3 || total >= 7) return 'scrapped';
  if (damp >= 2 || hole >= 2 || total >= 4) return 'need_repair';
  return 'available';
}

export function isDateOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  return s1 <= e2 && s2 <= e1;
}

export function getDaysFromNow(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    large: '大件箱',
    wardrobe: '衣柜箱',
    book: '书箱',
  };
  return labels[category] || category;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    available: '可借用',
    reserved: '预约中',
    in_use: '使用中',
    need_repair: '待修复',
    scrapped: '已报废',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    available: 'text-green-700 bg-green-100',
    reserved: 'text-blue-700 bg-blue-100',
    in_use: 'text-purple-700 bg-purple-100',
    need_repair: 'text-yellow-700 bg-yellow-100',
    scrapped: 'text-red-700 bg-red-100',
  };
  return colors[status] || 'text-gray-700 bg-gray-100';
};

export const getBorrowStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '待领取',
    picked_up: '已领取',
    returned: '已归还',
    cancelled: '已取消',
  };
  return labels[status] || status;
};

export const getBorrowStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'text-orange-700 bg-orange-100',
    picked_up: 'text-blue-700 bg-blue-100',
    returned: 'text-green-700 bg-green-100',
    cancelled: 'text-gray-500 bg-gray-100',
  };
  return colors[status] || 'text-gray-700 bg-gray-100';
};
