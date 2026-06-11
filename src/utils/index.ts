import type { LoanStatus, DeviceStatus, ExceptionType, ExceptionSeverity, ExceptionStatus, RenewalStatus } from '../types';

export const formatDate = (date: string): string => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

export const formatMoney = (amount: number): string => {
  return `¥${amount.toLocaleString('zh-CN')}`;
};

export const getDaysUntilReturn = (expectedReturnDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(expectedReturnDate);
  expected.setHours(0, 0, 0, 0);
  const diff = expected.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const isOverdue = (expectedReturnDate: string, status: string): boolean => {
  if (status === 'returned') return false;
  return getDaysUntilReturn(expectedReturnDate) < 0;
};

export const isDueSoon = (expectedReturnDate: string, status: string, days = 7): boolean => {
  if (status === 'returned') return false;
  const daysLeft = getDaysUntilReturn(expectedReturnDate);
  return daysLeft >= 0 && daysLeft <= days;
};

export const getLoanStatusLabel = (status: LoanStatus): string => {
  const labels: Record<LoanStatus, string> = {
    pending: '待审核',
    active: '借出中',
    returned: '已归还',
    overdue: '已逾期',
  };
  return labels[status] || status;
};

export const getDeviceStatusLabel = (status: DeviceStatus): string => {
  const labels: Record<DeviceStatus, string> = {
    available: '可用',
    loaned: '借出中',
    maintenance: '维修中',
    scrapped: '已报废',
  };
  return labels[status] || status;
};

export const getDeviceStatusColor = (status: DeviceStatus): string => {
  const colors: Record<DeviceStatus, string> = {
    available: 'bg-success-500',
    loaned: 'bg-primary-500',
    maintenance: 'bg-warning-500',
    scrapped: 'bg-gray-400',
  };
  return colors[status] || 'bg-gray-400';
};

export const getExceptionTypeLabel = (type: ExceptionType): string => {
  const labels: Record<ExceptionType, string> = {
    accessory_missing: '配件缺失',
    damage: '外观损坏',
    malfunction: '功能故障',
    other: '其他异常',
  };
  return labels[type] || type;
};

export const getExceptionSeverityLabel = (severity: ExceptionSeverity): string => {
  const labels: Record<ExceptionSeverity, string> = {
    low: '轻微',
    medium: '一般',
    high: '严重',
  };
  return labels[severity] || severity;
};

export const getExceptionSeverityColor = (severity: ExceptionSeverity): string => {
  const colors: Record<ExceptionSeverity, string> = {
    low: 'bg-warning-500',
    medium: 'bg-orange-500',
    high: 'bg-danger-500',
  };
  return colors[severity] || 'bg-gray-400';
};

export const getExceptionStatusLabel = (status: ExceptionStatus): string => {
  const labels: Record<ExceptionStatus, string> = {
    open: '待处理',
    processing: '处理中',
    resolved: '已解决',
  };
  return labels[status] || status;
};

export const getRenewalStatusLabel = (status: RenewalStatus): string => {
  const labels: Record<RenewalStatus, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝',
  };
  return labels[status] || status;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const addDays = (date: string, days: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};
