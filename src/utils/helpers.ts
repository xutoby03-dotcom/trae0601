import type { ApplicationStatus, RiskLevel, SealStatus, RecordStatus } from '@/types';

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateOnly = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const getSealStatusText = (status: SealStatus): string => {
  const map: Record<SealStatus, string> = {
    available: '可用',
    in_use: '使用中',
    maintenance: '维护中',
  };
  return map[status];
};

export const getSealStatusColor = (status: SealStatus): string => {
  const map: Record<SealStatus, string> = {
    available: 'bg-green-100 text-green-700 border-green-200',
    in_use: 'bg-blue-100 text-blue-700 border-blue-200',
    maintenance: 'bg-gray-100 text-gray-600 border-gray-200',
  };
  return map[status];
};

export const getRiskLevelText = (level: RiskLevel): string => {
  const map: Record<RiskLevel, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
  };
  return map[level];
};

export const getRiskLevelColor = (level: RiskLevel): string => {
  const map: Record<RiskLevel, string> = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-red-100 text-seal-red border-red-200',
  };
  return map[level];
};

export const getApplicationStatusText = (status: ApplicationStatus): string => {
  const map: Record<ApplicationStatus, string> = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已驳回',
    checked_out: '已外带',
    returned: '已归还',
    overdue: '逾期未还',
  };
  return map[status];
};

export const getApplicationStatusColor = (status: ApplicationStatus): string => {
  const map: Record<ApplicationStatus, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-blue-100 text-blue-700 border-blue-200',
    rejected: 'bg-gray-100 text-gray-600 border-gray-200',
    checked_out: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    returned: 'bg-green-100 text-green-700 border-green-200',
    overdue: 'bg-red-100 text-seal-red border-red-300 animate-pulse-red',
  };
  return map[status];
};

export const getRecordStatusText = (status: RecordStatus): string => {
  const map: Record<RecordStatus, string> = {
    checked_out: '外带中',
    returned: '已归还',
    overdue: '逾期未还',
  };
  return map[status];
};

export const getRecordStatusColor = (status: RecordStatus): string => {
  const map: Record<RecordStatus, string> = {
    checked_out: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    returned: 'bg-green-100 text-green-700 border-green-200',
    overdue: 'bg-red-100 text-seal-red border-red-300 animate-pulse-red',
  };
  return map[status];
};

export const isOverdue = (expectedReturn: string, actualReturn?: string): boolean => {
  const returnTime = actualReturn ? new Date(actualReturn) : new Date();
  return returnTime > new Date(expectedReturn);
};

export const getOverdueHours = (expectedReturn: string): number => {
  const diff = new Date().getTime() - new Date(expectedReturn).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
};
