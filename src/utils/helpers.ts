import type { BagStatus, BorrowStatus, InsulationStatus, Platform } from '@/types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysOverdue(expectedReturnTime: string): number {
  const now = new Date().getTime();
  const expected = new Date(expectedReturnTime).getTime();
  const diff = now - expected;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isOverdue(expectedReturnTime: string): boolean {
  return new Date().getTime() > new Date(expectedReturnTime).getTime();
}

export function getHoursRemaining(expectedReturnTime: string): number {
  const now = new Date().getTime();
  const expected = new Date(expectedReturnTime).getTime();
  const diff = expected - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60));
}

export const bagStatusMap: Record<BagStatus, { label: string; color: string }> = {
  available: { label: '可借', color: 'bg-green-100 text-green-700' },
  borrowed: { label: '借出中', color: 'bg-blue-100 text-blue-700' },
  damaged: { label: '损坏', color: 'bg-orange-100 text-orange-700' },
  lost: { label: '丢失', color: 'bg-red-100 text-red-700' },
};

export const borrowStatusMap: Record<BorrowStatus, { label: string; color: string }> = {
  active: { label: '进行中', color: 'bg-blue-100 text-blue-700' },
  returned: { label: '已归还', color: 'bg-green-100 text-green-700' },
  overdue: { label: '已超时', color: 'bg-red-100 text-red-700' },
  lost: { label: '已丢失', color: 'bg-gray-100 text-gray-700' },
};

export const insulationStatusMap: Record<InsulationStatus, { label: string; color: string }> = {
  excellent: { label: '优秀', color: 'bg-green-100 text-green-700' },
  good: { label: '良好', color: 'bg-blue-100 text-blue-700' },
  fair: { label: '一般', color: 'bg-yellow-100 text-yellow-700' },
  poor: { label: '较差', color: 'bg-red-100 text-red-700' },
};

export const platformMap: Record<Platform, { label: string; color: string }> = {
  meituan: { label: '美团', color: 'bg-yellow-100 text-yellow-700' },
  eleme: { label: '饿了么', color: 'bg-blue-100 text-blue-700' },
  douyin: { label: '抖音', color: 'bg-gray-100 text-gray-700' },
  other: { label: '其他', color: 'bg-purple-100 text-purple-700' },
};

export function getDefaultBagPhoto(color: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 200, 200);
    gradient.addColorStop(0, '#FFE8DC');
    gradient.addColorStop(1, color || '#FFB394');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 200, 200);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(100, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fillRect(60, 130, 80, 50);
  }
  return canvas.toDataURL();
}

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}
