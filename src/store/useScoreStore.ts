import { create } from 'zustand';
import { ScoreState, Score, Note, generateId, Measure } from '../types/score';

const createInitialScore = (): Score => {
  const firstMeasure: Measure = {
    id: generateId(),
    notes: [],
    timeSignature: { numerator: 4, denominator: 4 },
  };

  return {
    id: generateId(),
    title: '未命名乐谱',
    bpm: 80,
    key: 'C',
    timeSignature: { numerator: 4, denominator: 4 },
    measures: [firstMeasure],
    activeVoice: 'melody',
    selectedNoteId: null,
    currentDuration: 'quarter',
    isPlaying: false,
    currentPlayPosition: 0,
  };
};

export const useScoreStore = create<ScoreState>((set, get) => ({
  score: createInitialScore(),

  setBpm: (bpm: number) =>
    set((state) => ({
      score: { ...state.score, bpm },
    })),

  setCurrentDuration: (duration) =>
    set((state) => ({
      score: { ...state.score, currentDuration: duration },
    })),

  addNote: (pitch) => {
    const { score } = get();
    const lastMeasure = score.measures[score.measures.length - 1];

    const newNote: Note = {
      id: generateId(),
      pitch,
      duration: score.currentDuration,
      octave: 0,
      accidental: 'none',
      voice: score.activeVoice,
      lyrics: '',
      position: lastMeasure.notes.length,
    };

    const updatedMeasures = score.measures.map((measure, idx) => {
      if (idx === score.measures.length - 1) {
        return { ...measure, notes: [...measure.notes, newNote] };
      }
      return measure;
    });

    set((state) => ({
      score: {
        ...state.score,
        measures: updatedMeasures,
        selectedNoteId: newNote.id,
      },
    }));
  },

  removeNote: (noteId) => {
    const { score } = get();

    const updatedMeasures = score.measures.map((measure) => ({
      ...measure,
      notes: measure.notes.filter((n) => n.id !== noteId),
    }));

    set((state) => ({
      score: {
        ...state.score,
        measures: updatedMeasures,
        selectedNoteId: null,
      },
    }));
  },

  updateNote: (noteId, updates) => {
    const { score } = get();

    const updatedMeasures = score.measures.map((measure) => ({
      ...measure,
      notes: measure.notes.map((note) =>
        note.id === noteId ? { ...note, ...updates } : note
      ),
    }));

    set((state) => ({
      score: {
        ...state.score,
        measures: updatedMeasures,
      },
    }));
  },

  setActiveVoice: (voice) =>
    set((state) => ({
      score: { ...state.score, activeVoice: voice },
    })),

  setSelectedNote: (noteId) =>
    set((state) => ({
      score: { ...state.score, selectedNoteId: noteId },
    })),

  togglePlay: () =>
    set((state) => ({
      score: {
        ...state.score,
        isPlaying: !state.score.isPlaying,
        currentPlayPosition: state.score.isPlaying ? 0 : state.score.currentPlayPosition,
      },
    })),

  stopPlay: () =>
    set((state) => ({
      score: {
        ...state.score,
        isPlaying: false,
        currentPlayPosition: 0,
      },
    })),

  setPlayPosition: (position) =>
    set((state) => ({
      score: { ...state.score, currentPlayPosition: position },
    })),

  addMeasure: () => {
    const { score } = get();
    const newMeasure: Measure = {
      id: generateId(),
      notes: [],
      timeSignature: score.timeSignature,
    };

    set((state) => ({
      score: {
        ...state.score,
        measures: [...state.score.measures, newMeasure],
      },
    }));
  },
}));
