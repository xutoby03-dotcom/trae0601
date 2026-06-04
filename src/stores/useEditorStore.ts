import { create } from 'zustand';
import type { QueryResult, Theme } from '@/types';

const MAX_HISTORY = 200;

interface EditorState {
  theme: Theme;
  sql: string;
  result: QueryResult | null;
  isExecuting: boolean;
  showExecutionPlan: boolean;
  showSettings: boolean;
  showHistory: boolean;
  currentProblemId: number | null;
  problemResultMatch: boolean | null;
  _sqlHistory: string[];
  _historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  setTheme: (theme: Theme) => void;
  setSql: (sql: string, skipHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  setResult: (result: QueryResult | null) => void;
  setIsExecuting: (isExecuting: boolean) => void;
  setShowExecutionPlan: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setCurrentProblemId: (id: number | null) => void;
  setProblemResultMatch: (match: boolean | null) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sql-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

const initialSql = '-- Welcome to SQL Practice Platform!\n-- Select a database and start writing SQL\n\nSELECT * FROM Customers LIMIT 10;';

export const useEditorStore = create<EditorState>((set, get) => ({
  theme: getInitialTheme(),
  sql: initialSql,
  result: null,
  isExecuting: false,
  showExecutionPlan: false,
  showSettings: false,
  showHistory: false,
  currentProblemId: null,
  problemResultMatch: null,
  _sqlHistory: [initialSql],
  _historyIndex: 0,
  canUndo: false,
  canRedo: false,

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('sql-theme', theme);
  },

  setSql: (sql, skipHistory = false) => {
    if (skipHistory) {
      set({ sql });
      return;
    }
    const { _sqlHistory, _historyIndex } = get();
    const newHistory = _sqlHistory.slice(0, _historyIndex + 1);
    newHistory.push(sql);
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    const newIndex = newHistory.length - 1;
    set({
      sql,
      _sqlHistory: newHistory,
      _historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: false,
    });
  },

  undo: () => {
    const { _sqlHistory, _historyIndex } = get();
    if (_historyIndex <= 0) return;
    const newIndex = _historyIndex - 1;
    set({
      sql: _sqlHistory[newIndex],
      _historyIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
    });
  },

  redo: () => {
    const { _sqlHistory, _historyIndex } = get();
    if (_historyIndex >= _sqlHistory.length - 1) return;
    const newIndex = _historyIndex + 1;
    set({
      sql: _sqlHistory[newIndex],
      _historyIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < _sqlHistory.length - 1,
    });
  },

  setResult: (result) => set({ result }),
  setIsExecuting: (isExecuting) => set({ isExecuting }),
  setShowExecutionPlan: (show) => set({ showExecutionPlan: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setShowHistory: (show) => set({ showHistory: show }),
  setCurrentProblemId: (id) => set({ currentProblemId: id, problemResultMatch: null }),
  setProblemResultMatch: (match) => set({ problemResultMatch: match }),

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: newTheme });
    localStorage.setItem('sql-theme', newTheme);
  },
}));
