export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

export const STORAGE_KEYS = {
  COFFEE_FLAVORS: 'coffee_flavors',
  INVENTORY_BATCHES: 'inventory_batches',
  CONSUMPTION_LOGS: 'consumption_logs',
  SUPPLY_ITEMS: 'supply_items',
  SUPPLY_LOGS: 'supply_logs',
  DEPARTMENTS: 'departments',
  PURCHASE_ITEMS: 'purchase_items',
  INITIALIZED: 'app_initialized',
};
