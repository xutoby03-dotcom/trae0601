import { create } from 'zustand';
import type { Score } from '@/types';
import { getStorage, setStorage } from '@/utils/storage';
import { mockScores } from '@/utils/mockData';

const STORAGE_KEY = 'chorus_scores';

interface ScoreState {
  scores: Score[];
  fetchScores: () => void;
  addScore: (score: Omit<Score, 'id' | 'created_at' | 'updated_at'>) => void;
  updateScore: (id: string, score: Partial<Score>) => void;
  deleteScore: (id: string) => void;
  getScoreById: (id: string) => Score | undefined;
}

const initializeScores = (): Score[] => {
  const stored = getStorage<Score[] | null>(STORAGE_KEY, null);
  if (stored && stored.length > 0) {
    return stored;
  }
  setStorage(STORAGE_KEY, mockScores);
  return mockScores;
};

export const useScoreStore = create<ScoreState>((set, get) => ({
  scores: initializeScores(),

  fetchScores: () => {
    const scores = getStorage<Score[]>(STORAGE_KEY, []);
    set({ scores });
  },

  addScore: (scoreData) => {
    const now = new Date().toISOString();
    const newScore: Score = {
      ...scoreData,
      id: `score-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };
    const scores = [...get().scores, newScore];
    set({ scores });
    setStorage(STORAGE_KEY, scores);
  },

  updateScore: (id, scoreData) => {
    const scores = get().scores.map((score) =>
      score.id === id
        ? { ...score, ...scoreData, updated_at: new Date().toISOString() }
        : score
    );
    set({ scores });
    setStorage(STORAGE_KEY, scores);
  },

  deleteScore: (id) => {
    const scores = get().scores.filter((score) => score.id !== id);
    set({ scores });
    setStorage(STORAGE_KEY, scores);
  },

  getScoreById: (id) => {
    return get().scores.find((score) => score.id === id);
  },
}));
