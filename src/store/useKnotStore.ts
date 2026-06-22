import { create } from "zustand";
import { persist } from "zustand/middleware";
import { KnotRecord, KNOT_TYPES, ROPE_MATERIALS } from "@/types/knot";
import { generateId } from "@/utils/knotUtils";

const mockRecords: KnotRecord[] = [
  {
    id: "mock1",
    knotType: "八字结",
    ropeDiameter: 10.5,
    ropeMaterial: "尼龙",
    studentName: "张明",
    tieTimeSeconds: 45,
    testWeight: 50,
    slipped: false,
    capsized: false,
    sheathWear: false,
    retryCount: 0,
    notes: "动作标准",
    createdAt: "2025-01-15T09:30:00Z",
  },
  {
    id: "mock2",
    knotType: "八字结",
    ropeDiameter: 10.5,
    ropeMaterial: "尼龙",
    studentName: "张明",
    tieTimeSeconds: 38,
    testWeight: 80,
    slipped: false,
    capsized: false,
    sheathWear: false,
    retryCount: 0,
    notes: "速度提升",
    createdAt: "2025-01-16T10:00:00Z",
  },
  {
    id: "mock3",
    knotType: "八字结",
    ropeDiameter: 10.5,
    ropeMaterial: "尼龙",
    studentName: "张明",
    tieTimeSeconds: 42,
    testWeight: 100,
    slipped: false,
    capsized: false,
    sheathWear: true,
    retryCount: 0,
    notes: "大重量下绳皮轻微磨损",
    createdAt: "2025-01-17T14:30:00Z",
  },
  {
    id: "mock4",
    knotType: "布林结",
    ropeDiameter: 10.5,
    ropeMaterial: "尼龙",
    studentName: "张明",
    tieTimeSeconds: 65,
    testWeight: 50,
    slipped: true,
    capsized: false,
    sheathWear: false,
    retryCount: 2,
    notes: "绳尾留短了",
    createdAt: "2025-01-15T11:00:00Z",
  },
  {
    id: "mock5",
    knotType: "布林结",
    ropeDiameter: 10.5,
    ropeMaterial: "尼龙",
    studentName: "张明",
    tieTimeSeconds: 55,
    testWeight: 60,
    slipped: false,
    capsized: true,
    sheathWear: false,
    retryCount: 1,
    notes: "结形不够规整",
    createdAt: "2025-01-16T15:00:00Z",
  },
  {
    id: "mock6",
    knotType: "八字结",
    ropeDiameter: 9.8,
    ropeMaterial: "迪尼玛",
    studentName: "李华",
    tieTimeSeconds: 52,
    testWeight: 40,
    slipped: false,
    capsized: false,
    sheathWear: false,
    retryCount: 0,
    notes: "初次练习",
    createdAt: "2025-01-15T09:00:00Z",
  },
  {
    id: "mock7",
    knotType: "八字结",
    ropeDiameter: 9.8,
    ropeMaterial: "迪尼玛",
    studentName: "李华",
    tieTimeSeconds: 48,
    testWeight: 60,
    slipped: false,
    capsized: false,
    sheathWear: false,
    retryCount: 0,
    notes: "进步明显",
    createdAt: "2025-01-16T10:30:00Z",
  },
  {
    id: "mock8",
    knotType: "普鲁士结",
    ropeDiameter: 6,
    ropeMaterial: "尼龙",
    studentName: "李华",
    tieTimeSeconds: 80,
    testWeight: 30,
    slipped: true,
    capsized: false,
    sheathWear: true,
    retryCount: 3,
    notes: "绕圈数不对",
    createdAt: "2025-01-17T11:00:00Z",
  },
  {
    id: "mock9",
    knotType: "双渔人结",
    ropeDiameter: 10.5,
    ropeMaterial: "尼龙",
    studentName: "王芳",
    tieTimeSeconds: 90,
    testWeight: 70,
    slipped: false,
    capsized: false,
    sheathWear: false,
    retryCount: 1,
    notes: "仔细完成",
    createdAt: "2025-01-15T14:00:00Z",
  },
  {
    id: "mock10",
    knotType: "蝴蝶结",
    ropeDiameter: 10.5,
    ropeMaterial: "尼龙",
    studentName: "王芳",
    tieTimeSeconds: 70,
    testWeight: 50,
    slipped: false,
    capsized: false,
    sheathWear: false,
    retryCount: 0,
    notes: "一次成功",
    createdAt: "2025-01-16T09:30:00Z",
  },
];

interface KnotStore {
  records: KnotRecord[];
  addRecord: (record: Omit<KnotRecord, "id" | "createdAt">) => void;
  deleteRecord: (id: string) => void;
  clearAllRecords: () => void;
  knotTypes: string[];
  ropeMaterials: string[];
}

export const useKnotStore = create<KnotStore>()(
  persist(
    (set) => ({
      records: mockRecords,
      knotTypes: KNOT_TYPES,
      ropeMaterials: ROPE_MATERIALS,
      addRecord: (recordData) =>
        set((state) => ({
          records: [
            {
              ...recordData,
              id: generateId(),
              createdAt: new Date().toISOString(),
            },
            ...state.records,
          ],
        })),
      deleteRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),
      clearAllRecords: () => set({ records: [] }),
    }),
    {
      name: "knot-practice-storage",
    }
  )
);
