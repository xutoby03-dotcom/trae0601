const STORAGE_PREFIX = 'haircut-app-';

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (e) {
    console.error('Failed to remove from localStorage:', e);
  }
}
