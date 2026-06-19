const STORAGE_KEYS = {
  BOXES: 'box_cleaning_boxes',
  CLEANING_RECORDS: 'box_cleaning_records',
  MAINTENANCE_RECORDS: 'box_cleaning_maintenance',
  RIDERS: 'box_cleaning_riders',
  USAGE_LOGS: 'box_cleaning_usage_logs',
  ORDERS: 'box_cleaning_orders',
  INITIALIZED: 'box_cleaning_initialized',
};

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

export { STORAGE_KEYS };
