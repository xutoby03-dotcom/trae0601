import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CommunityItem,
  BorrowRecord,
  DamageRecord,
  ItemStatus,
  FragilityLevel,
  CleaningStats,
} from '../types/communityItem';
import { generateId } from '../utils/format';
import { mockRoommates } from '../data/mockData';

const STORAGE_KEY_ITEMS = 'community-items-v1';

const initialItems: CommunityItem[] = [
  {
    id: 'item_1',
    name: '极米投影仪',
    photoUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop',
    purchaser: '张三',
    price: 3999,
    purchaseDate: '2025-09-15',
    storageLocation: '客厅电视柜抽屉',
    usageRules: '1. 使用前请确认镜头无灰尘；2. 观影时避免饮料靠近；3. 关机后等待散热再收纳；4. 每周六晚为集体观影时间，优先使用',
    fragility: 'high',
    status: 'available',
    totalUsageCount: 15,
    lastUsedAt: '2026-06-08T22:00:00Z',
    createdAt: '2025-09-15T10:00:00Z',
  },
  {
    id: 'item_2',
    name: '美的空气炸锅',
    photoUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
    purchaser: '李四',
    price: 499,
    purchaseDate: '2025-11-20',
    storageLocation: '厨房操作台旁',
    usageRules: '1. 使用前在炸篮铺油纸；2. 每次使用后清理炸篮和接油盘；3. 严禁放入塑料、纸质容器；4. 最大容量不超过2/3',
    fragility: 'low',
    status: 'in_use',
    currentBorrower: '王五',
    currentBorrowId: 'borrow_999',
    totalUsageCount: 42,
    lastUsedAt: '2026-06-10T19:30:00Z',
    createdAt: '2025-11-20T10:00:00Z',
  },
  {
    id: 'item_3',
    name: '桌游套装（卡坦岛+狼人杀）',
    photoUrl: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400&h=300&fit=crop',
    purchaser: '王五',
    price: 350,
    purchaseDate: '2025-08-01',
    storageLocation: '客厅书架第二层',
    usageRules: '1. 轻拿轻放，避免卡牌折叠；2. 使用后清点所有配件；3. 食物饮料远离游戏区；4. 如有丢失卡牌请及时报备',
    fragility: 'medium',
    status: 'needs_cleaning',
    totalUsageCount: 28,
    lastUsedAt: '2026-06-09T23:00:00Z',
    createdAt: '2025-08-01T10:00:00Z',
  },
  {
    id: 'item_4',
    name: 'Switch 游戏机',
    photoUrl: 'https://images.unsplash.com/photo-1585184394271-4c0a47dc59c9?w=400&h=300&fit=crop',
    purchaser: '赵六',
    price: 2200,
    purchaseDate: '2025-06-10',
    storageLocation: '客厅电视柜第二层',
    usageRules: '1.  Joy-Con 请勿用力甩动；2. 游戏卡带使用后放回盒中；3. 主机电量低于20%请及时充电；4. 多人游戏请提前预约时段',
    fragility: 'medium',
    status: 'needs_repair',
    totalUsageCount: 56,
    lastUsedAt: '2026-06-05T21:00:00Z',
    createdAt: '2025-06-10T10:00:00Z',
  },
];

const initialBorrows: BorrowRecord[] = [
  {
    id: 'borrow_999',
    itemId: 'item_2',
    borrower: '王五',
    startTime: '2026-06-11T17:00:00Z',
    endTime: '2026-06-11T20:00:00Z',
    purpose: '晚餐做炸鸡',
    returned: false,
    cleanedOnReturn: false,
    undamagedOnReturn: false,
  },
  {
    id: 'borrow_1',
    itemId: 'item_3',
    borrower: '赵六',
    startTime: '2026-06-09T19:00:00Z',
    endTime: '2026-06-09T23:00:00Z',
    purpose: '周末朋友聚会',
    returned: true,
    returnTime: '2026-06-09T23:30:00Z',
    cleanedOnReturn: false,
    undamagedOnReturn: true,
    returnNote: '桌上有些零食碎屑，需要清理',
  },
  {
    id: 'borrow_2',
    itemId: 'item_1',
    borrower: '李四',
    startTime: '2026-06-08T19:00:00Z',
    endTime: '2026-06-08T22:00:00Z',
    purpose: '看电影',
    returned: true,
    returnTime: '2026-06-08T22:30:00Z',
    cleanedOnReturn: true,
    undamagedOnReturn: true,
  },
];

const initialDamages: DamageRecord[] = [
  {
    id: 'damage_1',
    itemId: 'item_4',
    reporter: '赵六',
    responsiblePerson: '李四',
    description: '左侧 Joy-Con 摇杆漂移，操作不灵敏',
    reportedAt: '2026-06-06T10:00:00Z',
    compensationPlan: '购买第三方摇杆维修服务，约150元，李四全额承担',
    compensationAmount: 150,
    settled: false,
  },
];

interface CommunityItemStore {
  items: CommunityItem[];
  borrowRecords: BorrowRecord[];
  damageRecords: DamageRecord[];

  addItem: (
    data: Omit<CommunityItem, 'id' | 'createdAt' | 'status' | 'totalUsageCount'>
  ) => void;
  updateItem: (id: string, data: Partial<CommunityItem>) => void;
  deleteItem: (id: string) => void;

  borrowItem: (
    itemId: string,
    data: Omit<BorrowRecord, 'id' | 'itemId' | 'returned' | 'cleanedOnReturn' | 'undamagedOnReturn'>
  ) => void;
  returnItem: (
    borrowId: string,
    data: { cleanedOnReturn: boolean; undamagedOnReturn: boolean; returnNote?: string }
  ) => void;
  markCleaned: (itemId: string) => void;

  addDamageRecord: (
    itemId: string,
    data: Omit<DamageRecord, 'id' | 'itemId' | 'reportedAt' | 'settled'>
  ) => void;
  settleDamage: (damageId: string, note?: string) => void;

  getUnsettledCompensationTotal: () => number;
  getCleaningStats: () => CleaningStats[];
  getItemById: (id: string) => CommunityItem | undefined;
  getBorrowsByItem: (itemId: string) => BorrowRecord[];
  getDamagesByItem: (itemId: string) => DamageRecord[];
}

export const useCommunityItemStore = create<CommunityItemStore>()(
  persist(
    (set, get) => ({
      items: initialItems,
      borrowRecords: initialBorrows,
      damageRecords: initialDamages,

      addItem: (data) =>
        set((state) => ({
          items: [
            {
              ...data,
              id: generateId('item_'),
              createdAt: new Date().toISOString(),
              status: 'available',
              totalUsageCount: 0,
            },
            ...state.items,
          ],
        })),

      updateItem: (id, data) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...data } : item
          ),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
          borrowRecords: state.borrowRecords.filter((b) => b.itemId !== id),
          damageRecords: state.damageRecords.filter((d) => d.itemId !== id),
        })),

      borrowItem: (itemId, data) => {
        const borrowId = generateId('borrow_');
        set((state) => ({
          borrowRecords: [
            {
              ...data,
              id: borrowId,
              itemId,
              returned: false,
              cleanedOnReturn: false,
              undamagedOnReturn: false,
            },
            ...state.borrowRecords,
          ],
          items: state.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: 'in_use' as ItemStatus,
                  currentBorrower: data.borrower,
                  currentBorrowId: borrowId,
                }
              : item
          ),
        }));
      },

      returnItem: (borrowId, data) =>
        set((state) => {
          const borrow = state.borrowRecords.find((b) => b.id === borrowId);
          if (!borrow) return state;

          const newStatus: ItemStatus = data.cleanedOnReturn
            ? 'available'
            : 'needs_cleaning';

          return {
            borrowRecords: state.borrowRecords.map((b) =>
              b.id === borrowId
                ? {
                    ...b,
                    returned: true,
                    returnTime: new Date().toISOString(),
                    cleanedOnReturn: data.cleanedOnReturn,
                    undamagedOnReturn: data.undamagedOnReturn,
                    returnNote: data.returnNote,
                  }
                : b
            ),
            items: state.items.map((item) =>
              item.id === borrow.itemId
                ? {
                    ...item,
                    status: newStatus,
                    currentBorrower: undefined,
                    currentBorrowId: undefined,
                    totalUsageCount: item.totalUsageCount + 1,
                    lastUsedAt: new Date().toISOString(),
                  }
                : item
            ),
          };
        }),

      markCleaned: (itemId) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, status: 'available' as ItemStatus } : item
          ),
        })),

      addDamageRecord: (itemId, data) =>
        set((state) => ({
          damageRecords: [
            {
              ...data,
              id: generateId('damage_'),
              itemId,
              reportedAt: new Date().toISOString(),
              settled: false,
            },
            ...state.damageRecords,
          ],
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, status: 'needs_repair' as ItemStatus } : item
          ),
        })),

      settleDamage: (damageId, note) =>
        set((state) => {
          const damage = state.damageRecords.find((d) => d.id === damageId);
          if (!damage) return state;

          const itemHasUnsettled = state.damageRecords.some(
            (d) => d.itemId === damage.itemId && d.id !== damageId && !d.settled
          );

          return {
            damageRecords: state.damageRecords.map((d) =>
              d.id === damageId
                ? {
                    ...d,
                    settled: true,
                    settledAt: new Date().toISOString(),
                    settledNote: note,
                  }
                : d
            ),
            items: itemHasUnsettled
              ? state.items
              : state.items.map((item) =>
                  item.id === damage.itemId
                    ? { ...item, status: 'available' as ItemStatus }
                    : item
                ),
          };
        }),

      getUnsettledCompensationTotal: () => {
        const { damageRecords } = get();
        return damageRecords
          .filter((d) => !d.settled)
          .reduce((sum, d) => sum + d.compensationAmount, 0);
      },

      getCleaningStats: () => {
        const { borrowRecords } = get();
        const statsMap: Record<string, { total: number; uncleaned: number }> = {};

        borrowRecords
          .filter((b) => b.returned)
          .forEach((b) => {
            if (!statsMap[b.borrower]) {
              statsMap[b.borrower] = { total: 0, uncleaned: 0 };
            }
            statsMap[b.borrower].total += 1;
            if (!b.cleanedOnReturn) {
              statsMap[b.borrower].uncleaned += 1;
            }
          });

        return Object.entries(statsMap).map(([person, data]) => ({
          person,
          totalReturns: data.total,
          uncleanedReturns: data.uncleaned,
          uncleanedRate: data.total > 0 ? data.uncleaned / data.total : 0,
        }));
      },

      getItemById: (id) => get().items.find((i) => i.id === id),
      getBorrowsByItem: (itemId) =>
        get().borrowRecords.filter((b) => b.itemId === itemId),
      getDamagesByItem: (itemId) =>
        get().damageRecords.filter((d) => d.itemId === itemId),
    }),
    {
      name: STORAGE_KEY_ITEMS,
      partialize: (state) => ({
        items: state.items,
        borrowRecords: state.borrowRecords,
        damageRecords: state.damageRecords,
      }),
    }
  )
);

export const statusLabels: Record<ItemStatus, { label: string; color: string; bg: string }> = {
  available: { label: '可用', color: 'text-primary-700', bg: 'bg-primary-100' },
  in_use: { label: '使用中', color: 'text-info-700', bg: 'bg-info-100' },
  needs_cleaning: { label: '待清洁', color: 'text-warning-700', bg: 'bg-warning-100' },
  needs_repair: { label: '待赔付', color: 'text-danger-700', bg: 'bg-danger-100' },
};

export const fragilityLabels: Record<FragilityLevel, { label: string; color: string }> = {
  low: { label: '不易损', color: 'text-primary-600' },
  medium: { label: '一般', color: 'text-warning-600' },
  high: { label: '易损', color: 'text-danger-600' },
};

export const roommates = mockRoommates;
