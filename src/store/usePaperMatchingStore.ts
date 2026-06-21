import { create } from 'zustand';
import type { AppState, AppActions, Trial, Photo, Evaluation, FiberDirection } from '@/types';
import { mockInitialState } from '@/data/mockData';

const STORAGE_KEY = 'paper-matching-data';

const loadFromStorage = (): AppState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return null;
};

const getInitialState = (): AppState => {
  const stored = loadFromStorage();
  return stored ?? mockInitialState;
};

const createEmptyEvaluation = (trialId: string): Evaluation => ({
  id: `eval-${Date.now()}`,
  trialId,
  colorDifference: 3,
  edgeWarping: 3,
  gluePenetration: 3,
  touchDifference: 3,
  remarks: '',
});

const createEmptyPhotos = (trialId: string): Photo[] => [
  { id: `photo-${trialId}-wet`, trialId, state: 'wet', dataUrl: '', fileName: '', size: 0 },
  { id: `photo-${trialId}-half`, trialId, state: 'half_dry', dataUrl: '', fileName: '', size: 0 },
  { id: `photo-${trialId}-full`, trialId, state: 'full_dry', dataUrl: '', fileName: '', size: 0 },
];

export const usePaperMatchingStore = create<AppState & AppActions>((set, get) => ({
  ...getInitialState(),

  setCurrentTrial: (trialId: string | null) => {
    set({ currentTrialId: trialId });
    get().saveToStorage();
  },

  createNewTrial: (): Trial => {
    const { trials, currentBook } = get();
    const maxVersion = trials.reduce((max, trial) => Math.max(max, trial.version), 0);
    const newVersion = maxVersion + 1;
    const newTrialId = `trial-${Date.now()}`;

    const newTrial: Trial = {
      id: newTrialId,
      bookId: currentBook.id,
      version: newVersion,
      paperThickness: 0.08,
      fiberDirection: 'vertical' as FiberDirection,
      dyeRatio: '',
      pasteConcentration: 50,
      photos: createEmptyPhotos(newTrialId),
      evaluation: createEmptyEvaluation(newTrialId),
      createdAt: new Date().toISOString(),
      isSelected: false,
    };

    set((state) => ({
      trials: [...state.trials, newTrial],
      currentTrialId: newTrialId,
    }));
    get().saveToStorage();
    return newTrial;
  },

  updateTrial: (trialId: string, updates: Partial<Trial>) => {
    set((state) => ({
      trials: state.trials.map((trial) =>
        trial.id === trialId ? { ...trial, ...updates } : trial
      ),
    }));
    get().saveToStorage();
  },

  updateEvaluation: (trialId: string, updates: Partial<Evaluation>) => {
    set((state) => ({
      trials: state.trials.map((trial) => {
        if (trial.id !== trialId) return trial;
        return {
          ...trial,
          evaluation: { ...trial.evaluation, ...updates },
        };
      }),
    }));
    get().saveToStorage();
  },

  updatePhoto: (trialId: string, photo: Photo) => {
    set((state) => ({
      trials: state.trials.map((trial) => {
        if (trial.id !== trialId) return trial;
        return {
          ...trial,
          photos: trial.photos.map((p) =>
            p.state === photo.state ? photo : p
          ),
        };
      }),
    }));
    get().saveToStorage();
  },

  selectTrial: (trialId: string) => {
    set((state) => ({
      trials: state.trials.map((trial) => ({
        ...trial,
        isSelected: trial.id === trialId,
      })),
    }));
    get().saveToStorage();
  },

  saveToStorage: () => {
    try {
      const { currentBook, trials, currentTrialId } = get();
      const stateToSave: AppState = { currentBook, trials, currentTrialId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  resetToMock: () => {
    localStorage.removeItem(STORAGE_KEY);
    set(mockInitialState);
  },
}));
