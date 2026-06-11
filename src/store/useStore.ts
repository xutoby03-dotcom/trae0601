import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Clothing,
  Member,
  WashHistory,
  Washer,
} from "@/types";

const DEFAULT_MEMBERS: Member[] = [
  { id: "m1", name: "爸爸", avatar: "👨" },
  { id: "m2", name: "妈妈", avatar: "👩" },
  { id: "m3", name: "小明", avatar: "👦" },
  { id: "m4", name: "小红", avatar: "👧" },
];

const DEFAULT_CLOTHES: Clothing[] = [
  {
    id: "c1",
    name: "白色纯棉T恤",
    color: "白色",
    colorCategory: "light",
    material: "cotton",
    colorfast: false,
    suggestedTemp: 40,
    memberId: "m1",
    photoUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=white%20cotton%20tshirt%20on%20hanger%20white%20background%20product%20photo&image_size=square",
    category: "top",
    createdAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "c2",
    name: "黑色牛仔袜",
    color: "黑色",
    colorCategory: "dark",
    material: "cotton",
    colorfast: true,
    suggestedTemp: 30,
    memberId: "m1",
    photoUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pair%20of%20black%20cotton%20socks%20on%20white%20background%20product%20photo&image_size=square",
    category: "socks",
    createdAt: "2026-06-01T10:05:00.000Z",
  },
  {
    id: "c3",
    name: "羊毛针织衫",
    color: "灰色",
    colorCategory: "medium",
    material: "wool",
    colorfast: false,
    suggestedTemp: 20,
    memberId: "m2",
    photoUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gray%20wool%20knit%20sweater%20on%20hanger%20white%20background%20product%20photo&image_size=square",
    category: "top",
    createdAt: "2026-06-02T09:00:00.000Z",
  },
  {
    id: "c4",
    name: "蓝色浴巾",
    color: "蓝色",
    colorCategory: "medium",
    material: "towel",
    colorfast: false,
    suggestedTemp: 60,
    memberId: "m3",
    photoUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blue%20cotton%20bath%20towel%20folded%20on%20white%20background%20product%20photo&image_size=square",
    category: "towel",
    createdAt: "2026-06-02T09:10:00.000Z",
  },
  {
    id: "c5",
    name: "女士真丝内衣",
    color: "粉色",
    colorCategory: "light",
    material: "silk",
    colorfast: false,
    suggestedTemp: 20,
    memberId: "m2",
    photoUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pink%20silk%20lingerie%20on%20hanger%20white%20background%20delicate%20product%20photo&image_size=square",
    category: "underwear",
    createdAt: "2026-06-03T08:00:00.000Z",
  },
  {
    id: "c6",
    name: "男士纯棉内裤",
    color: "深蓝色",
    colorCategory: "dark",
    material: "underwear",
    colorfast: false,
    suggestedTemp: 40,
    memberId: "m1",
    photoUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=navy%20blue%20cotton%20mens%20underwear%20on%20white%20background%20product%20photo&image_size=square",
    category: "underwear",
    createdAt: "2026-06-03T08:05:00.000Z",
  },
  {
    id: "c7",
    name: "儿童运动外套",
    color: "红色",
    colorCategory: "dark",
    material: "synthetic",
    colorfast: true,
    suggestedTemp: 30,
    memberId: "m3",
    photoUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20kids%20sports%20jacket%20on%20hanger%20white%20background%20product%20photo&image_size=square",
    category: "coat",
    createdAt: "2026-06-04T10:00:00.000Z",
  },
  {
    id: "c8",
    name: "小女孩连衣裙",
    color: "白色",
    colorCategory: "light",
    material: "cotton",
    colorfast: false,
    suggestedTemp: 30,
    memberId: "m4",
    photoUrl:
      "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=white%20cotton%20little%20girl%20dress%20on%20hanger%20white%20background%20product%20photo&image_size=square",
    category: "top",
    createdAt: "2026-06-04T10:10:00.000Z",
  },
];

interface StoreState {
  members: Member[];
  clothings: Clothing[];
  currentWasher: Washer;
  history: WashHistory[];

  addClothing: (c: Omit<Clothing, "id" | "createdAt">) => void;
  updateClothing: (id: string, c: Partial<Clothing>) => void;
  deleteClothing: (id: string) => void;

  addToWasher: (clothingId: string) => void;
  removeFromWasher: (clothingId: string) => void;
  clearWasher: () => void;

  completeWash: (conflicts: any[]) => void;
  clearHistory: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      members: DEFAULT_MEMBERS,
      clothings: DEFAULT_CLOTHES,
      currentWasher: {
        id: "w1",
        clothingIds: [],
        conflicts: [],
        createdAt: new Date().toISOString(),
      },
      history: [],

      addClothing: (c) =>
        set((state) => ({
          clothings: [
            ...state.clothings,
            { ...c, id: `c${Date.now()}`, createdAt: new Date().toISOString() },
          ],
        })),

      updateClothing: (id, c) =>
        set((state) => ({
          clothings: state.clothings.map((item) =>
            item.id === id ? { ...item, ...c } : item
          ),
        })),

      deleteClothing: (id) =>
        set((state) => ({
          clothings: state.clothings.filter((item) => item.id !== id),
        })),

      addToWasher: (clothingId) =>
        set((state) => {
          if (state.currentWasher.clothingIds.includes(clothingId)) return state;
          return {
            currentWasher: {
              ...state.currentWasher,
              clothingIds: [...state.currentWasher.clothingIds, clothingId],
            },
          };
        }),

      removeFromWasher: (clothingId) =>
        set((state) => ({
          currentWasher: {
            ...state.currentWasher,
            clothingIds: state.currentWasher.clothingIds.filter(
              (id) => id !== clothingId
            ),
          },
        })),

      clearWasher: () =>
        set(() => ({
          currentWasher: {
            id: `w${Date.now()}`,
            clothingIds: [],
            conflicts: [],
            createdAt: new Date().toISOString(),
          },
        })),

      completeWash: (conflicts) =>
        set((state) => {
          const washer = state.currentWasher;
          if (washer.clothingIds.length === 0) return state;

          const memberStats: Record<string, number> = {};
          washer.clothingIds.forEach((cid) => {
            const clothing = state.clothings.find((c) => c.id === cid);
            if (clothing) {
              memberStats[clothing.memberId] =
                (memberStats[clothing.memberId] || 0) + 1;
            }
          });

          const historyItem: WashHistory = {
            id: `h${Date.now()}`,
            clothingIds: [...washer.clothingIds],
            conflicts,
            completedAt: new Date().toISOString(),
            memberStats,
          };

          return {
            history: [historyItem, ...state.history],
            currentWasher: {
              id: `w${Date.now()}`,
              clothingIds: [],
              conflicts: [],
              createdAt: new Date().toISOString(),
            },
          };
        }),

      clearHistory: () => set(() => ({ history: [] })),
    }),
    {
      name: "laundry-washer-storage",
    }
  )
);
