import { create } from 'zustand';
import {
  WorkItem,
  FurnaceSession,
  GlassType,
  FURNACE_GRID,
  generateId,
  reassignAllPositions,
  checkCompatibility,
  CompatibilityResult,
} from '@/utils/annealing';

interface AnnealingState {
  currentSession: FurnaceSession;
  nextSessionWorks: WorkItem[];
  compatibilityResult: CompatibilityResult | null;
  showAddModal: boolean;
  pendingWork: Omit<WorkItem, 'id' | 'gridRow' | 'gridCol'> | null;

  addWork: (work: Omit<WorkItem, 'id' | 'gridRow' | 'gridCol'>) => void;
  removeWork: (id: string) => void;
  tryAddWork: (work: Omit<WorkItem, 'id' | 'gridRow' | 'gridCol'>) => void;
  confirmAddWork: () => void;
  cancelAddWork: () => void;
  forceAddWork: () => void;
  addToNextFurnace: () => void;
  startSession: () => void;
  completeSession: () => void;
  resetSession: () => void;
}

const createEmptySession = (): FurnaceSession => ({
  id: generateId(),
  status: 'planning',
  startTime: new Date().toISOString(),
  works: [],
});

export const useAnnealingStore = create<AnnealingState>((set, get) => ({
  currentSession: createEmptySession(),
  nextSessionWorks: [],
  compatibilityResult: null,
  showAddModal: false,
  pendingWork: null,

  addWork: (work) => {
    const session = get().currentSession;
    if (session.works.length >= FURNACE_GRID.maxCapacity) return;

    const newWork: WorkItem = {
      ...work,
      id: generateId(),
      gridRow: 0,
      gridCol: 0,
    };

    const updatedWorks = reassignAllPositions([...session.works, newWork]);
    set({
      currentSession: {
        ...session,
        works: updatedWorks,
      },
    });
  },

  removeWork: (id) => {
    const session = get().currentSession;
    const filtered = session.works.filter((w) => w.id !== id);
    const reassigned = reassignAllPositions(filtered);
    set({
      currentSession: {
        ...session,
        works: reassigned,
      },
    });
  },

  tryAddWork: (work) => {
    const session = get().currentSession;
    const result = checkCompatibility(work, session);
    set({ compatibilityResult: result, pendingWork: work, showAddModal: true });
  },

  confirmAddWork: () => {
    const { pendingWork } = get();
    if (!pendingWork) return;
    get().addWork(pendingWork);
    set({ showAddModal: false, pendingWork: null, compatibilityResult: null });
  },

  cancelAddWork: () => {
    set({ showAddModal: false, pendingWork: null, compatibilityResult: null });
  },

  forceAddWork: () => {
    const { pendingWork } = get();
    if (!pendingWork) return;
    get().addWork(pendingWork);
    set({ showAddModal: false, pendingWork: null, compatibilityResult: null });
  },

  addToNextFurnace: () => {
    const { pendingWork, nextSessionWorks } = get();
    if (!pendingWork) return;
    const newWork: WorkItem = {
      ...pendingWork,
      id: generateId(),
      gridRow: 0,
      gridCol: 0,
    };
    const reassigned = reassignAllPositions([...nextSessionWorks, newWork]);
    set({
      nextSessionWorks: reassigned,
      showAddModal: false,
      pendingWork: null,
      compatibilityResult: null,
    });
  },

  startSession: () => {
    const session = get().currentSession;
    set({
      currentSession: {
        ...session,
        status: 'running',
        startTime: new Date().toISOString(),
      },
    });
  },

  completeSession: () => {
    const { nextSessionWorks } = get();
    if (nextSessionWorks.length > 0) {
      set({
        currentSession: {
          id: generateId(),
          status: 'planning',
          startTime: new Date().toISOString(),
          works: nextSessionWorks,
        },
        nextSessionWorks: [],
      });
    } else {
      set({
        currentSession: createEmptySession(),
        nextSessionWorks: [],
      });
    }
  },

  resetSession: () => {
    set({
      currentSession: createEmptySession(),
      nextSessionWorks: [],
      compatibilityResult: null,
      showAddModal: false,
      pendingWork: null,
    });
  },
}));
