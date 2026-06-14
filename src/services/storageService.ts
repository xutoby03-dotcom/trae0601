import { Inspection, Notification, RecheckRecord } from '@/types';
import { mockInspections, mockNotifications, mockRecheckRecords } from '@/data/mockData';

const INSPECTIONS_KEY = 'corridor_inspections';
const NOTIFICATIONS_KEY = 'corridor_notifications';
const RECHECK_RECORDS_KEY = 'corridor_recheck_records';
const INITIALIZED_KEY = 'corridor_initialized';

function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export function initializeStorage(): void {
  if (!localStorage.getItem(INITIALIZED_KEY)) {
    saveToStorage(INSPECTIONS_KEY, mockInspections);
    saveToStorage(NOTIFICATIONS_KEY, mockNotifications);
    saveToStorage(RECHECK_RECORDS_KEY, mockRecheckRecords);
    localStorage.setItem(INITIALIZED_KEY, 'true');
  }
}

export function getInspections(): Inspection[] {
  return getFromStorage<Inspection[]>(INSPECTIONS_KEY, []);
}

export function saveInspections(inspections: Inspection[]): void {
  saveToStorage(INSPECTIONS_KEY, inspections);
}

export function getInspectionById(id: string): Inspection | undefined {
  const inspections = getInspections();
  return inspections.find((i) => i.id === id);
}

export function addInspection(inspection: Inspection): void {
  const inspections = getInspections();
  inspections.unshift(inspection);
  saveInspections(inspections);
}

export function updateInspection(id: string, updates: Partial<Inspection>): void {
  const inspections = getInspections();
  const index = inspections.findIndex((i) => i.id === id);
  if (index !== -1) {
    inspections[index] = { ...inspections[index], ...updates, updatedAt: new Date().toISOString() };
    saveInspections(inspections);
  }
}

export function deleteInspection(id: string): void {
  const inspections = getInspections();
  const filtered = inspections.filter((i) => i.id !== id);
  saveInspections(filtered);
}

export function getNotifications(): Notification[] {
  return getFromStorage<Notification[]>(NOTIFICATIONS_KEY, []);
}

export function saveNotifications(notifications: Notification[]): void {
  saveToStorage(NOTIFICATIONS_KEY, notifications);
}

export function getNotificationsByInspectionId(inspectionId: string): Notification[] {
  const notifications = getNotifications();
  return notifications.filter((n) => n.inspectionId === inspectionId);
}

export function addNotification(notification: Notification): void {
  const notifications = getNotifications();
  notifications.unshift(notification);
  saveNotifications(notifications);
}

export function updateNotification(id: string, updates: Partial<Notification>): void {
  const notifications = getNotifications();
  const index = notifications.findIndex((n) => n.id === id);
  if (index !== -1) {
    notifications[index] = { ...notifications[index], ...updates };
    saveNotifications(notifications);
  }
}

export function getRecheckRecords(): RecheckRecord[] {
  return getFromStorage<RecheckRecord[]>(RECHECK_RECORDS_KEY, []);
}

export function addRecheckRecord(record: RecheckRecord): void {
  const records = getRecheckRecords();
  records.unshift(record);
  saveToStorage(RECHECK_RECORDS_KEY, records);
}

export function getRecheckRecordsByInspectionId(inspectionId: string): RecheckRecord[] {
  const records = getRecheckRecords();
  return records.filter((r) => r.inspectionId === inspectionId);
}

export function resetStorage(): void {
  localStorage.removeItem(INSPECTIONS_KEY);
  localStorage.removeItem(NOTIFICATIONS_KEY);
  localStorage.removeItem(RECHECK_RECORDS_KEY);
  localStorage.removeItem(INITIALIZED_KEY);
  initializeStorage();
}
