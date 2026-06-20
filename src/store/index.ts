import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import type {
  BorrowRecord,
  CleanlinessStatus,
  InventoryItem,
  MedicineBox,
  Reminder,
} from '@/types';
import { computeBorrowStatus, computeItemStatus, generateId } from '@/utils';
import { mockBoxes, mockBorrows, mockItems, mockReminders } from '@/data/mockData';

interface AppState {
  boxes: MedicineBox[];
  items: InventoryItem[];
  borrows: BorrowRecord[];
  reminders: Reminder[];

  addBox: (data: Omit<MedicineBox, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBox: (id: string, data: Partial<MedicineBox>) => void;
  deleteBox: (id: string) => void;

  addItem: (data: Omit<InventoryItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, data: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;

  addBorrow: (data: Omit<BorrowRecord, 'id' | 'status' | 'actualReturnDate' | 'cleanlinessStatus' | 'createdAt'>) => void;
  returnBorrow: (id: string, cleanlinessStatus?: CleanlinessStatus) => void;

  addReminder: (data: Omit<Reminder, 'id' | 'createdAt'>) => void;
  markReminderRead: (id: string) => void;
  clearReadReminders: () => void;
  refreshReminders: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      boxes: mockBoxes,
      items: mockItems,
      borrows: mockBorrows,
      reminders: mockReminders,

      addBox: (data) => {
        const now = dayjs().toISOString();
        set({
          boxes: [
            ...get().boxes,
            { ...data, id: generateId(), createdAt: now, updatedAt: now },
          ],
        });
      },
      updateBox: (id, data) => {
        set({
          boxes: get().boxes.map(b =>
            b.id === id ? { ...b, ...data, updatedAt: dayjs().toISOString() } : b
          ),
        });
      },
      deleteBox: (id) => {
        set({
          boxes: get().boxes.filter(b => b.id !== id),
          items: get().items.filter(i => i.boxId !== id),
        });
      },

      addItem: (data) => {
        const now = dayjs().toISOString();
        const newItem: InventoryItem = {
          ...data,
          id: generateId(),
          status: 'normal',
          createdAt: now,
          updatedAt: now,
        };
        newItem.status = computeItemStatus(newItem);
        set({ items: [...get().items, newItem] });
        get().refreshReminders();
      },
      updateItem: (id, data) => {
        set({
          items: get().items.map(i => {
            if (i.id !== id) return i;
            const updated = { ...i, ...data, updatedAt: dayjs().toISOString() };
            updated.status = computeItemStatus(updated);
            return updated;
          }),
        });
        get().refreshReminders();
      },
      deleteItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
        get().refreshReminders();
      },

      addBorrow: (data) => {
        const now = dayjs().toISOString();
        const record: BorrowRecord = {
          ...data,
          id: generateId(),
          status: 'borrowing',
          actualReturnDate: null,
          cleanlinessStatus: null,
          createdAt: now,
        };
        record.status = computeBorrowStatus(record);
        set({ borrows: [...get().borrows, record] });

        const item = get().items.find(i => i.id === data.itemId);
        if (item) {
          get().updateItem(item.id, { quantity: Math.max(0, item.quantity - data.quantity) });
        }
      },
      returnBorrow: (id, cleanlinessStatus) => {
        const record = get().borrows.find(b => b.id === id);
        if (!record) return;

        set({
          borrows: get().borrows.map(b =>
            b.id === id
              ? {
                  ...b,
                  status: 'returned',
                  actualReturnDate: dayjs().format('YYYY-MM-DD'),
                  cleanlinessStatus: cleanlinessStatus ?? b.cleanlinessStatus,
                }
              : b
          ),
        });

        const item = get().items.find(i => i.id === record.itemId);
        if (item && cleanlinessStatus !== 'damaged') {
          get().updateItem(item.id, { quantity: item.quantity + record.quantity });
        }
        get().refreshReminders();
      },

      addReminder: (data) => {
        set({
          reminders: [
            { ...data, id: generateId(), createdAt: dayjs().toISOString() },
            ...get().reminders,
          ],
        });
      },
      markReminderRead: (id) => {
        set({
          reminders: get().reminders.map(r =>
            r.id === id ? { ...r, isRead: true } : r
          ),
        });
      },
      clearReadReminders: () => {
        set({ reminders: get().reminders.filter(r => !r.isRead) });
      },
      refreshReminders: () => {
        const { items, borrows } = get();
        const existingIds = new Set(get().reminders.map(r => r.relatedId + r.type));
        const now = dayjs().toISOString();
        const newReminders: Reminder[] = [];

        items.forEach(item => {
          if (computeItemStatus(item) === 'expired' && !existingIds.has(item.id + 'expiry')) {
            newReminders.push({
              id: generateId(),
              type: 'expiry',
              relatedId: item.id,
              title: item.name + ' 已过期',
              description: '存放格: ' + item.storageCell + '，请及时更换过期物品',
              level: 'danger',
              isRead: false,
              createdAt: now,
            });
          }
          if (item.status === 'damaged' && !existingIds.has(item.id + 'damage')) {
            newReminders.push({
              id: generateId(),
              type: 'damage',
              relatedId: item.id,
              title: item.name + ' 已破损',
              description: '存放格: ' + item.storageCell + '，请及时处理或更换',
              level: 'danger',
              isRead: false,
              createdAt: now,
            });
          }
        });

        borrows.forEach(record => {
          if (computeBorrowStatus(record) === 'overdue' && !existingIds.has(record.id + 'overdue-return')) {
            newReminders.push({
              id: generateId(),
              type: 'overdue-return',
              relatedId: record.id,
              title: record.residentName + ' 逾期未还',
              description: '物品: ' + record.itemName,
              level: 'danger',
              isRead: false,
              createdAt: now,
            });
          }
        });

        if (newReminders.length > 0) {
          set({ reminders: [...newReminders, ...get().reminders] });
        }
      },
    }),
    { name: 'medicine-box-storage' }
  )
);
