const STORAGE_KEY = 'sample_tracking_data';

interface StorageData {
  samples: unknown[];
  shipmentOrders: unknown[];
  inventoryLogs: unknown[];
  version: number;
}

const CURRENT_VERSION = 1;

export const saveToLocalStorage = (data: Omit<StorageData, 'version'>): void => {
  try {
    const storageData: StorageData = {
      ...data,
      version: CURRENT_VERSION,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromLocalStorage = (): StorageData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data) as StorageData;
    if (parsed.version !== CURRENT_VERSION) {
      console.warn('Data version mismatch, reinitializing...');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
};

export const clearLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear localStorage:', error);
  }
};
