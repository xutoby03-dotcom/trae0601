export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: number | null = null;
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = window.setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
}

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`Failed to set localStorage item: ${key}`);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      console.error(`Failed to remove localStorage item: ${key}`);
    }
  },

  clear(): void {
    try {
      localStorage.clear();
    } catch {
      console.error('Failed to clear localStorage');
    }
  },
};

export function createDebouncedStorage(delay: number = 300) {
  const debouncedSet = debounce((key: string, value: unknown) => {
    storage.set(key, value);
  }, delay);

  return {
    get: storage.get,
    set: debouncedSet,
    remove: storage.remove,
    clear: storage.clear,
    flush: (key: string, value: unknown) => {
      storage.set(key, value);
    },
  };
}

export const debouncedStorage = createDebouncedStorage(300);
