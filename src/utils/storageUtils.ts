const STORAGE_PREFIX = 'pillbox_';

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_PREFIX + key, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const serialized = localStorage.getItem(STORAGE_PREFIX + key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export function clearAllStorage(): void {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(STORAGE_PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}
