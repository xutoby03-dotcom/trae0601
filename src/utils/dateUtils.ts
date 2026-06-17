import { STORAGE_PERIOD_DAYS, EXPIRING_WARNING_DAYS } from './constants';

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(dateString);
};

export const getExpiryDate = (foundTime: string, periodDays: number = STORAGE_PERIOD_DAYS): Date => {
  const date = new Date(foundTime);
  date.setDate(date.getDate() + periodDays);
  return date;
};

export const getDaysUntilExpiry = (foundTime: string, periodDays: number = STORAGE_PERIOD_DAYS): number => {
  const expiryDate = getExpiryDate(foundTime, periodDays);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

export const isExpiringSoon = (foundTime: string, periodDays: number = STORAGE_PERIOD_DAYS): boolean => {
  const daysUntil = getDaysUntilExpiry(foundTime, periodDays);
  return daysUntil <= EXPIRING_WARNING_DAYS && daysUntil >= 0;
};

export const isExpired = (foundTime: string, periodDays: number = STORAGE_PERIOD_DAYS): boolean => {
  return getDaysUntilExpiry(foundTime, periodDays) < 0;
};

export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

export const getDateInputValue = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
