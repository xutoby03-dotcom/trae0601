const STORAGE_KEY_BAGS = 'thermal_bags';
const STORAGE_KEY_RECORDS = 'borrow_records';

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
    return defaultValue;
  }
}

export function saveBags<T>(bags: T): void {
  saveToStorage(STORAGE_KEY_BAGS, bags);
}

export function loadBags<T>(defaultValue: T): T {
  return loadFromStorage(STORAGE_KEY_BAGS, defaultValue);
}

export function saveRecords<T>(records: T): void {
  saveToStorage(STORAGE_KEY_RECORDS, records);
}

export function loadRecords<T>(defaultValue: T): T {
  return loadFromStorage(STORAGE_KEY_RECORDS, defaultValue);
}

export function exportData(): string {
  const bags = loadFromStorage(STORAGE_KEY_BAGS, []);
  const records = loadFromStorage(STORAGE_KEY_RECORDS, []);
  return JSON.stringify({ bags, records, exportedAt: new Date().toISOString() }, null, 2);
}

export function importData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.bags) saveBags(data.bags);
    if (data.records) saveRecords(data.records);
    return true;
  } catch (e) {
    console.error('Failed to import data:', e);
    return false;
  }
}
