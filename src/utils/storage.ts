const STORAGE_PREFIX = 'study_seat_';

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
}

export const STORAGE_KEYS = {
  CLASSROOMS: 'classrooms',
  SEATS: 'seats',
  STUDENTS: 'students',
  RESERVATIONS: 'reservations',
  CHECKIN_RECORDS: 'checkin_records',
  CHANGE_RECORDS: 'change_records',
  CURRENT_ROLE: 'current_role',
  INITIALIZED: 'initialized',
} as const;
