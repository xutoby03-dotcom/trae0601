const STORAGE_KEY = 'coffee-notes-data';

interface StoredData {
  beans: unknown[];
  brewRecords: unknown[];
  version: number;
}

export const saveToStorage = (beans: unknown[], brewRecords: unknown[]): void => {
  try {
    const data: StoredData = {
      beans,
      brewRecords,
      version: 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
};

export const loadFromStorage = (): { beans: unknown[]; brewRecords: unknown[] } | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredData;
    return {
      beans: data.beans || [],
      brewRecords: data.brewRecords || [],
    };
  } catch (e) {
    console.error('Failed to load from localStorage', e);
    return null;
  }
};
