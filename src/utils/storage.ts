export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error('Failed to save to localStorage');
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      console.error('Failed to remove from localStorage');
    }
  },
};

export const STORAGE_KEYS = {
  ELDERS: 'elderly_elders',
  COURSES: 'elderly_courses',
  REGISTRATIONS: 'elderly_registrations',
  ATTENDANCES: 'elderly_attendances',
  VOLUNTEERS: 'elderly_volunteers',
  INITIALIZED: 'elderly_initialized',
};
