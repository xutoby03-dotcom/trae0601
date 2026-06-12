import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ElderProfile, BloodPressureRecord } from "@/types";
import { generateId, isBloodPressureAbnormal } from "@/utils/bpUtils";

interface AppState {
  profiles: ElderProfile[];
  records: BloodPressureRecord[];
  selectedElderId: string | null;

  addProfile: (profile: Omit<ElderProfile, "id" | "createdAt" | "updatedAt">) => void;
  updateProfile: (id: string, profile: Partial<ElderProfile>) => void;
  deleteProfile: (id: string) => void;
  setSelectedElderId: (id: string | null) => void;

  addRecord: (
    record: Omit<BloodPressureRecord, "id" | "createdAt" | "isAbnormal" | "needsRetest" | "retestCompleted">,
    isRetest?: boolean,
    originalRecordId?: string
  ) => BloodPressureRecord;
  deleteRecord: (id: string) => void;
  completeRetest: (originalRecordId: string, retestRecordId: string) => void;
}

const seedProfiles: ElderProfile[] = [
  {
    id: "seed-1",
    name: "王爷爷",
    age: 72,
    avatar: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20chinese%20grandfather%20portrait%20warm%20smile%20kind%20face&image_size=square",
    medications: ["硝苯地平", "阿司匹林"],
    targetRange: {
      systolicMin: 90,
      systolicMax: 140,
      diastolicMin: 60,
      diastolicMax: 90,
    },
    emergencyContact: {
      name: "王小明（儿子）",
      phone: "138****5678",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    name: "李奶奶",
    age: 68,
    avatar: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20chinese%20grandmother%20portrait%20gentle%20smile%20silver%20hair&image_size=square",
    medications: ["缬沙坦"],
    targetRange: {
      systolicMin: 90,
      systolicMax: 135,
      diastolicMin: 60,
      diastolicMax: 85,
    },
    emergencyContact: {
      name: "李小红（女儿）",
      phone: "139****1234",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const now = new Date();
const seedRecords: BloodPressureRecord[] = [
  {
    id: "seed-r1",
    elderId: "seed-1",
    systolic: 148,
    diastolic: 92,
    heartRate: 78,
    measureTime: new Date(now.getTime() - 1000 * 60 * 40).toISOString(),
    feeling: "头晕",
    isAbnormal: true,
    needsRetest: true,
    retestCompleted: false,
    createdAt: new Date(now.getTime() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "seed-r2",
    elderId: "seed-1",
    systolic: 128,
    diastolic: 82,
    heartRate: 72,
    measureTime: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(),
    feeling: "无不适",
    isAbnormal: false,
    needsRetest: false,
    retestCompleted: false,
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "seed-r3",
    elderId: "seed-1",
    systolic: 152,
    diastolic: 95,
    heartRate: 85,
    measureTime: new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString(),
    feeling: "头痛",
    isAbnormal: true,
    needsRetest: true,
    retestCompleted: true,
    retestRecordId: "seed-r4",
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: "seed-r4",
    elderId: "seed-1",
    systolic: 135,
    diastolic: 88,
    heartRate: 76,
    measureTime: new Date(now.getTime() - 1000 * 60 * 60 * 17).toISOString(),
    feeling: "无不适",
    isAbnormal: false,
    needsRetest: false,
    retestCompleted: false,
    originalRecordId: "seed-r3",
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 17).toISOString(),
  },
  {
    id: "seed-r5",
    elderId: "seed-2",
    systolic: 132,
    diastolic: 84,
    heartRate: 70,
    measureTime: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
    feeling: "无不适",
    isAbnormal: false,
    needsRetest: false,
    retestCompleted: false,
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "seed-r6",
    elderId: "seed-2",
    systolic: 142,
    diastolic: 88,
    heartRate: 82,
    measureTime: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    feeling: "乏力",
    isAbnormal: true,
    needsRetest: true,
    retestCompleted: true,
    retestRecordId: "seed-r7",
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "seed-r7",
    elderId: "seed-2",
    systolic: 130,
    diastolic: 82,
    heartRate: 75,
    measureTime: new Date(now.getTime() - 1000 * 60 * 60 * 23).toISOString(),
    feeling: "无不适",
    isAbnormal: false,
    needsRetest: false,
    retestCompleted: false,
    originalRecordId: "seed-r6",
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 23).toISOString(),
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profiles: seedProfiles,
      records: seedRecords,
      selectedElderId: seedProfiles[0]?.id || null,

      addProfile: (profile) => {
        const newProfile: ElderProfile = {
          ...profile,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          profiles: [...state.profiles, newProfile],
          selectedElderId: state.selectedElderId || newProfile.id,
        }));
      },

      updateProfile: (id, profile) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...profile, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          records: state.records.filter((r) => r.elderId !== id),
          selectedElderId:
            state.selectedElderId === id
              ? state.profiles.find((p) => p.id !== id)?.id || null
              : state.selectedElderId,
        }));
      },

      setSelectedElderId: (id) => set({ selectedElderId: id }),

      addRecord: (record, isRetest = false, originalRecordId) => {
        const { profiles } = get();
        const elder = profiles.find((p) => p.id === record.elderId);
        const isAbnormal = elder
          ? isBloodPressureAbnormal(record.systolic, record.diastolic, elder.targetRange)
          : false;

        const newRecord: BloodPressureRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
          isAbnormal,
          needsRetest: isAbnormal && !isRetest,
          retestCompleted: false,
          originalRecordId,
        };

        set((state) => ({
          records: [...state.records, newRecord],
        }));

        return newRecord;
      },

      deleteRecord: (id) => {
        set((state) => {
          const record = state.records.find((r) => r.id === id);
          let newRecords = state.records.filter((r) => r.id !== id);

          if (record?.retestRecordId) {
            newRecords = newRecords.filter((r) => r.id !== record.retestRecordId);
          }
          if (record?.originalRecordId) {
            newRecords = newRecords.map((r) =>
              r.id === record.originalRecordId
                ? { ...r, retestCompleted: false, retestRecordId: undefined }
                : r
            );
          }

          return { records: newRecords };
        });
      },

      completeRetest: (originalRecordId, retestRecordId) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === originalRecordId
              ? { ...r, retestCompleted: true, retestRecordId }
              : r
          ),
        }));
      },
    }),
    {
      name: "bp-retest-app-storage",
    }
  )
);
