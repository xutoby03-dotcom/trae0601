import { create } from 'zustand';
import type {
  TrialRecord,
  LightSceneKey,
  LightScene,
  RiskMark,
  FillAngle,
} from '@/types';

const createEmptyScene = (): LightScene => ({
  photoUrl: '',
  notes: '',
  risks: [],
});

const createInitialState = (): TrialRecord => ({
  id: Date.now().toString(),
  modelSkinTone: '',
  foundationShade: '',
  colorTemperature: 5500,
  fillAngle: 'front' as FillAngle,
  cameraWhiteBalance: 5500,
  naturalLight: createEmptyScene(),
  warmLight: createEmptyScene(),
  coolLight: createEmptyScene(),
  mixedLight: createEmptyScene(),
  createdAt: new Date().toISOString(),
});

const SAVED_AT_KEY = 'trial-record-saved-at';

interface TrialStore {
  record: TrialRecord;
  savedAt: string | null;
  setBasicInfo: <K extends keyof Omit<TrialRecord, 'id' | 'createdAt' | LightSceneKey>>(
    key: K,
    value: TrialRecord[K]
  ) => void;
  setScenePhoto: (scene: LightSceneKey, url: string) => void;
  setSceneNotes: (scene: LightSceneKey, notes: string) => void;
  toggleRisk: (scene: LightSceneKey, risk: RiskMark) => void;
  updateRiskLevel: (scene: LightSceneKey, type: RiskMark['type'], level: RiskMark['level']) => void;
  reset: () => void;
  saveToLocal: () => void;
  loadFromLocal: () => void;
}

export const useTrialStore = create<TrialStore>((set, get) => ({
  record: createInitialState(),
  savedAt: null,

  setBasicInfo: (key, value) =>
    set((state) => ({
      record: { ...state.record, [key]: value },
    })),

  setScenePhoto: (scene, url) =>
    set((state) => ({
      record: {
        ...state.record,
        [scene]: { ...state.record[scene], photoUrl: url },
      },
    })),

  setSceneNotes: (scene, notes) =>
    set((state) => ({
      record: {
        ...state.record,
        [scene]: { ...state.record[scene], notes },
      },
    })),

  toggleRisk: (scene, risk) =>
    set((state) => {
      const current = state.record[scene].risks;
      const exists = current.find((r) => r.type === risk.type);
      return {
        record: {
          ...state.record,
          [scene]: {
            ...state.record[scene],
            risks: exists
              ? current.filter((r) => r.type !== risk.type)
              : [...current, risk],
          },
        },
      };
    }),

  updateRiskLevel: (scene, type, level) =>
    set((state) => ({
      record: {
        ...state.record,
        [scene]: {
          ...state.record[scene],
          risks: state.record[scene].risks.map((r) =>
            r.type === type ? { ...r, level } : r
          ),
        },
      },
    })),

  reset: () => {
    try {
      localStorage.removeItem(SAVED_AT_KEY);
    } catch {
      /* ignore */
    }
    set({ record: createInitialState(), savedAt: null });
  },

  saveToLocal: () => {
    try {
      const now = new Date().toISOString();
      localStorage.setItem('trial-record', JSON.stringify(get().record));
      localStorage.setItem(SAVED_AT_KEY, now);
      set({ savedAt: now });
    } catch {
      /* ignore */
    }
  },

  loadFromLocal: () => {
    try {
      const saved = localStorage.getItem('trial-record');
      const savedAt = localStorage.getItem(SAVED_AT_KEY);
      if (saved) {
        set({ record: JSON.parse(saved), savedAt: savedAt });
      }
    } catch {
      /* ignore */
    }
  },
}));
