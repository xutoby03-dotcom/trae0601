import { create } from 'zustand';
import type { BlindTest, BrewingParam, TastingScore, WaterSample } from '../types';
import { generateId, assignBlindCodes } from '../utils/helpers';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage';
import { generateSuggestions as genSuggestions } from '../utils/suggestions';
import type { Suggestion } from '../types';

interface BlindTestStore {
  blindTests: BlindTest[];
  currentBlindTest: BlindTest | null;
  isLoading: boolean;

  init: () => void;
  setCurrentBlindTest: (id: string | null) => void;

  createBlindTest: (data: {
    coffeeName: string;
    origin: string;
    processMethod: string;
    roastLevel: BlindTest['roastLevel'];
    roastDate: string;
  }) => string;

  updateBlindTest: (id: string, data: Partial<BlindTest>) => void;
  deleteBlindTest: (id: string) => void;
  getBlindTestById: (id: string) => BlindTest | undefined;

  addWaterSample: (
    blindTestId: string,
    sample: Omit<WaterSample, 'id' | 'blindCode'>
  ) => void;
  updateWaterSample: (
    blindTestId: string,
    sampleId: string,
    data: Partial<WaterSample>
  ) => void;
  removeWaterSample: (blindTestId: string, sampleId: string) => void;

  setBrewingParam: (blindTestId: string, param: Omit<BrewingParam, 'id'>) => void;

  setTastingScore: (blindTestId: string, score: Omit<TastingScore, 'id'>) => void;

  revealBlindTest: (id: string) => void;

  generateSuggestions: (blindTestId: string) => Suggestion[];

  persist: () => void;
}

export const useBlindTestStore = create<BlindTestStore>((set, get) => ({
  blindTests: [],
  currentBlindTest: null,
  isLoading: true,

  init: () => {
    const data = loadFromLocalStorage();
    set({ blindTests: data, isLoading: false });
  },

  setCurrentBlindTest: (id) => {
    if (!id) {
      set({ currentBlindTest: null });
      return;
    }
    const test = get().blindTests.find((t) => t.id === id);
    set({ currentBlindTest: test || null });
  },

  createBlindTest: (data) => {
    const newTest: BlindTest = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
      isRevealed: false,
      waterSamples: [],
      brewingParams: [],
      tastingScores: [],
    };

    set((state) => ({
      blindTests: [newTest, ...state.blindTests],
      currentBlindTest: newTest,
    }));
    get().persist();
    return newTest.id;
  },

  updateBlindTest: (id, data) => {
    set((state) => ({
      blindTests: state.blindTests.map((t) =>
        t.id === id ? { ...t, ...data } : t
      ),
      currentBlindTest:
        state.currentBlindTest?.id === id
          ? { ...state.currentBlindTest, ...data }
          : state.currentBlindTest,
    }));
    get().persist();
  },

  deleteBlindTest: (id) => {
    set((state) => ({
      blindTests: state.blindTests.filter((t) => t.id !== id),
      currentBlindTest: state.currentBlindTest?.id === id ? null : state.currentBlindTest,
    }));
    get().persist();
  },

  getBlindTestById: (id) => {
    return get().blindTests.find((t) => t.id === id);
  },

  addWaterSample: (blindTestId, sample) => {
    const test = get().blindTests.find((t) => t.id === blindTestId);
    if (!test) return;

    const currentCount = test.waterSamples.length;
    if (currentCount >= 3) return;

    const availableCodes = assignBlindCodes(3).filter(
      (code) => !test.waterSamples.some((s) => s.blindCode === code)
    );

    if (availableCodes.length === 0) return;

    const newSample: WaterSample = {
      id: generateId(),
      blindCode: availableCodes[0],
      ...sample,
    };

    set((state) => ({
      blindTests: state.blindTests.map((t) =>
        t.id === blindTestId
          ? { ...t, waterSamples: [...t.waterSamples, newSample] }
          : t
      ),
      currentBlindTest:
        state.currentBlindTest?.id === blindTestId
          ? {
              ...state.currentBlindTest,
              waterSamples: [...state.currentBlindTest.waterSamples, newSample],
            }
          : state.currentBlindTest,
    }));
    get().persist();
  },

  updateWaterSample: (blindTestId, sampleId, data) => {
    set((state) => ({
      blindTests: state.blindTests.map((t) =>
        t.id === blindTestId
          ? {
              ...t,
              waterSamples: t.waterSamples.map((s) =>
                s.id === sampleId ? { ...s, ...data } : s
              ),
            }
          : t
      ),
      currentBlindTest:
        state.currentBlindTest?.id === blindTestId
          ? {
              ...state.currentBlindTest,
              waterSamples: state.currentBlindTest.waterSamples.map((s) =>
                s.id === sampleId ? { ...s, ...data } : s
              ),
            }
          : state.currentBlindTest,
    }));
    get().persist();
  },

  removeWaterSample: (blindTestId, sampleId) => {
    set((state) => ({
      blindTests: state.blindTests.map((t) =>
        t.id === blindTestId
          ? {
              ...t,
              waterSamples: t.waterSamples.filter((s) => s.id !== sampleId),
              brewingParams: t.brewingParams.filter((p) => p.waterSampleId !== sampleId),
              tastingScores: t.tastingScores.filter((s) => s.waterSampleId !== sampleId),
            }
          : t
      ),
      currentBlindTest:
        state.currentBlindTest?.id === blindTestId
          ? {
              ...state.currentBlindTest,
              waterSamples: state.currentBlindTest.waterSamples.filter(
                (s) => s.id !== sampleId
              ),
              brewingParams: state.currentBlindTest.brewingParams.filter(
                (p) => p.waterSampleId !== sampleId
              ),
              tastingScores: state.currentBlindTest.tastingScores.filter(
                (s) => s.waterSampleId !== sampleId
              ),
            }
          : state.currentBlindTest,
    }));
    get().persist();
  },

  setBrewingParam: (blindTestId, param) => {
    const existingIndex = get()
      .blindTests.find((t) => t.id === blindTestId)
      ?.brewingParams.findIndex((p) => p.waterSampleId === param.waterSampleId);

    const newParam: BrewingParam = {
      id: generateId(),
      ...param,
    };

    set((state) => ({
      blindTests: state.blindTests.map((t) => {
        if (t.id !== blindTestId) return t;
        const params = [...t.brewingParams];
        if (existingIndex !== undefined && existingIndex >= 0) {
          params[existingIndex] = { ...newParam, id: params[existingIndex].id };
        } else {
          params.push(newParam);
        }
        return { ...t, brewingParams: params };
      }),
      currentBlindTest:
        state.currentBlindTest?.id === blindTestId
          ? (() => {
              const params = [...state.currentBlindTest.brewingParams];
              if (existingIndex !== undefined && existingIndex >= 0) {
                params[existingIndex] = {
                  ...newParam,
                  id: params[existingIndex].id,
                };
              } else {
                params.push(newParam);
              }
              return { ...state.currentBlindTest, brewingParams: params };
            })()
          : state.currentBlindTest,
    }));
    get().persist();
  },

  setTastingScore: (blindTestId, score) => {
    const existingIndex = get()
      .blindTests.find((t) => t.id === blindTestId)
      ?.tastingScores.findIndex((s) => s.waterSampleId === score.waterSampleId);

    const newScore: TastingScore = {
      id: generateId(),
      ...score,
    };

    set((state) => ({
      blindTests: state.blindTests.map((t) => {
        if (t.id !== blindTestId) return t;
        const scores = [...t.tastingScores];
        if (existingIndex !== undefined && existingIndex >= 0) {
          scores[existingIndex] = { ...newScore, id: scores[existingIndex].id };
        } else {
          scores.push(newScore);
        }
        return { ...t, tastingScores: scores };
      }),
      currentBlindTest:
        state.currentBlindTest?.id === blindTestId
          ? (() => {
              const scores = [...state.currentBlindTest.tastingScores];
              if (existingIndex !== undefined && existingIndex >= 0) {
                scores[existingIndex] = {
                  ...newScore,
                  id: scores[existingIndex].id,
                };
              } else {
                scores.push(newScore);
              }
              return { ...state.currentBlindTest, tastingScores: scores };
            })()
          : state.currentBlindTest,
    }));
    get().persist();
  },

  revealBlindTest: (id) => {
    set((state) => ({
      blindTests: state.blindTests.map((t) =>
        t.id === id ? { ...t, isRevealed: true } : t
      ),
      currentBlindTest:
        state.currentBlindTest?.id === id
          ? { ...state.currentBlindTest, isRevealed: true }
          : state.currentBlindTest,
    }));
    get().persist();
  },

  generateSuggestions: (blindTestId) => {
    const test = get().blindTests.find((t) => t.id === blindTestId);
    if (!test) return [];
    return genSuggestions(test);
  },

  persist: () => {
    saveToLocalStorage(get().blindTests);
  },
}));
