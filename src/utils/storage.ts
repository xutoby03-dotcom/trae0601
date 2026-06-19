const STORAGE_KEYS = {
  TEAPOTS: 'tea_inspection_teapots',
  BATCHES: 'tea_inspection_batches',
  INSPECTIONS: 'tea_inspection_inspections',
};

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Storage error:', error);
  }
}

export const storage = {
  teapots: {
    get: () => getFromStorage(STORAGE_KEYS.TEAPOTS, []),
    set: (value: unknown) => setToStorage(STORAGE_KEYS.TEAPOTS, value),
  },
  batches: {
    get: () => getFromStorage(STORAGE_KEYS.BATCHES, []),
    set: (value: unknown) => setToStorage(STORAGE_KEYS.BATCHES, value),
  },
  inspections: {
    get: () => getFromStorage(STORAGE_KEYS.INSPECTIONS, []),
    set: (value: unknown) => setToStorage(STORAGE_KEYS.INSPECTIONS, value),
  },
};
