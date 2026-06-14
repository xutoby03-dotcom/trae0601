import type { ShiftType, TransactionType, HandoverStatus, ScanCodeStatus } from '../../shared/types';

export function formatCurrency(amount: number): string {
  return `¥${amount.toFixed(2)}`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getShiftLabel(shift: ShiftType | 'morning' | 'evening'): string {
  const map: Record<string, string> = {
    morning: '早班',
    evening: '晚班',
    all: '全天',
  };
  return map[shift] || shift;
}

export function getShiftColor(shift: ShiftType | 'morning' | 'evening'): string {
  const map: Record<string, string> = {
    morning: 'bg-amber-100 text-amber-700',
    evening: 'bg-indigo-100 text-indigo-700',
    all: 'bg-primary-100 text-primary-700',
  };
  return map[shift] || 'bg-gray-100 text-gray-700';
}

export function getTransactionLabel(type: TransactionType): string {
  const map: Record<TransactionType, string> = {
    loan: '临时借出',
    replenish: '补零',
    deposit: '银行存入',
  };
  return map[type];
}

export function getTransactionColor(type: TransactionType): string {
  const map: Record<TransactionType, string> = {
    loan: 'bg-rose-100 text-rose-700',
    replenish: 'bg-emerald-100 text-emerald-700',
    deposit: 'bg-sky-100 text-sky-700',
  };
  return map[type];
}

export function getStatusLabel(status: HandoverStatus): string {
  const map: Record<HandoverStatus, string> = {
    normal: '正常',
    warning: '小额差额',
    danger: '大额差额',
  };
  return map[status];
}

export function getStatusColor(status: HandoverStatus): string {
  const map: Record<HandoverStatus, string> = {
    normal: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
  };
  return map[status];
}

export function getScanCodeLabel(status: ScanCodeStatus): string {
  const map: Record<ScanCodeStatus, string> = {
    normal: '正常',
    damaged: '破损',
    missing: '缺失',
  };
  return map[status];
}

export function getScanCodeColor(status: ScanCodeStatus): string {
  const map: Record<ScanCodeStatus, string> = {
    normal: 'bg-green-100 text-green-700',
    damaged: 'bg-amber-100 text-amber-700',
    missing: 'bg-red-100 text-red-700',
  };
  return map[status];
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}
