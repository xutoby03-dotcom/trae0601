import Dexie, { Table } from 'dexie';
import type {
  Furniture,
  DailyRecord,
  Incident,
  WeatherInfo,
  User,
  Reminder
} from '@/types';

export class AppDatabase extends Dexie {
  furniture!: Table<Furniture>;
  dailyRecords!: Table<DailyRecord>;
  incidents!: Table<Incident>;
  weatherInfo!: Table<WeatherInfo>;
  users!: Table<User>;
  reminders!: Table<Reminder>;

  constructor() {
    super('AppDatabase');
    this.version(1).stores({
      furniture: 'id, code, area, type, material, status, purchaseDate, createdAt',
      dailyRecords: 'id, recordDate, openUserId, status, createdAt',
      incidents: 'id, furnitureId, dailyRecordId, type, severity, status, reporterId, handlerId, reportTime, createdAt',
      weatherInfo: 'id, recordDate, condition, hasAlert, alertType, alertLevel, createdAt',
      users: 'id, username, role, isActive, createdAt',
      reminders: 'id, type, triggerTime, isRead, createdAt'
    });
  }
}

export const db = new AppDatabase();

export type { Table };

export {
  Furniture,
  DailyRecord,
  Incident,
  WeatherInfo,
  User,
  Reminder
};
