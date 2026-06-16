import { create } from 'zustand';
import { db } from '@/db';
import type { Reminder, ReminderType } from '@/types';
import { generateId } from '@/utils/id';

interface ReminderState {
  reminders: Reminder[];
  unreadReminders: Reminder[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

interface ReminderActions {
  fetchReminders: () => Promise<void>;
  fetchUnreadReminders: () => Promise<Reminder[]>;
  addReminder: (reminder: Omit<Reminder, 'id' | 'isRead' | 'createdAt'>) => Promise<Reminder>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  getRemindersByType: (type: ReminderType) => Reminder[];
  getRemindersByDate: (date: string) => Promise<Reminder[]>;
  createWeatherReminder: (alertType: string, alertLevel: string, relatedId?: string) => Promise<Reminder>;
  createTimerReminder: (title: string, content: string, triggerTime: string, relatedId?: string) => Promise<Reminder>;
  createPatrolReminder: (triggerTime: string) => Promise<Reminder>;
  clearError: () => void;
}

export type ReminderStore = ReminderState & ReminderActions;

const alertLevelText: Record<string, string> = {
  blue: '蓝色',
  yellow: '黄色',
  orange: '橙色',
  red: '红色',
};

const alertTypeText: Record<string, string> = {
  rain: '暴雨',
  wind: '大风',
  typhoon: '台风',
};

export const useReminderStore = create<ReminderStore>((set, get) => ({
  reminders: [],
  unreadReminders: [],
  unreadCount: 0,
  loading: false,
  error: null,

  fetchReminders: async () => {
    set({ loading: true, error: null });
    try {
      const reminders = await db.reminders.orderBy('createdAt').reverse().toArray();
      const unreadReminders = reminders.filter(r => !r.isRead);
      set({ 
        reminders, 
        unreadReminders, 
        unreadCount: unreadReminders.length,
        loading: false 
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取提醒列表失败', loading: false });
    }
  },

  fetchUnreadReminders: async () => {
    set({ loading: true, error: null });
    try {
      const unreadReminders = await db.reminders
        .filter(r => !r.isRead)
        .reverse()
        .sortBy('createdAt');
      
      set({ 
        unreadReminders, 
        unreadCount: unreadReminders.length,
        loading: false 
      });
      return unreadReminders;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '获取未读提醒失败', loading: false });
      throw error;
    }
  },

  addReminder: async (reminderData) => {
    set({ loading: true, error: null });
    try {
      const now = new Date().toISOString();
      const newReminder: Reminder = {
        ...reminderData,
        id: generateId('reminder'),
        isRead: false,
        createdAt: now,
      };
      await db.reminders.add(newReminder);
      
      const reminders = await db.reminders.orderBy('createdAt').reverse().toArray();
      const unreadReminders = reminders.filter(r => !r.isRead);
      set({ 
        reminders, 
        unreadReminders, 
        unreadCount: unreadReminders.length,
        loading: false 
      });
      return newReminder;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '添加提醒失败', loading: false });
      throw error;
    }
  },

  markAsRead: async (id) => {
    set({ loading: true, error: null });
    try {
      await db.reminders.update(id, { isRead: true });
      
      const reminders = await db.reminders.orderBy('createdAt').reverse().toArray();
      const unreadReminders = reminders.filter(r => !r.isRead);
      set({ 
        reminders, 
        unreadReminders, 
        unreadCount: unreadReminders.length,
        loading: false 
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '标记已读失败', loading: false });
      throw error;
    }
  },

  markAllAsRead: async () => {
    set({ loading: true, error: null });
    try {
      const unreadIds = get().unreadReminders.map(r => r.id);
      for (const id of unreadIds) {
        await db.reminders.update(id, { isRead: true });
      }
      
      const reminders = await db.reminders.orderBy('createdAt').reverse().toArray();
      set({ 
        reminders, 
        unreadReminders: [], 
        unreadCount: 0,
        loading: false 
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '标记全部已读失败', loading: false });
      throw error;
    }
  },

  deleteReminder: async (id) => {
    set({ loading: true, error: null });
    try {
      await db.reminders.delete(id);
      
      const reminders = await db.reminders.orderBy('createdAt').reverse().toArray();
      const unreadReminders = reminders.filter(r => !r.isRead);
      set({ 
        reminders, 
        unreadReminders, 
        unreadCount: unreadReminders.length,
        loading: false 
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '删除提醒失败', loading: false });
      throw error;
    }
  },

  getRemindersByType: (type) => {
    return get().reminders.filter(r => r.type === type);
  },

  getRemindersByDate: async (date) => {
    try {
      const startOfDay = `${date}T00:00:00.000Z`;
      const endOfDay = `${date}T23:59:59.999Z`;
      return await db.reminders
        .where('triggerTime')
        .between(startOfDay, endOfDay, true, true)
        .reverse()
        .toArray();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '查询提醒失败' });
      throw error;
    }
  },

  createWeatherReminder: async (alertType, alertLevel, relatedId) => {
    const levelText = alertLevelText[alertLevel] || alertLevel;
    const typeText = alertTypeText[alertType] || alertType;
    
    return await get().addReminder({
      type: 'weather',
      title: `${levelText}${typeText}预警`,
      content: `请注意，当前发布${levelText}${typeText}预警信号，请及时收摊并做好防护措施。`,
      triggerTime: new Date().toISOString(),
      relatedId,
    });
  },

  createTimerReminder: async (title, content, triggerTime, relatedId) => {
    return await get().addReminder({
      type: 'timer',
      title,
      content,
      triggerTime,
      relatedId,
    });
  },

  createPatrolReminder: async (triggerTime) => {
    return await get().addReminder({
      type: 'patrol',
      title: '巡查提醒',
      content: '请按时进行场地巡查，检查桌椅摆放和设施状态。',
      triggerTime,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
