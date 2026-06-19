import { format, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: zhCN });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'yyyy-MM-dd HH:mm:ss');
}

export function getDaysSince(date: string): number {
  return differenceInDays(new Date(), new Date(date));
}

export function getTodayString(): string {
  return formatDate(new Date(), 'yyyy-MM-dd');
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    scrapped: 'bg-red-100 text-red-800',
    pending_cleaning: 'bg-orange-100 text-orange-800',
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    repaired: 'bg-green-100 text-green-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}
