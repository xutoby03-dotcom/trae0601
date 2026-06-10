import type { Document, DocumentStatus, ProcessStatus } from '@/types';
import { DEFAULT_REMINDER_SETTINGS } from '@/types';

export const getDaysUntilExpiry = (expireDate: string): number => {
  if (expireDate === 'long_term' || !expireDate) return Infinity;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expire = new Date(expireDate);
  expire.setHours(0, 0, 0, 0);
  const diffTime = expire.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDocumentStatus = (doc: Document): DocumentStatus => {
  const days = getDaysUntilExpiry(doc.expireDate);

  if (days === Infinity) return 'long_term';
  if (days < 0) return 'expired';
  if (days <= 90) return 'expiring_soon';
  return 'valid';
};

export const getDefaultRemindDays = (type: string): number => {
  const setting = DEFAULT_REMINDER_SETTINGS.find(s => s.documentType === type);
  return setting?.defaultDays ?? 30;
};

export const formatDate = (dateStr: string): string => {
  if (dateStr === 'long_term') return '长期有效';
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatExpiryDisplay = (expireDate: string): { text: string; colorClass: string } => {
  const days = getDaysUntilExpiry(expireDate);

  if (days === Infinity) {
    return { text: '长期有效', colorClass: 'text-green-600' };
  }
  if (days < 0) {
    return { text: `已过期 ${Math.abs(days)} 天`, colorClass: 'text-red-600' };
  }
  if (days === 0) {
    return { text: '今日到期', colorClass: 'text-red-600' };
  }
  if (days <= 30) {
    return { text: `还有 ${days} 天到期`, colorClass: 'text-orange-600' };
  }
  if (days <= 90) {
    return { text: `还有 ${days} 天到期`, colorClass: 'text-yellow-600' };
  }
  return { text: formatDate(expireDate), colorClass: 'text-slate-600' };
};

export const isProcessInProgress = (status: ProcessStatus): boolean => {
  return status !== 'not_started' && status !== 'completed';
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
