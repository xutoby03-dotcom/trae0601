import { Device, LendingRecord, Compensation } from '../types';

const STORAGE_KEYS = {
  DEVICES: 'powerbank_devices',
  LENDING_RECORDS: 'powerbank_lending_records',
  COMPENSATIONS: 'powerbank_compensations',
};

export function getDevices(): Device[] {
  const data = localStorage.getItem(STORAGE_KEYS.DEVICES);
  return data ? JSON.parse(data) : [];
}

export function saveDevices(devices: Device[]): void {
  localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
}

export function getLendingRecords(): LendingRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.LENDING_RECORDS);
  return data ? JSON.parse(data) : [];
}

export function saveLendingRecords(records: LendingRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.LENDING_RECORDS, JSON.stringify(records));
}

export function getCompensations(): Compensation[] {
  const data = localStorage.getItem(STORAGE_KEYS.COMPENSATIONS);
  return data ? JSON.parse(data) : [];
}

export function saveCompensations(compensations: Compensation[]): void {
  localStorage.setItem(STORAGE_KEYS.COMPENSATIONS, JSON.stringify(compensations));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
