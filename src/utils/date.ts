import { differenceInDays, isSameWeek, parseISO } from 'date-fns';
import type { LicenseStatus, Vendor } from '@/types';

export const getDaysUntilExpiry = (validUntil: string): number => {
  const expiryDate = parseISO(validUntil);
  const today = new Date();
  return differenceInDays(expiryDate, today);
};

export const getLicenseStatus = (validUntil: string): LicenseStatus => {
  const daysLeft = getDaysUntilExpiry(validUntil);
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 30) return 'expiring';
  return 'normal';
};

export const getVendorLicenseStatus = (vendor: Vendor): LicenseStatus => {
  return getLicenseStatus(vendor.validUntil);
};

export const isExpiringThisWeek = (validUntil: string): boolean => {
  const expiryDate = parseISO(validUntil);
  const today = new Date();
  return isSameWeek(expiryDate, today, { weekStartsOn: 1 });
};

export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateString: string): string => {
  const date = parseISO(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};
