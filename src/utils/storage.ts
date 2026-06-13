const isBrowser = typeof window !== "undefined";

export function storageGet<T>(key: string, defaultValue?: T): T | undefined {
  if (!isBrowser) return defaultValue;

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[storage] get failed for key "${key}":`, e);
    return defaultValue;
  }
}

export function storageSet<T>(key: string, value: T): void {
  if (!isBrowser) return;

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch (e) {
    console.warn(`[storage] set failed for key "${key}":`, e);
  }
}

export function storageRemove(key: string): void {
  if (!isBrowser) return;

  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    console.warn(`[storage] remove failed for key "${key}":`, e);
  }
}

export function storageClear(): void {
  if (!isBrowser) return;

  try {
    window.localStorage.clear();
  } catch (e) {
    console.warn("[storage] clear failed:", e);
  }
}

export function storageHas(key: string): boolean {
  if (!isBrowser) return false;
  return window.localStorage.getItem(key) !== null;
}
