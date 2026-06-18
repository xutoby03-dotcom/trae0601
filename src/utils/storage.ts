import type { Table, Booking, ReturnRecord, DamageRecord, Admin } from '../types';

const STORAGE_KEYS = {
  TABLES: 'pingpong_tables',
  BOOKINGS: 'pingpong_bookings',
  RETURN_RECORDS: 'pingpong_returns',
  DAMAGE_RECORDS: 'pingpong_damages',
  ADMINS: 'pingpong_admins',
  CURRENT_PHONE: 'pingpong_current_phone',
};

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeFromStorage(key: string): void {
  localStorage.removeItem(key);
}

export const storage = {
  getTables: (): Table[] => getFromStorage<Table[]>(STORAGE_KEYS.TABLES, []),
  setTables: (tables: Table[]) => setToStorage(STORAGE_KEYS.TABLES, tables),
  
  getBookings: (): Booking[] => getFromStorage<Booking[]>(STORAGE_KEYS.BOOKINGS, []),
  setBookings: (bookings: Booking[]) => setToStorage(STORAGE_KEYS.BOOKINGS, bookings),
  
  getReturnRecords: (): ReturnRecord[] => getFromStorage<ReturnRecord[]>(STORAGE_KEYS.RETURN_RECORDS, []),
  setReturnRecords: (records: ReturnRecord[]) => setToStorage(STORAGE_KEYS.RETURN_RECORDS, records),
  
  getDamageRecords: (): DamageRecord[] => getFromStorage<DamageRecord[]>(STORAGE_KEYS.DAMAGE_RECORDS, []),
  setDamageRecords: (records: DamageRecord[]) => setToStorage(STORAGE_KEYS.DAMAGE_RECORDS, records),
  
  getAdmins: (): Admin[] => getFromStorage<Admin[]>(STORAGE_KEYS.ADMINS, []),
  setAdmins: (admins: Admin[]) => setToStorage(STORAGE_KEYS.ADMINS, admins),
  
  getCurrentPhone: (): string => getFromStorage<string>(STORAGE_KEYS.CURRENT_PHONE, ''),
  setCurrentPhone: (phone: string) => setToStorage(STORAGE_KEYS.CURRENT_PHONE, phone),
};
