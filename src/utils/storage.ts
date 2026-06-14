import type { Trip } from '@/types';

const STORAGE_KEY = 'carpool_trips';

export function loadTripsFromStorage(): Trip[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load trips from localStorage:', e);
  }
  return [];
}

export function saveTripsToStorage(trips: Trip[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (e) {
    console.error('Failed to save trips to localStorage:', e);
  }
}
