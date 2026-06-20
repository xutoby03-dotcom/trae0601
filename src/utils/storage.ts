const STORAGE_PREFIX = 'photo-gear-manager-';

export function saveToStorage<T>(key: string, data: T): void {
  try {
    const fullKey = STORAGE_PREFIX + key;
    const serialized = JSON.stringify({
      data,
      timestamp: Date.now(),
    });
    localStorage.setItem(fullKey, serialized);
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  try {
    const fullKey = STORAGE_PREFIX + key;
    const serialized = localStorage.getItem(fullKey);
    if (!serialized) return null;
    const { data } = JSON.parse(serialized);
    return data as T;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}

export function removeFromStorage(key: string): void {
  try {
    const fullKey = STORAGE_PREFIX + key;
    localStorage.removeItem(fullKey);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

export function clearAllStorage(): void {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function exportData(): string {
  const data: Record<string, unknown> = {};
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(STORAGE_PREFIX)) {
      const shortKey = key.replace(STORAGE_PREFIX, '');
      const value = localStorage.getItem(key);
      if (value) {
        data[shortKey] = JSON.parse(value);
      }
    }
  });
  return JSON.stringify(data, null, 2);
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    clearAllStorage();
    Object.entries(data).forEach(([key, value]) => {
      const fullKey = STORAGE_PREFIX + key;
      localStorage.setItem(fullKey, JSON.stringify(value));
    });
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}
