import type { Cable, BorrowRecord, Employee, Alert, SystemConfig } from '@/types';

const STORAGE_KEYS = {
  CABLES: 'cables',
  BORROW_RECORDS: 'borrowRecords',
  EMPLOYEES: 'employees',
  ALERTS: 'alerts',
  CURRENT_USER: 'currentUser',
  SYSTEM_CONFIG: 'systemConfig',
  INITIALIZED: 'initialized',
};

const DEFAULT_CONFIG: SystemConfig = {
  safeStock: 2,
  overdueHours: 24,
  maxBorrowPerPerson: 2,
};

function get<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function remove(key: string): void {
  localStorage.removeItem(key);
}

export const storage = {
  getCables(): Cable[] {
    return get<Cable[]>(STORAGE_KEYS.CABLES, []);
  },

  setCables(cables: Cable[]): void {
    set(STORAGE_KEYS.CABLES, cables);
  },

  getBorrowRecords(): BorrowRecord[] {
    return get<BorrowRecord[]>(STORAGE_KEYS.BORROW_RECORDS, []);
  },

  setBorrowRecords(records: BorrowRecord[]): void {
    set(STORAGE_KEYS.BORROW_RECORDS, records);
  },

  getEmployees(): Employee[] {
    return get<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
  },

  setEmployees(employees: Employee[]): void {
    set(STORAGE_KEYS.EMPLOYEES, employees);
  },

  getAlerts(): Alert[] {
    return get<Alert[]>(STORAGE_KEYS.ALERTS, []);
  },

  setAlerts(alerts: Alert[]): void {
    set(STORAGE_KEYS.ALERTS, alerts);
  },

  getCurrentUser(): Employee | null {
    return get<Employee | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser(user: Employee | null): void {
    set(STORAGE_KEYS.CURRENT_USER, user);
  },

  getSystemConfig(): SystemConfig {
    return get<SystemConfig>(STORAGE_KEYS.SYSTEM_CONFIG, DEFAULT_CONFIG);
  },

  setSystemConfig(config: Partial<SystemConfig>): void {
    const current = this.getSystemConfig();
    set(STORAGE_KEYS.SYSTEM_CONFIG, { ...current, ...config });
  },

  isInitialized(): boolean {
    return get<boolean>(STORAGE_KEYS.INITIALIZED, false);
  },

  setInitialized(value: boolean): void {
    set(STORAGE_KEYS.INITIALIZED, value);
  },
};
