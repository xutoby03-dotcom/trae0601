const STORAGE_KEYS = {
  ROUTES: 'carpool_routes',
  BOOKINGS: 'carpool_bookings',
  CURRENT_USER: 'carpool_current_user'
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const saveRoutes = (routes: unknown[]): void => {
  saveToStorage(STORAGE_KEYS.ROUTES, routes);
};

export const loadRoutes = <T>(defaultValue: T): T => {
  return loadFromStorage(STORAGE_KEYS.ROUTES, defaultValue);
};

export const saveBookings = (bookings: unknown[]): void => {
  saveToStorage(STORAGE_KEYS.BOOKINGS, bookings);
};

export const loadBookings = <T>(defaultValue: T): T => {
  return loadFromStorage(STORAGE_KEYS.BOOKINGS, defaultValue);
};

export const saveCurrentUser = (user: unknown): void => {
  saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
};

export const loadCurrentUser = <T>(defaultValue: T): T => {
  return loadFromStorage(STORAGE_KEYS.CURRENT_USER, defaultValue);
};

export const clearStorage = (): void => {
  localStorage.removeItem(STORAGE_KEYS.ROUTES);
  localStorage.removeItem(STORAGE_KEYS.BOOKINGS);
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};
