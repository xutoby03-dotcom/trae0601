import { format, parseISO, differenceInDays, isBefore, isAfter, addDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { BorrowStatus, BoxStatus, SecurityLevel } from '../types';

export function formatDate(date: string | Date, pattern: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: zhCN });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm', { locale: zhCN });
}

export function isOverdue(expectedReturnDate: string): boolean {
  return isBefore(parseISO(expectedReturnDate), new Date());
}

export function daysOverdue(expectedReturnDate: string): number {
  return Math.max(0, differenceInDays(new Date(), parseISO(expectedReturnDate)));
}

export function isUpcomingAudit(auditDate?: string, days: number = 30): boolean {
  if (!auditDate) return false;
  const target = parseISO(auditDate);
  const now = new Date();
  return isAfter(target, now) && differenceInDays(target, now) <= days;
}

export function daysUntil(date: string): number {
  return differenceInDays(parseISO(date), new Date());
}

export function addDaysFromNow(days: number): string {
  return format(addDays(new Date(), days), 'yyyy-MM-dd');
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export const statusColors: Record<BorrowStatus | BoxStatus, string> = {
  '待审批': 'bg-gold-50 text-gold-700 border border-gold-200',
  '已通过': 'bg-blue-50 text-blue-700 border border-blue-200',
  '已驳回': 'bg-gray-100 text-gray-600 border border-gray-200',
  '借出中': 'bg-orange-50 text-orange-700 border border-orange-200',
  '已归还': 'bg-green-50 text-green-700 border border-green-200',
  '已逾期': 'bg-red-50 text-red-700 border border-red-200',
  '在库': 'bg-green-50 text-green-700 border border-green-200',
  '借出': 'bg-orange-50 text-orange-700 border border-orange-200',
  '异常': 'bg-red-50 text-red-700 border border-red-200',
};

export const securityColors: Record<SecurityLevel, string> = {
  '普通': 'bg-gray-100 text-gray-700',
  '内部': 'bg-blue-50 text-blue-700',
  '机密': 'bg-gold-50 text-gold-700',
  '绝密': 'bg-red-50 text-red-700',
};

export function generateId(prefix: string): string {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

export function needsManagerApproval(level: SecurityLevel): boolean {
  return level === '机密' || level === '绝密';
}
