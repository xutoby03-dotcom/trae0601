export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const STORAGE_KEYS = {
  VEHICLES: 'child-seat-vehicles',
  SEATS: 'child-seat-seats',
  INSTALLATIONS: 'child-seat-installations',
  INSPECTIONS: 'child-seat-inspections',
  TASKS: 'child-seat-tasks',
  REMINDERS: 'child-seat-reminders',
  CHILD_PROFILE: 'child-seat-child-profile',
} as const;
