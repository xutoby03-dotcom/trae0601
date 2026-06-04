import { create } from 'zustand';

const MAX_HISTORY = 30;

interface TimelineSnapshot {
  tracks: any[];
  clips: any[];
}

interface HistoryState {
  past: TimelineSnapshot[];
  future: TimelineSnapshot[];
  present: TimelineSnapshot | null;
  
  pushHistory: (snapshot: TimelineSnapshot) => void;
  undo: () => TimelineSnapshot | null;
  redo: () => TimelineSnapshot | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  present: null,
  
  pushHistory: (snapshot) => {
    set((state) => {
      const newPast = [...state.past, snapshot].slice(-MAX_HISTORY);
      return { past: newPast, future: [], present: snapshot };
    });
  },
  
  undo: () => {
    const { past } = get();
    if (past.length === 0) return null;
    
    const newPast = [...past];
    const snapshot = newPast.pop()!;
    
    set((state) => ({
      past: newPast,
      future: state.present ? [state.present, ...state.future] : state.future,
      present: newPast.length > 0 ? newPast[newPast.length - 1] : null,
    }));
    
    return snapshot;
  },
  
  redo: () => {
    const { future } = get();
    if (future.length === 0) return null;
    
    const newFuture = [...future];
    const snapshot = newFuture.shift()!;
    
    set((state) => ({
      past: state.present ? [...state.past, state.present] : state.past,
      future: newFuture,
      present: snapshot,
    }));
    
    return snapshot;
  },
  
  canUndo: () => get().past.length > 0,
  
  canRedo: () => get().future.length > 0,
  
  clearHistory: () => set({ past: [], future: [], present: null }),
}));
