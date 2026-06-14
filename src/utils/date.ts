import { format, differenceInDays, addDays, isBefore, isAfter, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(dateStr: string, pattern: string = 'yyyy-MM-dd'): string {
  try {
    return format(parseISO(dateStr), pattern, { locale: zhCN });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, 'yyyy-MM-dd HH:mm');
}

export function daysBetween(startStr: string, endStr: string): number {
  try {
    return differenceInDays(parseISO(endStr), parseISO(startStr));
  } catch {
    return 0;
  }
}

export function daysFromNow(dateStr: string): number {
  try {
    return differenceInDays(parseISO(dateStr), new Date());
  } catch {
    return 0;
  }
}

export function isOverdue(deadlineStr: string): boolean {
  try {
    return isAfter(new Date(), parseISO(deadlineStr));
  } catch {
    return false;
  }
}

export function addDaysFromNow(days: number): string {
  return addDays(new Date(), days).toISOString();
}

export function getDeadlineStatus(deadlineStr: string): {
  status: 'urgent' | 'warning' | 'normal' | 'overdue';
  days: number;
  label: string;
} {
  const days = daysFromNow(deadlineStr);
  
  if (isOverdue(deadlineStr)) {
    return { status: 'overdue', days: Math.abs(days), label: `已超期${Math.abs(days)}天` };
  }
  if (days <= 1) {
    return { status: 'urgent', days, label: `剩余${days}天` };
  }
  if (days <= 3) {
    return { status: 'warning', days, label: `剩余${days}天` };
  }
  return { status: 'normal', days, label: `剩余${days}天` };
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
