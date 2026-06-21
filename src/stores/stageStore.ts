import { create } from 'zustand';
import type { StagePosition, Scheme } from '@/types';
import { generateId, now } from '@/utils/helpers';
import { STAGE_CONFIG } from '@/utils/constants';
import { buildInitialScheme, MOCK_MEMBERS } from '@/mock/seedData';

interface StageState {
  scheme: Scheme;
  setGridSize: (rows: number, cols: number) => void;
  placeMember: (row: number, col: number, memberId: string | null) => void;
  moveMember: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  removeMemberAt: (row: number, col: number) => void;
  clearStage: () => void;
  updateSchemeName: (name: string) => void;
  updateSchemeNotes: (notes: string) => void;
  loadScheme: (scheme: Scheme) => void;
  applySchemeScore: (score: number) => void;
  getPositionAt: (row: number, col: number) => StagePosition | undefined;
}

const STORAGE_KEY = 'choir_current_scheme_v1';

function emptyPositions(schemeId: string, rows: number, cols: number): StagePosition[] {
  const positions: StagePosition[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({
        id: generateId('pos'),
        schemeId,
        memberId: null,
        row: r,
        col: c,
      });
    }
  }
  return positions;
}

function createBlankScheme(): Scheme {
  const schemeId = generateId('sch');
  const rows = STAGE_CONFIG.DEFAULT_ROWS;
  const cols = STAGE_CONFIG.DEFAULT_COLS;
  return {
    id: schemeId,
    name: '新站位方案',
    notes: '',
    gridRows: rows,
    gridCols: cols,
    positions: emptyPositions(schemeId, rows, cols),
    createdAt: now(),
    updatedAt: now(),
    overallScore: 0,
  };
}

function loadFromStorage(): Scheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return buildInitialScheme(MOCK_MEMBERS);
}

function saveToStorage(scheme: Scheme) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scheme));
  } catch {}
}

export const useStageStore = create<StageState>((set, get) => ({
  scheme: loadFromStorage(),

  setGridSize: (rows, cols) => {
    set((state) => {
      const oldPosMap = new Map<string, StagePosition>();
      state.scheme.positions.forEach((p) => {
        if (p.row < rows && p.col < cols) {
          oldPosMap.set(`${p.row}-${p.col}`, p);
        }
      });

      const positions: StagePosition[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const key = `${r}-${c}`;
          const old = oldPosMap.get(key);
          positions.push({
            id: old?.id || generateId('pos'),
            schemeId: state.scheme.id,
            memberId: old?.memberId ?? null,
            row: r,
            col: c,
          });
        }
      }

      const next: Scheme = {
        ...state.scheme,
        gridRows: rows,
        gridCols: cols,
        positions,
        updatedAt: now(),
      };
      saveToStorage(next);
      return { scheme: next };
    });
  },

  placeMember: (row, col, memberId) => {
    set((state) => {
      const positions = state.scheme.positions.map((p) => {
        if (p.memberId === memberId && memberId !== null) {
          return { ...p, memberId: null };
        }
        return p;
      });

      const idx = positions.findIndex((p) => p.row === row && p.col === col);
      if (idx !== -1) {
        positions[idx] = { ...positions[idx], memberId };
      }

      const next: Scheme = {
        ...state.scheme,
        positions,
        updatedAt: now(),
      };
      saveToStorage(next);
      return { scheme: next };
    });
  },

  moveMember: (fromRow, fromCol, toRow, toCol) => {
    set((state) => {
      const positions = state.scheme.positions.map((p) => ({ ...p }));
      const fromIdx = positions.findIndex((p) => p.row === fromRow && p.col === fromCol);
      const toIdx = positions.findIndex((p) => p.row === toRow && p.col === toCol);
      if (fromIdx === -1 || toIdx === -1) return state;

      const fromMemberId = positions[fromIdx].memberId;
      const toMemberId = positions[toIdx].memberId;

      positions[fromIdx].memberId = toMemberId;
      positions[toIdx].memberId = fromMemberId;

      const next: Scheme = {
        ...state.scheme,
        positions,
        updatedAt: now(),
      };
      saveToStorage(next);
      return { scheme: next };
    });
  },

  removeMemberAt: (row, col) => {
    set((state) => {
      const positions = state.scheme.positions.map((p) =>
        p.row === row && p.col === col ? { ...p, memberId: null } : p
      );
      const next: Scheme = {
        ...state.scheme,
        positions,
        updatedAt: now(),
      };
      saveToStorage(next);
      return { scheme: next };
    });
  },

  clearStage: () => {
    set((state) => {
      const positions = state.scheme.positions.map((p) => ({ ...p, memberId: null }));
      const next: Scheme = {
        ...state.scheme,
        positions,
        updatedAt: now(),
        overallScore: 0,
      };
      saveToStorage(next);
      return { scheme: next };
    });
  },

  updateSchemeName: (name) => {
    set((state) => {
      const next = { ...state.scheme, name, updatedAt: now() };
      saveToStorage(next);
      return { scheme: next };
    });
  },

  updateSchemeNotes: (notes) => {
    set((state) => {
      const next = { ...state.scheme, notes, updatedAt: now() };
      saveToStorage(next);
      return { scheme: next };
    });
  },

  loadScheme: (scheme) => {
    const next = { ...scheme, updatedAt: now() };
    saveToStorage(next);
    set({ scheme: next });
  },

  applySchemeScore: (score) => {
    set((state) => {
      const next = { ...state.scheme, overallScore: score, updatedAt: now() };
      saveToStorage(next);
      return { scheme: next };
    });
  },

  getPositionAt: (row, col) =>
    get().scheme.positions.find((p) => p.row === row && p.col === col),
}));

export function createNewBlankScheme(): Scheme {
  return createBlankScheme();
}
