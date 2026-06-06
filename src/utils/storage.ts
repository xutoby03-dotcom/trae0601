import { ReadingRecord } from '@/types';

const STORAGE_KEY = 'tarot_reading_history';

export const saveRecord = (record: ReadingRecord): void => {
  try {
    const records = getRecords();
    records.unshift(record);
    if (records.length > 50) {
      records.pop();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save record:', e);
  }
};

export const getRecords = (): ReadingRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to get records:', e);
    return [];
  }
};

export const clearRecords = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear records:', e);
  }
};

export const deleteRecord = (id: string): void => {
  try {
    const records = getRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete record:', e);
  }
};
