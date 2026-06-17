export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Storage remove error:', e);
    }
  },
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
};
