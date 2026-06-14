import { create } from 'zustand';
import { ClothesRecord, Reminder, WeatherInfo, CollectFormData } from '../types';
import { storage } from '../utils/storage';
import { generateId, generateMockWeather, generateMockRecords } from '../utils/helpers';
import { STORAGE_KEYS } from '../data/constants';

interface AppState {
  records: ClothesRecord[];
  reminders: Reminder[];
  weather: WeatherInfo;
  isLoading: boolean;

  initStore: () => void;
  addRecord: (record: Omit<ClothesRecord, 'id' | 'status' | 'remindCount'>) => void;
  collectRecord: (id: string, data: CollectFormData) => void;
  deleteRecord: (id: string) => void;
  incrementRemindCount: (id: string) => void;
  addReminder: (type: Reminder['type'], message: string, recordId?: string) => void;
  markReminderAsRead: (id: string) => void;
  markAllRemindersAsRead: () => void;
  clearReminders: () => void;
  updateWeather: () => WeatherInfo;
  getUnreadReminders: () => Reminder[];
  getDryingRecords: () => ClothesRecord[];
  getRecordsByLocation: (locationId: string) => ClothesRecord[];
}

export const useStore = create<AppState>((set, get) => ({
  records: [],
  reminders: [],
  weather: {
    condition: 'sunny',
    temperature: 25,
    humidity: 60,
    forecast: '晴朗干燥，适合晾晒',
    icon: '☀️'
  },
  isLoading: true,

  initStore: () => {
    const savedRecords = storage.get<ClothesRecord[]>(STORAGE_KEYS.RECORDS, []);
    const savedReminders = storage.get<Reminder[]>(STORAGE_KEYS.REMINDERS, []);
    const savedWeather = storage.get<WeatherInfo | null>(STORAGE_KEYS.WEATHER, null);

    let records = savedRecords;
    if (records.length === 0) {
      records = generateMockRecords();
      storage.set(STORAGE_KEYS.RECORDS, records);
    }

    let weather = savedWeather;
    if (!weather) {
      weather = generateMockWeather();
      storage.set(STORAGE_KEYS.WEATHER, weather);
    }

    set({
      records,
      reminders: savedReminders,
      weather,
      isLoading: false
    });
  },

  addRecord: (recordData) => {
    const newRecord: ClothesRecord = {
      ...recordData,
      id: generateId(),
      status: 'drying',
      remindCount: 0
    };

    const updatedRecords = [...get().records, newRecord];
    set({ records: updatedRecords });
    storage.set(STORAGE_KEYS.RECORDS, updatedRecords);
  },

  collectRecord: (id: string, data: CollectFormData) => {
    const original = get().records.find(r => r.id === id);

    const updatedRecords = get().records.map(record => {
      if (record.id === id) {
        return {
          ...record,
          status: 'collected' as const,
          collectedAt: new Date().toISOString(),
          isDry: data.isDry,
          isDamp: data.isDamp,
          needsRedry: data.needsRedry,
          notes: data.notes
        };
      }
      return record;
    });

    let finalRecords = updatedRecords;

    if (data.needsRedry && original) {
      const newRecord: ClothesRecord = {
        id: generateId(),
        clothingType: original.clothingType,
        clothingTypeLabel: original.clothingTypeLabel,
        clothingTypeIcon: original.clothingTypeIcon,
        quantity: original.quantity,
        location: original.location,
        locationId: original.locationId,
        responsiblePerson: original.responsiblePerson,
        responsiblePersonId: original.responsiblePersonId,
        responsiblePersonAvatar: original.responsiblePersonAvatar,
        startTime: new Date().toISOString(),
        expectedDuration: original.expectedDuration,
        isThick: original.isThick,
        photoUrl: original.photoUrl,
        status: 'drying',
        remindCount: 0
      };
      finalRecords = [...finalRecords, newRecord];
    }

    set({ records: finalRecords });
    storage.set(STORAGE_KEYS.RECORDS, finalRecords);
  },

  deleteRecord: (id: string) => {
    const updatedRecords = get().records.filter(r => r.id !== id);
    set({ records: updatedRecords });
    storage.set(STORAGE_KEYS.RECORDS, updatedRecords);
  },

  incrementRemindCount: (id: string) => {
    const updatedRecords = get().records.map(record => {
      if (record.id === id) {
        return { ...record, remindCount: record.remindCount + 1 };
      }
      return record;
    });

    set({ records: updatedRecords });
    storage.set(STORAGE_KEYS.RECORDS, updatedRecords);
  },

  addReminder: (type, message, recordId) => {
    const newReminder: Reminder = {
      id: generateId(),
      type,
      recordId,
      triggeredAt: new Date().toISOString(),
      message,
      isRead: false
    };

    const updatedReminders = [newReminder, ...get().reminders].slice(0, 50);
    set({ reminders: updatedReminders });
    storage.set(STORAGE_KEYS.REMINDERS, updatedReminders);

    if (recordId) {
      get().incrementRemindCount(recordId);
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('晾衣提醒', { body: message, icon: '/favicon.svg' });
    }
  },

  markReminderAsRead: (id: string) => {
    const updatedReminders = get().reminders.map(r =>
      r.id === id ? { ...r, isRead: true } : r
    );
    set({ reminders: updatedReminders });
    storage.set(STORAGE_KEYS.REMINDERS, updatedReminders);
  },

  markAllRemindersAsRead: () => {
    const updatedReminders = get().reminders.map(r => ({ ...r, isRead: true }));
    set({ reminders: updatedReminders });
    storage.set(STORAGE_KEYS.REMINDERS, updatedReminders);
  },

  clearReminders: () => {
    set({ reminders: [] });
    storage.remove(STORAGE_KEYS.REMINDERS);
  },

  updateWeather: () => {
    const newWeather = generateMockWeather();
    set({ weather: newWeather });
    storage.set(STORAGE_KEYS.WEATHER, newWeather);
    return newWeather;
  },

  getUnreadReminders: () => {
    return get().reminders.filter(r => !r.isRead);
  },

  getDryingRecords: () => {
    return get().records.filter(r => r.status === 'drying');
  },

  getRecordsByLocation: (locationId: string) => {
    return get().records.filter(r => r.locationId === locationId && r.status === 'drying');
  }
}));

if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
