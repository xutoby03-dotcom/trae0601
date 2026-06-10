import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Toy, ToyStatus, ToyTag, RotationRecord, RotationAction } from '@/types';

interface ToyStore {
  toys: Toy[];
  records: RotationRecord[];
  addToy: (toy: Omit<Toy, 'id' | 'createdAt'>) => void;
  updateToy: (id: string, data: Partial<Toy>) => void;
  deleteToy: (id: string) => void;
  getToyById: (id: string) => Toy | undefined;
  getToysByStatus: (status: ToyStatus) => Toy[];
  getToysByTag: (tag: ToyTag) => Toy[];
  addRotationRecord: (toyId: string, action: RotationAction, note?: string) => void;
  getRecordsByToyId: (toyId: string) => RotationRecord[];
  getPlayCount: (toyId: string) => number;
  getLastPlayTime: (toyId: string) => string | null;
  changeToyStatus: (id: string, status: ToyStatus) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 10);

const mockToys: Toy[] = [
  {
    id: 'toy1',
    name: '乐高城市系列',
    ageRange: '6-8岁',
    category: '积木拼装',
    hasSmallParts: true,
    purchaseDate: '2025-03-15',
    storageBox: '蓝色大箱',
    photo: '',
    status: 'playing',
    isMissingParts: false,
    tags: ['parent-child', 'quiet'],
    createdAt: '2025-03-15T10:00:00Z',
  },
  {
    id: 'toy2',
    name: '毛绒小熊',
    ageRange: '2-3岁',
    category: '毛绒玩具',
    hasSmallParts: false,
    purchaseDate: '2024-12-01',
    storageBox: '粉色收纳箱',
    photo: '',
    status: 'stored',
    isMissingParts: false,
    tags: ['quiet'],
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'toy3',
    name: '轨道小火车',
    ageRange: '3-4岁',
    category: '汽车模型',
    hasSmallParts: true,
    purchaseDate: '2025-01-20',
    storageBox: '绿色收纳箱',
    photo: '',
    status: 'cleaning',
    isMissingParts: true,
    tags: ['rainy', 'parent-child'],
    createdAt: '2025-01-20T10:00:00Z',
  },
  {
    id: 'toy4',
    name: '儿童绘画套装',
    ageRange: '4-5岁',
    category: '绘画手工',
    hasSmallParts: false,
    purchaseDate: '2025-02-10',
    storageBox: '抽屉柜A',
    photo: '',
    status: 'giving',
    isMissingParts: false,
    tags: ['rainy', 'quiet'],
    createdAt: '2025-02-10T10:00:00Z',
  },
  {
    id: 'toy5',
    name: '芭比娃娃',
    ageRange: '5-6岁',
    category: '娃娃人偶',
    hasSmallParts: true,
    purchaseDate: '2024-09-15',
    storageBox: '粉色收纳箱',
    photo: '',
    status: 'playing',
    isMissingParts: false,
    tags: ['quiet'],
    createdAt: '2024-09-15T10:00:00Z',
  },
  {
    id: 'toy6',
    name: '拼图100片',
    ageRange: '5-6岁',
    category: '益智玩具',
    hasSmallParts: true,
    purchaseDate: '2025-04-05',
    storageBox: '蓝色大箱',
    photo: '',
    status: 'stored',
    isMissingParts: false,
    tags: ['rainy', 'quiet', 'parent-child'],
    createdAt: '2025-04-05T10:00:00Z',
  },
  {
    id: 'toy7',
    name: '沙滩玩具套装',
    ageRange: '3-4岁',
    category: '户外运动',
    hasSmallParts: false,
    purchaseDate: '2025-05-20',
    storageBox: '阳台收纳',
    photo: '',
    status: 'stored',
    isMissingParts: false,
    tags: [],
    createdAt: '2025-05-20T10:00:00Z',
  },
  {
    id: 'toy8',
    name: '电子琴玩具',
    ageRange: '2-3岁',
    category: '音乐玩具',
    hasSmallParts: false,
    purchaseDate: '2024-11-11',
    storageBox: '客厅柜子',
    photo: '',
    status: 'playing',
    isMissingParts: false,
    tags: ['parent-child'],
    createdAt: '2024-11-11T10:00:00Z',
  },
];

const mockRecords: RotationRecord[] = [
  { id: 'r1', toyId: 'toy1', action: 'take-out', timestamp: '2026-06-01T09:00:00Z', note: '周末拿出来玩' },
  { id: 'r2', toyId: 'toy1', action: 'put-back', timestamp: '2026-06-03T18:00:00Z' },
  { id: 'r3', toyId: 'toy1', action: 'take-out', timestamp: '2026-06-08T10:00:00Z' },
  { id: 'r4', toyId: 'toy5', action: 'take-out', timestamp: '2026-06-05T14:00:00Z' },
  { id: 'r5', toyId: 'toy8', action: 'take-out', timestamp: '2026-06-07T09:30:00Z' },
  { id: 'r6', toyId: 'toy2', action: 'take-out', timestamp: '2026-05-20T10:00:00Z' },
  { id: 'r7', toyId: 'toy2', action: 'put-back', timestamp: '2026-05-25T16:00:00Z' },
  { id: 'r8', toyId: 'toy3', action: 'take-out', timestamp: '2026-05-10T09:00:00Z' },
  { id: 'r9', toyId: 'toy3', action: 'put-back', timestamp: '2026-05-15T17:00:00Z', note: '缺了一个小零件' },
];

export const useToyStore = create<ToyStore>()(
  persist(
    (set, get) => ({
      toys: mockToys,
      records: mockRecords,

      addToy: (toy) =>
        set((state) => ({
          toys: [
            ...state.toys,
            {
              ...toy,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateToy: (id, data) =>
        set((state) => ({
          toys: state.toys.map((toy) =>
            toy.id === id ? { ...toy, ...data } : toy
          ),
        })),

      deleteToy: (id) =>
        set((state) => ({
          toys: state.toys.filter((toy) => toy.id !== id),
          records: state.records.filter((r) => r.toyId !== id),
        })),

      getToyById: (id) => {
        return get().toys.find((toy) => toy.id === id);
      },

      getToysByStatus: (status) => {
        return get().toys.filter((toy) => toy.status === status);
      },

      getToysByTag: (tag) => {
        return get().toys.filter((toy) => toy.tags.includes(tag));
      },

      addRotationRecord: (toyId, action, note) =>
        set((state) => ({
          records: [
            ...state.records,
            {
              id: generateId(),
              toyId,
              action,
              timestamp: new Date().toISOString(),
              note,
            },
          ],
        })),

      getRecordsByToyId: (toyId) => {
        return get()
          .records.filter((r) => r.toyId === toyId)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      },

      getPlayCount: (toyId) => {
        return get().records.filter(
          (r) => r.toyId === toyId && r.action === 'take-out'
        ).length;
      },

      getLastPlayTime: (toyId) => {
        const takeOutRecords = get()
          .records.filter((r) => r.toyId === toyId && r.action === 'take-out')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return takeOutRecords.length > 0 ? takeOutRecords[0].timestamp : null;
      },

      changeToyStatus: (id, status) =>
        set((state) => ({
          toys: state.toys.map((toy) =>
            toy.id === id ? { ...toy, status } : toy
          ),
        })),
    }),
    {
      name: 'toy-rotator-storage',
    }
  )
);
