import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { IssueType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

export function isOverdue(expectedReturn: string): boolean {
  return new Date(expectedReturn) < new Date();
}

export function getIssueLabel(type: IssueType): string {
  const labels: Record<IssueType, string> = {
    overdue: '逾期未还',
    missing_parts: '配件不齐',
    desktop_damaged: '桌面破损',
  };
  return labels[type];
}

export function getIssueColor(type: IssueType): string {
  const colors: Record<IssueType, string> = {
    overdue: 'bg-red-100 text-red-700 border-red-200',
    missing_parts: 'bg-amber-100 text-amber-700 border-amber-200',
    desktop_damaged: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  return colors[type];
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    available: '可借用',
    borrowed: '已借出',
    maintenance: '维修中',
    active: '借用中',
    returned: '已归还',
    overdue: '已逾期',
  };
  return labels[status] || status;
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export function getDaysLeft(expectedReturn: string): number {
  const diff = new Date(expectedReturn).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
