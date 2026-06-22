export type ReadingStatus = 'normal' | 'low' | 'high' | 'empty';

export interface ReadingRange {
  min: number;
  max: number;
  unit: string;
}

export const SALINITY_RANGE: ReadingRange = {
  min: 25,
  max: 32,
  unit: '‰',
};

export const WATER_TEMP_RANGE: ReadingRange = {
  min: 15,
  max: 28,
  unit: '°C',
};

export function getSalinityStatus(value: number | undefined | null): ReadingStatus {
  if (value === undefined || value === null || isNaN(value) || value === 0) {
    return 'empty';
  }
  if (value < SALINITY_RANGE.min) {
    return 'low';
  }
  if (value > SALINITY_RANGE.max) {
    return 'high';
  }
  return 'normal';
}

export function getWaterTempStatus(value: number | undefined | null): ReadingStatus {
  if (value === undefined || value === null || isNaN(value) || value === 0) {
    return 'empty';
  }
  if (value < WATER_TEMP_RANGE.min) {
    return 'low';
  }
  if (value > WATER_TEMP_RANGE.max) {
    return 'high';
  }
  return 'normal';
}

export const statusConfig: Record<ReadingStatus, { label: string; className: string }> = {
  normal: {
    label: '正常',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  low: {
    label: '偏低',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  high: {
    label: '偏高',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  empty: {
    label: '未测',
    className: 'bg-slate-100 text-slate-500 border-slate-200',
  },
};
