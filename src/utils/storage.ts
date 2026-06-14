import type { AirConditioner, CleaningRecord } from '@/types';

const STORAGE_KEYS = {
  AIR_CONDITIONERS: 'ac_filter_air_conditioners',
  CLEANING_RECORDS: 'ac_filter_cleaning_records',
  INITIALIZED: 'ac_filter_initialized',
};

export const storage = {
  getAirConditioners: (): AirConditioner[] => {
    const data = localStorage.getItem(STORAGE_KEYS.AIR_CONDITIONERS);
    return data ? JSON.parse(data) : [];
  },

  setAirConditioners: (data: AirConditioner[]): void => {
    localStorage.setItem(STORAGE_KEYS.AIR_CONDITIONERS, JSON.stringify(data));
  },

  getCleaningRecords: (): CleaningRecord[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLEANING_RECORDS);
    return data ? JSON.parse(data) : [];
  },

  setCleaningRecords: (data: CleaningRecord[]): void => {
    localStorage.setItem(STORAGE_KEYS.CLEANING_RECORDS, JSON.stringify(data));
  },

  isInitialized: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true';
  },

  setInitialized: (value: boolean): void => {
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, String(value));
  },

  clearAll: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AIR_CONDITIONERS);
    localStorage.removeItem(STORAGE_KEYS.CLEANING_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
  },
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
