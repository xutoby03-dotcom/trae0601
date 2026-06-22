import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  WaxModel,
  WaxFormInput,
  WaxStatus,
  DefectType,
  RodPosition,
} from '@/types';
import { generateWaxId } from '@/utils/helpers';

interface WaxStore {
  items: WaxModel[];
  searchKeyword: string;
  defectFilter: 'all' | 'has' | 'none';
  rodFilter: RodPosition | 'all';
  addWaxModel: (input: WaxFormInput) => WaxModel;
  updateStatus: (id: string, newStatus: WaxStatus, note?: string) => void;
  markDefects: (
    id: string,
    defects: DefectType[],
    remakeReason?: string,
    resetToWaxing?: boolean,
  ) => void;
  clearDefects: (id: string) => void;
  removeWaxModel: (id: string) => void;
  setSearchKeyword: (kw: string) => void;
  setDefectFilter: (f: 'all' | 'has' | 'none') => void;
  setRodFilter: (f: RodPosition | 'all') => void;
  getFilteredItems: () => WaxModel[];
  getStatusCounts: () => Record<WaxStatus, number>;
}

function seedMockData(): WaxModel[] {
  const now = Date.now();
  const min = 60 * 1000;
  const h = 60 * min;

  const samples: Omit<WaxModel, 'id' | 'createdAt' | 'updatedAt' | 'history'>[] = [
    {
      orderNo: 'KH2026061801',
      ringSize: '14#',
      weight: 0.48,
      settingShape: 'round',
      stoneSize: '6.5mm',
      rodPosition: 'bottom',
      status: 'casting',
      defects: [],
    },
    {
      orderNo: 'KH2026061902',
      ringSize: '12#',
      weight: 0.36,
      settingShape: 'oval',
      stoneSize: '7×5mm',
      rodPosition: 'top_right',
      status: 'treeing',
      defects: [],
    },
    {
      orderNo: 'KH2026062003',
      ringSize: '16#',
      weight: 0.52,
      settingShape: 'emerald',
      stoneSize: '8×6mm',
      rodPosition: 'left',
      status: 'inspecting',
      defects: ['crack'],
      remakeReason: '内侧有细微裂纹需修补',
    },
    {
      orderNo: 'KH2026062004',
      ringSize: '13#',
      weight: 0.41,
      settingShape: 'pear',
      stoneSize: '8×5mm',
      rodPosition: 'bottom_left',
      status: 'inspecting',
      defects: [],
    },
    {
      orderNo: 'KH2026062105',
      ringSize: '15#',
      weight: 0.55,
      settingShape: 'heart',
      stoneSize: '7mm',
      rodPosition: 'top',
      status: 'waxing',
      defects: [],
    },
    {
      orderNo: 'KH2026062106',
      ringSize: '11#',
      weight: 0.33,
      settingShape: 'princess',
      stoneSize: '5.5mm',
      rodPosition: 'right',
      status: 'waxing',
      defects: ['unclear'],
      remakeReason: '编号刻字被蜡料覆盖',
    },
    {
      orderNo: 'KH2026062107',
      ringSize: '17#',
      weight: 0.62,
      settingShape: 'cushion',
      stoneSize: '7.5mm',
      rodPosition: 'top_left',
      status: 'waxing',
      defects: [],
    },
    {
      orderNo: 'KH2026062208',
      ringSize: '14#',
      weight: 0.46,
      settingShape: 'marquise',
      stoneSize: '9×4.5mm',
      rodPosition: 'bottom_right',
      status: 'inspecting',
      defects: ['deform'],
      remakeReason: '镶口轻微变形，需重做',
    },
  ];

  return samples.map((s, i) => {
    const createdAt = now - (8 - i) * 4 * h - i * 17 * min;
    let updatedAt = createdAt;
    const history = [{ status: 'waxing' as WaxStatus, timestamp: createdAt }];

    if (s.status !== 'waxing') {
      history.push({ status: s.status, timestamp: createdAt + 2 * h + i * min });
      updatedAt = createdAt + 2 * h + i * min;
    }

    return {
      ...s,
      id: generateWaxId(),
      createdAt,
      updatedAt,
      history,
    };
  });
}

export const useWaxStore = create<WaxStore>()(
  persist(
    (set, get) => ({
      items: [],
      searchKeyword: '',
      defectFilter: 'all',
      rodFilter: 'all',

      addWaxModel: (input) => {
        const now = Date.now();
        const newItem: WaxModel = {
          ...input,
          id: generateWaxId(),
          status: 'waxing',
          defects: [],
          createdAt: now,
          updatedAt: now,
          history: [{ status: 'waxing', timestamp: now }],
        };
        set((state) => ({ items: [newItem, ...state.items] }));
        return newItem;
      },

      updateStatus: (id, newStatus, note) => {
        const now = Date.now();
        set((state) => ({
          items: state.items.map((it) =>
            it.id === id
              ? {
                  ...it,
                  status: newStatus,
                  updatedAt: now,
                  history: [
                    ...it.history,
                    { status: newStatus, timestamp: now, note },
                  ],
                }
              : it,
          ),
        }));
      },

      markDefects: (id, defects, remakeReason, resetToWaxing = false) => {
        const now = Date.now();
        set((state) => ({
          items: state.items.map((it) => {
            if (it.id !== id) return it;
            const base = {
              ...it,
              defects,
              remakeReason: remakeReason || undefined,
              updatedAt: now,
            };
            if (resetToWaxing && it.status !== 'waxing') {
              return {
                ...base,
                status: 'waxing' as WaxStatus,
                history: [
                  ...it.history,
                  { status: 'waxing' as WaxStatus, timestamp: now, note: `返工: ${remakeReason || '缺陷修复'}` },
                ],
              };
            }
            return base;
          }),
        }));
      },

      clearDefects: (id) => {
        set((state) => ({
          items: state.items.map((it) =>
            it.id === id ? { ...it, defects: [], remakeReason: undefined } : it,
          ),
        }));
      },

      removeWaxModel: (id) => {
        set((state) => ({ items: state.items.filter((it) => it.id !== id) }));
      },

      setSearchKeyword: (kw) => set({ searchKeyword: kw }),
      setDefectFilter: (f) => set({ defectFilter: f }),
      setRodFilter: (f) => set({ rodFilter: f }),

      getFilteredItems: () => {
        const { items, searchKeyword, defectFilter, rodFilter } = get();
        const kw = searchKeyword.trim().toLowerCase();
        return items.filter((it) => {
          if (kw) {
            const matched =
              it.id.toLowerCase().includes(kw) ||
              it.orderNo.toLowerCase().includes(kw) ||
              it.ringSize.toLowerCase().includes(kw) ||
              it.stoneSize.toLowerCase().includes(kw);
            if (!matched) return false;
          }
          if (defectFilter === 'has' && it.defects.length === 0) return false;
          if (defectFilter === 'none' && it.defects.length > 0) return false;
          if (rodFilter !== 'all' && it.rodPosition !== rodFilter) return false;
          return true;
        });
      },

      getStatusCounts: () => {
        const { items } = get();
        const counts: Record<WaxStatus, number> = {
          waxing: 0,
          inspecting: 0,
          treeing: 0,
          casting: 0,
        };
        items.forEach((it) => {
          counts[it.status] += 1;
        });
        return counts;
      },
    }),
    {
      name: 'wax-model-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.items.length === 0) {
          state.items = seedMockData();
        }
      },
    },
  ),
);
