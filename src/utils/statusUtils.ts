import type { Medicine, MedicineStatus } from '@/types';
import { isExpired } from './dateUtils';

export const getMedicineStatus = (medicine: Medicine): MedicineStatus => {
  if (medicine.isExpired || isExpired(medicine.expiryDate)) {
    return 'expired';
  }
  if (medicine.currentQuantity < medicine.minimumQuantity) {
    return 'insufficient';
  }
  if (medicine.currentQuantity < medicine.minimumQuantity * 1.5) {
    return 'low';
  }
  return 'sufficient';
};

export const getStatusBgColor = (status: MedicineStatus): string => {
  const colors: Record<MedicineStatus, string> = {
    sufficient: 'bg-success-50 border-l-4 border-l-success-500',
    low: 'bg-warning-50 border-l-4 border-l-warning-500',
    insufficient: 'bg-danger-50 border-l-4 border-l-danger-500',
    expired: 'bg-danger-100 border-l-4 border-l-danger-700',
  };
  return colors[status];
};

export const getStatusBadgeClass = (status: MedicineStatus): string => {
  const classes: Record<MedicineStatus, string> = {
    sufficient: 'bg-success-100 text-success-700',
    low: 'bg-warning-100 text-warning-700',
    insufficient: 'bg-danger-100 text-danger-700',
    expired: 'bg-danger-200 text-danger-800 line-through',
  };
  return classes[status];
};

export const isMedicineAvailable = (medicine: Medicine): boolean => {
  const status = getMedicineStatus(medicine);
  return status !== 'expired' && medicine.currentQuantity > 0;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const isInjuryRelated = (purpose: string): boolean => {
  const keywords = ['外伤', '擦伤', '扭伤', '撞伤', '割伤', '摔伤', '出血', '伤口', '肿痛', '拉伤'];
  return keywords.some(keyword => purpose.includes(keyword));
};
