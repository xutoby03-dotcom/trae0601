import { create } from 'zustand';
import type { QueryResult, Theme } from '@/types';

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
  setTheme: (theme: Theme) => void;
  setSql: (sql: string) => void;
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

export const useEditorStore = create<EditorState>((set, get) => ({
  theme: getInitialTheme(),
  sql: '-- Welcome to SQL Practice Platform!\n-- Select a database and start writing SQL\n\nSELECT * FROM Customers LIMIT 10;',
  result: null,
  isExecuting: false,
  showExecutionPlan: false,
  showSettings: false,
  showHistory: false,
  currentProblemId: null,
  problemResultMatch: null,

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('sql-theme', theme);
  },

  setSql: (sql) => set({ sql }),
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
