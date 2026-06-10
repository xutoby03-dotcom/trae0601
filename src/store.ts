import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  FreezerItem,
  ConsumedRecord,
  FreezerLayout,
  DEFAULT_LAYOUT,
  FreezerPosition,
  Category,
} from './types';
import { addDays, differenceInDays, parseISO, isBefore } from 'date-fns';

interface FreezerState {
  items: FreezerItem[];
  records: ConsumedRecord[];
  layout: FreezerLayout;
  toEatList: string[];
  addItem: (item: Omit<FreezerItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<FreezerItem>) => void;
  deleteItem: (id: string, reason?: string) => void;
  consumeQuantity: (id: string, qty: number, note?: string) => void;
  movePosition: (id: string, newPosition: FreezerPosition) => void;
  markExpired: (id: string) => void;
  addToEatList: (itemId: string) => void;
  removeFromEatList: (itemId: string) => void;
  setLayout: (layout: FreezerLayout) => void;
  clearExpiredItems: () => void;
  getExpiringItems: (days?: number) => FreezerItem[];
  getItemsByPosition: (drawer: number, cell: number) => FreezerItem[];
  getItemsByCategory: (category: Category) => FreezerItem[];
  searchItemsByName: (query: string) => FreezerItem[];
}

const generateId = () => Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

const createSampleData = (): { items: FreezerItem[]; records: ConsumedRecord[] } => {
  const today = new Date();
  const items: FreezerItem[] = [
    {
      id: generateId(),
      name: '鸡胸肉',
      category: 'meat',
      quantity: 2,
      unit: '袋',
      purchaseDate: addDays(today, -10).toISOString().split('T')[0],
      expiryDate: addDays(today, 50).toISOString().split('T')[0],
      position: { drawer: 0, cell: 0 },
      isPackaged: true,
      isOpened: false,
      price: 35,
      createdAt: addDays(today, -10).toISOString(),
      updatedAt: addDays(today, -10).toISOString(),
    },
    {
      id: generateId(),
      name: '牛肉卷',
      category: 'meat',
      quantity: 3,
      unit: '盒',
      purchaseDate: addDays(today, -5).toISOString().split('T')[0],
      expiryDate: addDays(today, 80).toISOString().split('T')[0],
      position: { drawer: 0, cell: 1 },
      isPackaged: true,
      isOpened: false,
      price: 78,
      createdAt: addDays(today, -5).toISOString(),
      updatedAt: addDays(today, -5).toISOString(),
    },
    {
      id: generateId(),
      name: '五花肉',
      category: 'meat',
      quantity: 1,
      unit: '块',
      purchaseDate: addDays(today, -20).toISOString().split('T')[0],
      expiryDate: addDays(today, 3).toISOString().split('T')[0],
      position: { drawer: 0, cell: 2 },
      isPackaged: true,
      isOpened: true,
      price: 42,
      note: '已切好块',
      createdAt: addDays(today, -20).toISOString(),
      updatedAt: addDays(today, -8).toISOString(),
    },
    {
      id: generateId(),
      name: '牛排',
      category: 'meat',
      quantity: 4,
      unit: '块',
      purchaseDate: addDays(today, -15).toISOString().split('T')[0],
      expiryDate: addDays(today, 100).toISOString().split('T')[0],
      position: { drawer: 0, cell: 3 },
      isPackaged: true,
      isOpened: false,
      price: 128,
      createdAt: addDays(today, -15).toISOString(),
      updatedAt: addDays(today, -15).toISOString(),
    },
    {
      id: generateId(),
      name: '猪肉水饺',
      category: 'staple',
      quantity: 2,
      unit: '袋',
      purchaseDate: addDays(today, -7).toISOString().split('T')[0],
      expiryDate: addDays(today, 150).toISOString().split('T')[0],
      position: { drawer: 1, cell: 0 },
      isPackaged: true,
      isOpened: false,
      price: 48,
      createdAt: addDays(today, -7).toISOString(),
      updatedAt: addDays(today, -7).toISOString(),
    },
    {
      id: generateId(),
      name: '虾仁三鲜饺',
      category: 'staple',
      quantity: 1,
      unit: '袋',
      purchaseDate: addDays(today, -3).toISOString().split('T')[0],
      expiryDate: addDays(today, 170).toISOString().split('T')[0],
      position: { drawer: 1, cell: 1 },
      isPackaged: true,
      isOpened: false,
      price: 56,
      createdAt: addDays(today, -3).toISOString(),
      updatedAt: addDays(today, -3).toISOString(),
    },
    {
      id: generateId(),
      name: '小笼包',
      category: 'staple',
      quantity: 3,
      unit: '袋',
      purchaseDate: addDays(today, -12).toISOString().split('T')[0],
      expiryDate: addDays(today, 2).toISOString().split('T')[0],
      position: { drawer: 1, cell: 2 },
      isPackaged: true,
      isOpened: true,
      price: 66,
      note: '快过期了尽快吃',
      createdAt: addDays(today, -12).toISOString(),
      updatedAt: addDays(today, -4).toISOString(),
    },
    {
      id: generateId(),
      name: '手抓饼',
      category: 'staple',
      quantity: 20,
      unit: '片',
      purchaseDate: addDays(today, -25).toISOString().split('T')[0],
      expiryDate: addDays(today, 120).toISOString().split('T')[0],
      position: { drawer: 1, cell: 3 },
      isPackaged: true,
      isOpened: false,
      price: 38,
      createdAt: addDays(today, -25).toISOString(),
      updatedAt: addDays(today, -25).toISOString(),
    },
    {
      id: generateId(),
      name: '西兰花',
      category: 'vegetable',
      quantity: 2,
      unit: '袋',
      purchaseDate: addDays(today, -4).toISOString().split('T')[0],
      expiryDate: addDays(today, 25).toISOString().split('T')[0],
      position: { drawer: 2, cell: 0 },
      isPackaged: true,
      isOpened: false,
      price: 18,
      createdAt: addDays(today, -4).toISOString(),
      updatedAt: addDays(today, -4).toISOString(),
    },
    {
      id: generateId(),
      name: '玉米粒',
      category: 'vegetable',
      quantity: 3,
      unit: '袋',
      purchaseDate: addDays(today, -18).toISOString().split('T')[0],
      expiryDate: addDays(today, 60).toISOString().split('T')[0],
      position: { drawer: 2, cell: 1 },
      isPackaged: true,
      isOpened: true,
      price: 24,
      createdAt: addDays(today, -18).toISOString(),
      updatedAt: addDays(today, -6).toISOString(),
    },
    {
      id: generateId(),
      name: '青豆',
      category: 'vegetable',
      quantity: 1,
      unit: '袋',
      purchaseDate: addDays(today, -8).toISOString().split('T')[0],
      expiryDate: addDays(today, 80).toISOString().split('T')[0],
      position: { drawer: 2, cell: 2 },
      isPackaged: true,
      isOpened: false,
      price: 12,
      createdAt: addDays(today, -8).toISOString(),
      updatedAt: addDays(today, -8).toISOString(),
    },
    {
      id: generateId(),
      name: '冻虾仁',
      category: 'seafood',
      quantity: 2,
      unit: '袋',
      purchaseDate: addDays(today, -6).toISOString().split('T')[0],
      expiryDate: addDays(today, 70).toISOString().split('T')[0],
      position: { drawer: 3, cell: 0 },
      isPackaged: true,
      isOpened: false,
      price: 88,
      createdAt: addDays(today, -6).toISOString(),
      updatedAt: addDays(today, -6).toISOString(),
    },
    {
      id: generateId(),
      name: '带鱼段',
      category: 'seafood',
      quantity: 1,
      unit: '袋',
      purchaseDate: addDays(today, -14).toISOString().split('T')[0],
      expiryDate: addDays(today, 1).toISOString().split('T')[0],
      position: { drawer: 3, cell: 1 },
      isPackaged: true,
      isOpened: false,
      price: 45,
      note: '明天到期！',
      createdAt: addDays(today, -14).toISOString(),
      updatedAt: addDays(today, -14).toISOString(),
    },
    {
      id: generateId(),
      name: '芝士焗虾仁',
      category: 'dessert',
      quantity: 6,
      unit: '个',
      purchaseDate: addDays(today, -2).toISOString().split('T')[0],
      expiryDate: addDays(today, 90).toISOString().split('T')[0],
      position: { drawer: 3, cell: 2 },
      isPackaged: true,
      isOpened: false,
      price: 72,
      createdAt: addDays(today, -2).toISOString(),
      updatedAt: addDays(today, -2).toISOString(),
    },
    {
      id: generateId(),
      name: '蛋挞皮',
      category: 'dessert',
      quantity: 30,
      unit: '个',
      purchaseDate: addDays(today, -30).toISOString().split('T')[0],
      expiryDate: addDays(today, -5).toISOString().split('T')[0],
      position: { drawer: 3, cell: 3 },
      isPackaged: true,
      isOpened: true,
      price: 30,
      note: '已经过期',
      createdAt: addDays(today, -30).toISOString(),
      updatedAt: addDays(today, -15).toISOString(),
    },
  ];

  return { items, records: [] };
};

export const useFreezerStore = create<FreezerState>()(
  persist(
    (set, get) => {
      const sample = createSampleData();
      return {
        items: sample.items,
        records: sample.records,
        layout: DEFAULT_LAYOUT,
        toEatList: [],

        addItem: (item) => {
          const now = new Date().toISOString();
          const newItem: FreezerItem = {
            ...item,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          };
          set((state) => ({ items: [...state.items, newItem] }));
        },

        updateItem: (id, updates) => {
          set((state) => ({
            items: state.items.map((it) =>
              it.id === id ? { ...it, ...updates, updatedAt: new Date().toISOString() } : it
            ),
          }));
        },

        deleteItem: (id, reason) => {
          const item = get().items.find((i) => i.id === id);
          if (!item) return;
          const record: ConsumedRecord = {
            id: generateId(),
            itemId: id,
            itemName: item.name,
            quantity: item.quantity,
            unit: item.unit,
            consumedAt: new Date().toISOString(),
            reason: reason === 'expired' ? 'expired' : 'used',
            note: reason,
          };
          set((state) => ({
            items: state.items.filter((i) => i.id !== id),
            records: [...state.records, record],
            toEatList: state.toEatList.filter((tid) => tid !== id),
          }));
        },

        consumeQuantity: (id, qty, note) => {
          const item = get().items.find((i) => i.id === id);
          if (!item || qty <= 0) return;

          const actualQty = Math.min(qty, item.quantity);
          const record: ConsumedRecord = {
            id: generateId(),
            itemId: id,
            itemName: item.name,
            quantity: actualQty,
            unit: item.unit,
            consumedAt: new Date().toISOString(),
            reason: 'used',
            note,
          };

          if (actualQty >= item.quantity) {
            set((state) => ({
              items: state.items.filter((i) => i.id !== id),
              records: [...state.records, record],
              toEatList: state.toEatList.filter((tid) => tid !== id),
            }));
          } else {
            set((state) => ({
              items: state.items.map((it) =>
                it.id === id
                  ? { ...it, quantity: it.quantity - actualQty, updatedAt: new Date().toISOString() }
                  : it
              ),
              records: [...state.records, record],
            }));
          }
        },

        movePosition: (id, newPosition) => {
          const item = get().items.find((i) => i.id === id);
          if (!item) return;
          const record: ConsumedRecord = {
            id: generateId(),
            itemId: id,
            itemName: item.name,
            quantity: 0,
            unit: item.unit,
            consumedAt: new Date().toISOString(),
            reason: 'moved',
            note: `从第${item.position.drawer + 1}层第${item.position.cell + 1}格移到第${newPosition.drawer + 1}层第${newPosition.cell + 1}格`,
          };
          set((state) => ({
            items: state.items.map((it) =>
              it.id === id ? { ...it, position: newPosition, updatedAt: new Date().toISOString() } : it
            ),
            records: [...state.records, record],
          }));
        },

        markExpired: (id) => {
          get().deleteItem(id, 'expired');
        },

        addToEatList: (itemId) => {
          set((state) => ({
            toEatList: state.toEatList.includes(itemId)
              ? state.toEatList
              : [...state.toEatList, itemId],
          }));
        },

        removeFromEatList: (itemId) => {
          set((state) => ({
            toEatList: state.toEatList.filter((id) => id !== itemId),
          }));
        },

        setLayout: (layout) => set({ layout }),

        clearExpiredItems: () => {
          const state = get();
          const today = new Date();
          const expiredIds = state.items
            .filter((it) => isBefore(parseISO(it.expiryDate), today))
            .map((it) => it.id);
          expiredIds.forEach((id) => get().markExpired(id));
        },

        getExpiringItems: (days = 7) => {
          const today = new Date();
          const threshold = addDays(today, days);
          return get()
            .items.filter((it) => {
              const diff = differenceInDays(parseISO(it.expiryDate), today);
              return diff <= days;
            })
            .sort((a, b) => parseISO(a.expiryDate).getTime() - parseISO(b.expiryDate).getTime());
        },

        getItemsByPosition: (drawer, cell) => {
          return get().items.filter(
            (it) => it.position.drawer === drawer && it.position.cell === cell
          );
        },

        getItemsByCategory: (category) => {
          return get().items.filter((it) => it.category === category);
        },

        searchItemsByName: (query) => {
          const q = query.toLowerCase().trim();
          if (!q) return [];
          return get().items.filter(
            (it) =>
              it.name.toLowerCase().includes(q) ||
              (it.note && it.note.toLowerCase().includes(q))
          );
        },
      };
    },
    {
      name: 'freezer-inventory-storage',
    }
  )
);

export const getExpiryStatus = (expiryDate: string): 'expired' | 'urgent' | 'warning' | 'soon' | 'normal' => {
  const today = new Date();
  const diff = differenceInDays(parseISO(expiryDate), today);
  if (diff < 0) return 'expired';
  if (diff <= 2) return 'urgent';
  if (diff <= 7) return 'warning';
  if (diff <= 14) return 'soon';
  return 'normal';
};

export const getExpiryBadgeClass = (status: ReturnType<typeof getExpiryStatus>): string => {
  switch (status) {
    case 'expired':
      return 'bg-gray-500 text-white';
    case 'urgent':
      return 'bg-expiring-urgent text-white';
    case 'warning':
      return 'bg-expiring-warning text-white';
    case 'soon':
      return 'bg-expiring-soon text-gray-800';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};
