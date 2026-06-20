const PREFIX = 'prop-station_';

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(`${PREFIX}${key}`);
    if (stored) {
      return JSON.parse(stored) as T;
    }
    return defaultValue;
  } catch (e) {
    console.error('Failed to load from localStorage', e);
    return defaultValue;
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
  } catch (e) {
    console.error('Failed to remove from localStorage', e);
  }
}
