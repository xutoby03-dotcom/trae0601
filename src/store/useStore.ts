import { create } from "zustand";
import type { Exam, InventoryBatch, Distribution, Collection } from "@/types";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

interface AppState {
  exams: Exam[];
  inventory: InventoryBatch[];
  distributions: Distribution[];
  collections: Collection[];

  addExam: (exam: Omit<Exam, "id" | "createdAt">) => void;
  deleteExam: (id: string) => void;

  addBatch: (batch: Omit<InventoryBatch, "id" | "createdAt" | "remainingQuantity">) => void;
  deleteBatch: (id: string) => void;

  addDistribution: (dist: Omit<Distribution, "id" | "distributedAt">) => void;
  deleteDistribution: (id: string) => void;

  addCollection: (col: Omit<Collection, "id" | "isLocked" | "collectedAt">) => void;
  unlockCollection: (id: string) => void;

  getPendingDistributionExams: () => Exam[];
  getPendingCollectionDistributions: () => Distribution[];
  getAnomalyCollections: () => (Collection & { roomNumber: string })[];
  getRoomUsageData: () => { room: string; distributed: number; collected: number }[];
  getTotalRemaining: () => number;
}

const STORAGE_KEY = "draft-paper-system";

function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        exams: parsed.exams || [],
        inventory: parsed.inventory || [],
        distributions: parsed.distributions || [],
        collections: parsed.collections || [],
      };
    }
  } catch {}
  return {};
}

function saveState(state: Pick<AppState, "exams" | "inventory" | "distributions" | "collections">) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      exams: state.exams,
      inventory: state.inventory,
      distributions: state.distributions,
      collections: state.collections,
    }));
  } catch {}
}

const persisted = loadState();

export const useStore = create<AppState>((set, get) => ({
  exams: (persisted.exams as Exam[]) || [],
  inventory: (persisted.inventory as InventoryBatch[]) || [],
  distributions: (persisted.distributions as Distribution[]) || [],
  collections: (persisted.collections as Collection[]) || [],

  addExam: (exam) => {
    const newExam: Exam = { ...exam, id: generateId(), createdAt: new Date().toISOString() };
    set((state) => {
      const exams = [...state.exams, newExam];
      saveState({ ...state, exams });
      return { exams };
    });
  },

  deleteExam: (id) => {
    set((state) => {
      const exams = state.exams.filter((e) => e.id !== id);
      saveState({ ...state, exams });
      return { exams };
    });
  },

  addBatch: (batch) => {
    const newBatch: InventoryBatch = {
      ...batch,
      id: generateId(),
      remainingQuantity: batch.totalQuantity,
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const inventory = [...state.inventory, newBatch];
      saveState({ ...state, inventory });
      return { inventory };
    });
  },

  deleteBatch: (id) => {
    set((state) => {
      const inventory = state.inventory.filter((b) => b.id !== id);
      saveState({ ...state, inventory });
      return { inventory };
    });
  },

  addDistribution: (dist) => {
    const newDist: Distribution = { ...dist, id: generateId(), distributedAt: new Date().toISOString() };
    set((state) => {
      const distributions = [...state.distributions, newDist];
      const inventory = state.inventory.map((b) =>
        b.id === dist.batchId ? { ...b, remainingQuantity: Math.max(0, b.remainingQuantity - dist.quantity) } : b
      );
      saveState({ ...state, distributions, inventory });
      return { distributions, inventory };
    });
  },

  deleteDistribution: (id) => {
    set((state) => {
      const dist = state.distributions.find((d) => d.id === id);
      const distributions = state.distributions.filter((d) => d.id !== id);
      let inventory = state.inventory;
      if (dist) {
        inventory = state.inventory.map((b) =>
          b.id === dist.batchId ? { ...b, remainingQuantity: b.remainingQuantity + dist.quantity } : b
        );
      }
      saveState({ ...state, distributions, inventory });
      return { distributions, inventory };
    });
  },

  addCollection: (col) => {
    const isLocked = col.missingCount > 0;
    const newCol: Collection = { ...col, id: generateId(), isLocked, collectedAt: new Date().toISOString() };
    set((state) => {
      const collections = [...state.collections, newCol];
      saveState({ ...state, collections });
      return { collections };
    });
  },

  unlockCollection: (id) => {
    set((state) => {
      const collections = state.collections.map((c) => (c.id === id ? { ...c, isLocked: false } : c));
      saveState({ ...state, collections });
      return { collections };
    });
  },

  getPendingDistributionExams: () => {
    const { exams, distributions } = get();
    const distributedExamIds = new Set(distributions.map((d) => d.examId));
    return exams.filter((e) => !distributedExamIds.has(e.id));
  },

  getPendingCollectionDistributions: () => {
    const { distributions, collections } = get();
    const collectedDistIds = new Set(collections.map((c) => c.distributionId));
    return distributions.filter((d) => !collectedDistIds.has(d.id));
  },

  getAnomalyCollections: () => {
    const { collections, distributions } = get();
    return collections
      .filter((c) => c.missingCount > 0 || c.abnormalNote.trim() !== "")
      .map((c) => {
        const dist = distributions.find((d) => d.id === c.distributionId);
        return { ...c, roomNumber: dist?.roomNumber || "未知" };
      });
  },

  getRoomUsageData: () => {
    const { distributions, collections } = get();
    const roomMap = new Map<string, { distributed: number; collected: number }>();
    distributions.forEach((d) => {
      const existing = roomMap.get(d.roomNumber) || { distributed: 0, collected: 0 };
      existing.distributed += d.quantity;
      roomMap.set(d.roomNumber, existing);
    });
    collections.forEach((c) => {
      const dist = distributions.find((d) => d.id === c.distributionId);
      if (dist) {
        const existing = roomMap.get(dist.roomNumber) || { distributed: 0, collected: 0 };
        existing.collected += c.usedCount + c.blankCount + c.missingCount;
        roomMap.set(dist.roomNumber, existing);
      }
    });
    return Array.from(roomMap.entries()).map(([room, data]) => ({ room, ...data }));
  },

  getTotalRemaining: () => {
    const { inventory } = get();
    return inventory.reduce((sum, b) => sum + b.remainingQuantity, 0);
  },
}));
