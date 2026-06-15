import { CoffeeRecord } from '@/types';
import { mockRecords } from './mockData';

const STORAGE_KEY = 'coffee-records';

export function loadRecords(): CoffeeRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load records from localStorage:', e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockRecords));
  return mockRecords;
}

export function saveRecords(records: CoffeeRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save records to localStorage:', e);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
