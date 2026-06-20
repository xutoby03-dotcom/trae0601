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
import { computeBorrowStatus, computeItemStatus, generateId, isExpiringSoon, isLowStock } from '@/utils';
import { mockBoxes, mockBorrows, mockItems, mockReminders } from '@/data/mockData';

interface AppState {
  boxes: MedicineBox[];
  items: InventoryItem[];
  borrows: BorrowRecord[];
  reminders: Reminder[];

  addBox: (data: Omit<MedicineBox, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBox: (id: string, data: Partial<MedicineBox>) => void;
  deleteBox: (id: string) => void;

  addItem: (data: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'> & { status?: InventoryItem['status'] }) => void;
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
          status: data.status ?? 'normal',
          createdAt: now,
          updatedAt: now,
        };
        if (!data.status) {
          newItem.status = computeItemStatus(newItem);
        }
        set({ items: [...get().items, newItem] });
        get().refreshReminders();
      },
      updateItem: (id, data) => {
        set({
          items: get().items.map(i => {
            if (i.id !== id) return i;
            const updated = { ...i, ...data, updatedAt: dayjs().toISOString() };
            if (data.status === undefined) {
              updated.status = computeItemStatus(updated);
            }
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
        const { items, borrows, reminders: currentReminders } = get();
        const now = dayjs().toISOString();
        const keyOf = (relatedId: string, type: Reminder['type']) => relatedId + '|' + type;

        interface ExpectedReminder {
          key: string;
          type: Reminder['type'];
          relatedId: string;
          title: string;
          description: string;
          level: Reminder['level'];
        }

        const expected = new Map<string, ExpectedReminder>();

        items.forEach(item => {
          if (computeItemStatus(item) === 'expired') {
            const k = keyOf(item.id, 'expiry');
            expected.set(k, {
              key: k,
              type: 'expiry',
              relatedId: item.id,
              title: item.name + ' 已过期',
              description: '存放格: ' + item.storageCell + '，请及时更换过期物品',
              level: 'danger',
            });
          } else if (isExpiringSoon(item.expiryDate)) {
            const k = keyOf(item.id, 'expiry');
            expected.set(k, {
              key: k,
              type: 'expiry',
              relatedId: item.id,
              title: item.name + ' 即将过期',
              description: '存放格: ' + item.storageCell + '，请尽快处理',
              level: 'warning',
            });
          }

          if (item.status === 'damaged') {
            const k = keyOf(item.id, 'damage');
            expected.set(k, {
              key: k,
              type: 'damage',
              relatedId: item.id,
              title: item.name + ' 已破损',
              description: '存放格: ' + item.storageCell + '，请及时处理或更换',
              level: 'danger',
            });
          }

          if (isLowStock(item.quantity) && item.status !== 'damaged') {
            const k = keyOf(item.id, 'low-stock');
            expected.set(k, {
              key: k,
              type: 'low-stock',
              relatedId: item.id,
              title: item.name + ' 库存不足',
              description: '当前库存: ' + item.quantity + '，建议及时补货',
              level: item.quantity <= 2 ? 'danger' : 'warning',
            });
          }
        });

        borrows.forEach(record => {
          if (computeBorrowStatus(record) === 'overdue') {
            const k = keyOf(record.id, 'overdue-return');
            expected.set(k, {
              key: k,
              type: 'overdue-return',
              relatedId: record.id,
              title: record.residentName + ' 逾期未还',
              description: '物品: ' + record.itemName,
              level: 'danger',
            });
          }
        });

        const existingByKey = new Map<string, Reminder>();
        currentReminders.forEach(r => {
          existingByKey.set(keyOf(r.relatedId, r.type), r);
        });

        const result: Reminder[] = [];

        expected.forEach(exp => {
          const existing = existingByKey.get(exp.key);
          if (existing) {
            result.push({
              ...existing,
              title: exp.title,
              description: exp.description,
              level: exp.level,
            });
          } else {
            result.push({
              id: generateId(),
              type: exp.type,
              relatedId: exp.relatedId,
              title: exp.title,
              description: exp.description,
              level: exp.level,
              isRead: false,
              createdAt: now,
            });
          }
        });

        result.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

        set({ reminders: result });
      },
    }),
    { name: 'medicine-box-storage' }
  )
);
