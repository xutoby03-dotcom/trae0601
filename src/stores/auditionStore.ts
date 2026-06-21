import { create } from 'zustand';
import type { AuditionScore } from '@/types';
import { generateId, now } from '@/utils/helpers';
import { AUDITION_PASSAGES } from '@/utils/constants';

interface AuditionState {
  scores: Record<string, AuditionScore[]>;
  isRecording: boolean;
  draftBalance: number;
  draftClarity: number;
  draftBlend: number;
  draftComment: string;
  draftPassage: string;

  startRecording: () => void;
  stopRecording: () => void;
  setDraftBalance: (v: number) => void;
  setDraftClarity: (v: number) => void;
  setDraftBlend: (v: number) => void;
  setDraftComment: (v: string) => void;
  setDraftPassage: (v: string) => void;
  resetDraft: () => void;

  saveScore: (schemeId: string) => AuditionScore;
  deleteScore: (schemeId: string, scoreId: string) => void;
  getScores: (schemeId: string) => AuditionScore[];
  getLatestScore: (schemeId: string) => AuditionScore | undefined;
  computeDraftOverall: () => number;
}

const STORAGE_KEY = 'choir_audition_scores_v1';

function loadFromStorage(): Record<string, AuditionScore[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function saveToStorage(data: Record<string, AuditionScore[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export const useAuditionStore = create<AuditionState>((set, get) => ({
  scores: loadFromStorage(),
  isRecording: false,
  draftBalance: 75,
  draftClarity: 75,
  draftBlend: 75,
  draftComment: '',
  draftPassage: AUDITION_PASSAGES[0],

  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),

  setDraftBalance: (v) => set({ draftBalance: v }),
  setDraftClarity: (v) => set({ draftClarity: v }),
  setDraftBlend: (v) => set({ draftBlend: v }),
  setDraftComment: (v) => set({ draftComment: v }),
  setDraftPassage: (v) => set({ draftPassage: v }),

  resetDraft: () =>
    set({
      draftBalance: 75,
      draftClarity: 75,
      draftBlend: 75,
      draftComment: '',
      draftPassage: AUDITION_PASSAGES[0],
      isRecording: false,
    }),

  saveScore: (schemeId) => {
    const state = get();
    const overall = state.computeDraftOverall();

    const score: AuditionScore = {
      id: generateId('sc'),
      schemeId,
      passage: state.draftPassage,
      balance: state.draftBalance,
      clarity: state.draftClarity,
      blend: state.draftBlend,
      comment: state.draftComment,
      recordedAt: now(),
    };

    set((s) => {
      const current = s.scores[schemeId] || [];
      const next = {
        ...s.scores,
        [schemeId]: [...current, score],
      };
      saveToStorage(next);
      return { scores: next, isRecording: false };
    });

    return {
      ...score,
      balance: overall,
    };
  },

  deleteScore: (schemeId, scoreId) => {
    set((s) => {
      const current = s.scores[schemeId] || [];
      const next = {
        ...s.scores,
        [schemeId]: current.filter((x) => x.id !== scoreId),
      };
      saveToStorage(next);
      return { scores: next };
    });
  },

  getScores: (schemeId) => get().scores[schemeId] || [],

  getLatestScore: (schemeId) => {
    const list = get().scores[schemeId] || [];
    if (list.length === 0) return undefined;
    return [...list].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    )[0];
  },

  computeDraftOverall: () => {
    const s = get();
    return Math.round(s.draftBalance * 0.4 + s.draftClarity * 0.3 + s.draftBlend * 0.3);
  },
}));
