import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Reminder, ReminderType } from '@/types';
import { generateId, STORAGE_KEYS } from '@/utils/storage';

interface ReminderState {
  reminders: Reminder[];
  setReminders: (reminders: Reminder[]) => void;
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, data: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  dismissReminder: (id: string) => void;
  getReminderById: (id: string) => Reminder | undefined;
  getActiveReminders: () => Reminder[];
  getRemindersByType: (type: ReminderType) => Reminder[];
  refreshReminders: (newReminders: Reminder[]) => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],
      
      setReminders: (reminders) => set({ reminders }),
      
      addReminder: (reminderData) => {
        const newReminder: Reminder = {
          ...reminderData,
          id: generateId(),
        };
        set({ reminders: [...get().reminders, newReminder] });
      },
      
      updateReminder: (id, data) => {
        set({
          reminders: get().reminders.map(r =>
            r.id === id ? { ...r, ...data } : r
          ),
        });
      },
      
      deleteReminder: (id) => {
        set({ reminders: get().reminders.filter(r => r.id !== id) });
      },
      
      dismissReminder: (id) => {
        set({
          reminders: get().reminders.map(r =>
            r.id === id ? { ...r, dismissed: true } : r
          ),
        });
      },
      
      getReminderById: (id) => {
        return get().reminders.find(r => r.id === id);
      },
      
      getActiveReminders: () => {
        return get().reminders
          .filter(r => r.enabled && !r.dismissed)
          .sort((a, b) => {
            const typeOrder: Record<ReminderType, number> = {
              seat_expiry: 0,
              recheck: 1,
              child_growth: 2,
              winter_clothing: 3,
            };
            return typeOrder[a.type] - typeOrder[b.type];
          });
      },
      
      getRemindersByType: (type) => {
        return get().reminders
          .filter(r => r.type === type)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      
      refreshReminders: (newReminders) => {
        const existingActive = get().reminders.filter(r => r.enabled && !r.dismissed);
        const existingIds = new Set(existingActive.map(r => `${r.type}-${r.relatedId}`));
        
        const uniqueNew = newReminders.filter(r => 
          !existingIds.has(`${r.type}-${r.relatedId}`)
        );
        
        set({ reminders: [...get().reminders, ...uniqueNew] });
      },
    }),
    {
      name: STORAGE_KEYS.REMINDERS,
    }
  )
);
