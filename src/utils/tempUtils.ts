import { TEMP_MIN, TEMP_MAX } from '@/types';

export const isTempNormal = (temp: number): boolean => {
  return temp >= TEMP_MIN && temp <= TEMP_MAX;
};

export const getTempStatus = (temp: number): 'normal' | 'high' | 'low' => {
  if (temp > TEMP_MAX) return 'high';
  if (temp < TEMP_MIN) return 'low';
  return 'normal';
};

export const getTempColor = (temp: number): string => {
  return isTempNormal(temp) ? 'text-status-normal' : 'text-status-danger';
};

export const getDeviation = (temp: number): number => {
  if (temp > TEMP_MAX) return temp - TEMP_MAX;
  if (temp < TEMP_MIN) return temp - TEMP_MIN;
  return 0;
};
