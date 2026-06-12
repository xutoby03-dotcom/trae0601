const STORAGE_KEY_PREFIX = 'vaccine-app';

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}-${key}`, JSON.stringify(data));
  } catch (e) {
    console.error('saveToStorage error:', e);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}-${key}`);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error('loadFromStorage error:', e);
    return defaultValue;
  }
};

export const clearStorage = (key?: string): void => {
  if (key) {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}-${key}`);
  } else {
    const keys = Object.keys(localStorage);
    keys.forEach((k) => {
      if (k.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(k);
      }
    });
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
