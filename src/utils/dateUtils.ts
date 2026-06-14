import { DocumentStatus } from '@/types';

export function formatDate(dateStr: string): string {
  if (!dateStr) return '未设置';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysUntil(dateStr: string): number {
  if (!dateStr) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getDocumentStatus(expiryDate: string): DocumentStatus {
  if (!expiryDate) return 'normal';
  const days = getDaysUntil(expiryDate);
  if (days < 0) return 'expired';
  if (days < 30) return 'warning';
  return 'normal';
}

export function getStatusText(status: DocumentStatus): string {
  switch (status) {
    case 'expired':
      return '已过期';
    case 'warning':
      return '即将过期';
    case 'normal':
      return '正常';
  }
}

export function maskDocumentNumber(number: string): string {
  if (!number) return '';
  if (number.length <= 4) return '*'.repeat(number.length);
  const start = number.slice(0, 3);
  const end = number.slice(-4);
  const middle = '*'.repeat(Math.max(number.length - 7, 4));
  return start + middle + end;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
