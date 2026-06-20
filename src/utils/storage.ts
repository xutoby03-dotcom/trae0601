export const STORAGE_KEYS = {
  COUNTERS: 'perfume_counters',
  GUIDES: 'perfume_guides',
  INVENTORY: 'perfume_inventory',
  INSPECTIONS: 'perfume_inspections',
  SUPPLY_TASKS: 'perfume_supply_tasks',
  ACTIVITIES: 'perfume_activities',
  CONSUMPTION: 'perfume_consumption',
  LAST_SYNC: 'perfume_last_sync',
  USER_SETTINGS: 'perfume_user_settings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export const saveToStorage = <T>(key: StorageKey, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Failed to save data to localStorage key "${key}":`, error);
  }
};

export const loadFromStorage = <T>(key: StorageKey, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Failed to load data from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const removeFromStorage = (key: StorageKey): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove data from localStorage key "${key}":`, error);
  }
};

export const clearAllStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};

export const delay = (ms: number = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let idCounter = 0;
export const generateId = (prefix: string = 'id'): string => {
  idCounter += 1;
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}-${idCounter}`;
};

export const storage = {
  has: (key: string): boolean => {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  },

  get: <T>(key: string, defaultValue: T): T => {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return defaultValue;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error(`Failed to get data from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, data: T): void => {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error(`Failed to set data to localStorage key "${key}":`, error);
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove data from localStorage key "${key}":`, error);
    }
  },
};
