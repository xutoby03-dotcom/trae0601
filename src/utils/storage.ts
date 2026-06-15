import type { AppState, Room, Curtain, WashingRecord, Photo, Reminder } from '@/types';

const STORAGE_KEYS = {
  ROOMS: 'curtain_manager_rooms',
  CURTAINS: 'curtain_manager_curtains',
  RECORDS: 'curtain_manager_records',
  PHOTOS: 'curtain_manager_photos',
  REMINDERS: 'curtain_manager_reminders',
} as const;

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
}

export function loadFromStorage(): AppState {
  return {
    rooms: getFromStorage<Room[]>(STORAGE_KEYS.ROOMS, []),
    curtains: getFromStorage<Curtain[]>(STORAGE_KEYS.CURTAINS, []),
    records: getFromStorage<WashingRecord[]>(STORAGE_KEYS.RECORDS, []),
    photos: getFromStorage<Photo[]>(STORAGE_KEYS.PHOTOS, []),
    reminders: getFromStorage<Reminder[]>(STORAGE_KEYS.REMINDERS, []),
  };
}

export function saveRooms(rooms: Room[]): void {
  saveToStorage(STORAGE_KEYS.ROOMS, rooms);
}

export function saveCurtains(curtains: Curtain[]): void {
  saveToStorage(STORAGE_KEYS.CURTAINS, curtains);
}

export function saveRecords(records: WashingRecord[]): void {
  saveToStorage(STORAGE_KEYS.RECORDS, records);
}

export function savePhotos(photos: Photo[]): void {
  saveToStorage(STORAGE_KEYS.PHOTOS, photos);
}

export function saveReminders(reminders: Reminder[]): void {
  saveToStorage(STORAGE_KEYS.REMINDERS, reminders);
}

export function exportData(): string {
  const data = loadFromStorage();
  return JSON.stringify(data, null, 2);
}

export function importData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr) as AppState;
    if (data.rooms) saveRooms(data.rooms);
    if (data.curtains) saveCurtains(data.curtains);
    if (data.records) saveRecords(data.records);
    if (data.photos) savePhotos(data.photos);
    if (data.reminders) saveReminders(data.reminders);
    return true;
  } catch {
    return false;
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
