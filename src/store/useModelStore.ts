import { create } from 'zustand';
import type { Model, Stage, PaintFormula, Photo, DryingTimer, RootState, PaintStage, ShelfReason } from '@/types';
import { STAGE_ORDER } from '@/types';
import { generateId, daysBetween, isStale } from '@/utils/time';
import { saveToStorage, loadFromStorage } from '@/utils/storage';
import { mockModels, mockStages, mockFormulas, mockPhotos, mockTimers } from '@/data/mockData';

interface ModelStore extends RootState {
  addModel: (data: Omit<Model, 'id' | 'progress' | 'createdAt' | 'updatedAt' | 'isOnShelf' | 'staleDays'>) => void;
  updateModel: (id: string, updates: Partial<Model>) => void;
  deleteModel: (id: string) => void;
  addStage: (modelId: string, stage: Omit<Stage, 'id' | 'modelId'>) => void;
  updateStage: (id: string, updates: Partial<Stage>) => void;
  advanceStage: (modelId: string) => void;
  addFormula: (formula: Omit<PaintFormula, 'id'>) => void;
  updateFormula: (id: string, updates: Partial<PaintFormula>) => void;
  deleteFormula: (id: string) => void;
  addPhoto: (photo: Omit<Photo, 'id'>) => void;
  deletePhoto: (id: string) => void;
  startTimer: (modelId: string, durationMinutes: number) => void;
  pauseTimer: (modelId: string) => void;
  resetTimer: (modelId: string) => void;
  completeTimer: (modelId: string) => void;
  clearTimer: (modelId: string) => void;
  tickTimer: (modelId: string) => void;
  moveToShelf: (modelId: string, reason: ShelfReason) => void;
  restoreFromShelf: (modelId: string) => void;
  checkStaleModels: () => void;
  initializeStages: (modelId: string) => void;
  calculateProgress: (stages: Stage[]) => number;
}

const initialState = loadFromStorage() || {
  models: mockModels,
  stages: mockStages,
  formulas: mockFormulas,
  photos: mockPhotos,
  timers: mockTimers,
};

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

const throttledSave = (state: RootState) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveToStorage(state);
  }, 100);
};

export const useModelStore = create<ModelStore>((set, get) => ({
  ...initialState,

  addModel: (data) => {
    const newModel: Model = {
      ...data,
      id: generateId(),
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOnShelf: false,
      staleDays: 0,
    };
    set((state) => {
      const newState = { ...state, models: [...state.models, newModel] };
      throttledSave(newState);
      return newState;
    });
    get().initializeStages(newModel.id);
  },

  updateModel: (id, updates) => {
    set((state) => {
      const newState = {
        ...state,
        models: state.models.map((m) =>
          m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
        ),
      };
      throttledSave(newState);
      return newState;
    });
  },

  deleteModel: (id) => {
    set((state) => {
      const newState = {
        ...state,
        models: state.models.filter((m) => m.id !== id),
        stages: state.stages.filter((s) => s.modelId !== id),
        formulas: state.formulas.filter((f) => f.modelId !== id),
        photos: state.photos.filter((p) => p.modelId !== id),
        timers: state.timers.filter((t) => t.modelId !== id),
      };
      throttledSave(newState);
      return newState;
    });
  },

  initializeStages: (modelId) => {
    const stages: Stage[] = STAGE_ORDER.map((stage, index) => ({
      id: generateId(),
      modelId,
      name: stage,
      status: index === 0 ? 'active' : 'pending',
      startedAt: index === 0 ? new Date().toISOString() : undefined,
    }));
    set((state) => {
      const newState = { ...state, stages: [...state.stages, ...stages] };
      throttledSave(newState);
      return newState;
    });
  },

  addStage: (modelId, stage) => {
    const newStage: Stage = { ...stage, id: generateId(), modelId };
    set((state) => {
      const newState = { ...state, stages: [...state.stages, newStage] };
      throttledSave(newState);
      return newState;
    });
  },

  updateStage: (id, updates) => {
    set((state) => {
      const newState = {
        ...state,
        stages: state.stages.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      };
      throttledSave(newState);
      return newState;
    });
  },

  calculateProgress: (stages) => {
    const completed = stages.filter((s) => s.status === 'completed').length;
    return Math.round((completed / STAGE_ORDER.length) * 100);
  },

  advanceStage: (modelId) => {
    const { stages, models } = get();
    const modelStages = stages.filter((s) => s.modelId === modelId);
    const currentActive = modelStages.find((s) => s.status === 'active');
    
    if (!currentActive) return;
    
    const currentIndex = STAGE_ORDER.indexOf(currentActive.name);
    if (currentIndex >= STAGE_ORDER.length - 1) return;

    const nextStageName = STAGE_ORDER[currentIndex + 1];
    const nextStage = modelStages.find((s) => s.name === nextStageName);

    set((state) => {
      const newStages = state.stages.map((s) => {
        if (s.id === currentActive.id) {
          return { ...s, status: 'completed' as const, completedAt: new Date().toISOString() };
        }
        if (s.id === nextStage?.id) {
          return { ...s, status: 'active' as const, startedAt: new Date().toISOString() };
        }
        return s;
      });

      const newModelStages = newStages.filter((s) => s.modelId === modelId);
      const progress = get().calculateProgress(newModelStages);

      const newState = {
        ...state,
        stages: newStages,
        models: state.models.map((m) =>
          m.id === modelId
            ? {
                ...m,
                currentStage: nextStageName,
                progress,
                updatedAt: new Date().toISOString(),
                isOnShelf: false,
                staleDays: 0,
              }
            : m
        ),
      };
      throttledSave(newState);
      return newState;
    });
  },

  addFormula: (formula) => {
    const newFormula: PaintFormula = { ...formula, id: generateId() };
    set((state) => {
      const newState = { ...state, formulas: [...state.formulas, newFormula] };
      throttledSave(newState);
      return newState;
    });
  },

  updateFormula: (id, updates) => {
    set((state) => {
      const newState = {
        ...state,
        formulas: state.formulas.map((f) => (f.id === id ? { ...f, ...updates } : f)),
      };
      throttledSave(newState);
      return newState;
    });
  },

  deleteFormula: (id) => {
    set((state) => {
      const newState = {
        ...state,
        formulas: state.formulas.filter((f) => f.id !== id),
      };
      throttledSave(newState);
      return newState;
    });
  },

  addPhoto: (photo) => {
    const newPhoto: Photo = { ...photo, id: generateId() };
    set((state) => {
      const newState = { ...state, photos: [...state.photos, newPhoto] };
      throttledSave(newState);
      return newState;
    });
    get().updateModel(photo.modelId, {});
  },

  deletePhoto: (id) => {
    set((state) => {
      const newState = {
        ...state,
        photos: state.photos.filter((p) => p.id !== id),
      };
      throttledSave(newState);
      return newState;
    });
  },

  startTimer: (modelId, durationMinutes) => {
    const existingTimer = get().timers.find((t) => t.modelId === modelId);
    const duration = durationMinutes * 60;

    if (existingTimer) {
      set((state) => ({
        ...state,
        timers: state.timers.map((t) =>
          t.modelId === modelId
            ? { ...t, duration, remaining: duration, isRunning: true, startTime: new Date().toISOString() }
            : t
        ),
      }));
    } else {
      const newTimer: DryingTimer = {
        id: generateId(),
        modelId,
        duration,
        remaining: duration,
        isRunning: true,
        startTime: new Date().toISOString(),
      };
      set((state) => ({ ...state, timers: [...state.timers, newTimer] }));
    }
  },

  pauseTimer: (modelId) => {
    set((state) => ({
      ...state,
      timers: state.timers.map((t) =>
        t.modelId === modelId ? { ...t, isRunning: false } : t
      ),
    }));
  },

  resetTimer: (modelId) => {
    set((state) => ({
      ...state,
      timers: state.timers.map((t) =>
        t.modelId === modelId
          ? { ...t, remaining: t.duration, isRunning: false, startTime: undefined }
          : t
      ),
    }));
  },

  completeTimer: (modelId) => {
    set((state) => ({
      ...state,
      timers: state.timers.map((t) =>
        t.modelId === modelId
          ? { ...t, remaining: 0, isRunning: false, startTime: undefined }
          : t
      ),
    }));
  },

  clearTimer: (modelId) => {
    set((state) => ({
      ...state,
      timers: state.timers.map((t) =>
        t.modelId === modelId
          ? { ...t, duration: 0, remaining: 0, isRunning: false, startTime: undefined }
          : t
      ),
    }));
  },

  tickTimer: (modelId) => {
    const timer = get().timers.find((t) => t.modelId === modelId);
    if (!timer || !timer.isRunning || timer.remaining <= 0) return;

    set((state) => ({
      ...state,
      timers: state.timers.map((t) =>
        t.modelId === modelId
          ? { ...t, remaining: Math.max(0, t.remaining - 1) }
          : t
      ),
    }));

    const updatedTimer = get().timers.find((t) => t.modelId === modelId);
    if (updatedTimer && updatedTimer.remaining <= 0) {
      get().completeTimer(modelId);
      if (Notification.permission === 'granted') {
        new Notification('干燥完成', {
          body: '模型涂装干燥已完成，可以进行下一步操作',
          icon: '/favicon.svg',
        });
      }
    }
  },

  moveToShelf: (modelId, reason) => {
    set((state) => {
      const model = state.models.find((m) => m.id === modelId);
      const staleDays = model ? daysBetween(model.updatedAt) : 0;
      const newState = {
        ...state,
        models: state.models.map((m) =>
          m.id === modelId
            ? { ...m, isOnShelf: true, shelfReason: reason, staleDays }
            : m
        ),
      };
      throttledSave(newState);
      return newState;
    });
  },

  restoreFromShelf: (modelId) => {
    set((state) => {
      const newState = {
        ...state,
        models: state.models.map((m) =>
          m.id === modelId
            ? { ...m, isOnShelf: false, shelfReason: undefined, staleDays: 0, updatedAt: new Date().toISOString() }
            : m
        ),
      };
      throttledSave(newState);
      return newState;
    });
  },

  checkStaleModels: () => {
    const { models } = get();
    const now = new Date().toISOString();
    
    set((state) => ({
      ...state,
      models: state.models.map((m) => {
        if (m.currentStage === 'completed' || m.isOnShelf) return m;
        if (isStale(m.updatedAt, 7)) {
          return {
            ...m,
            isOnShelf: true,
            shelfReason: 'other' as ShelfReason,
            staleDays: daysBetween(m.updatedAt, now),
          };
        }
        return m;
      }),
    }));
  },
}));
