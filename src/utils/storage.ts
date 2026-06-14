import type { Trip } from '@/types';
import { mockTrips } from '@/data/mockData';

const STORAGE_KEY = 'carpool_trips';
const STORAGE_VERSION_KEY = 'carpool_trips_version';
const CURRENT_VERSION = 6;

export function loadTripsFromStorage(): Trip[] {
  try {
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    if (storedVersion !== String(CURRENT_VERSION)) {
      saveTripsToStorage(mockTrips);
      return mockTrips;
    }
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const firstTrip = parsed[0];
        const hasReceipt = firstTrip.expenses?.some((e: any) => e.receiptUrl);
        if (!hasReceipt) {
          saveTripsToStorage(mockTrips);
          return mockTrips;
        }
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load trips from localStorage:', e);
  }
  return [];
}

export function saveTripsToStorage(trips: Trip[]): void {
  try {
    localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (e) {
    console.error('Failed to save trips to localStorage:', e);
  }
}
