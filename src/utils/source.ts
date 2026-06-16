import { CheckInSource, SourceConfig } from '@/types';

export const sourceConfig: Record<CheckInSource, SourceConfig> = {
  elderly_phone: {
    label: '老人电话',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: 'Phone',
  },
  family_report: {
    label: '家属代报',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    icon: 'Users',
  },
  smart_device: {
    label: '智能设备',
    color: 'text-cyan-700',
    bgColor: 'bg-cyan-50 border-cyan-200',
    icon: 'Wifi',
  },
  home_visit: {
    label: '上门查看',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: 'Home',
  },
};

export const getSourceLabel = (source: CheckInSource): string => {
  return sourceConfig[source]?.label || source;
};

export const getSourceColor = (source: CheckInSource): string => {
  return sourceConfig[source]?.color || 'text-gray-700';
};

export const getSourceBgColor = (source: CheckInSource): string => {
  return sourceConfig[source]?.bgColor || 'bg-gray-50 border-gray-200';
};

export const getSourceIcon = (source: CheckInSource): string => {
  return sourceConfig[source]?.icon || 'Circle';
};

export const preferredMethodLabels: Record<string, string> = {
  phone: '电话确认',
  family: '家属代报',
  device: '智能设备',
  visit: '上门查看',
};
