import { create } from 'zustand';
import { ScoreState, Score, Note, generateId, Measure, DURATION_VALUES, VoiceType, PitchNumber, NoteDuration } from '../types/score';

const createInitialMeasure = (timeSignature: { numerator: number; denominator: number }): Measure => ({
  id: generateId(),
  melody: [],
  harmony: [],
  timeSignature,
});

const createInitialScore = (): Score => {
  const timeSignature = { numerator: 4, denominator: 4 };
  return {
    id: generateId(),
    title: '未命名乐谱',
    bpm: 80,
    key: 'C',
    timeSignature,
    measures: [createInitialMeasure(timeSignature)],
    activeVoice: 'melody',
    selectedNoteId: null,
    currentDuration: 'quarter',
    isPlaying: false,
    currentPlayPosition: 0,
  };
};

const getMeasureDuration = (measure: Measure, voice: VoiceType): number => {
  const notes = voice === 'melody' ? measure.melody : measure.harmony;
  return notes.reduce((sum, note) => sum + DURATION_VALUES[note.duration], 0);
};

const getVoiceArray = (measure: Measure, voice: VoiceType): Note[] => {
  return voice === 'melody' ? measure.melody : measure.harmony;
};

const setVoiceArray = (measure: Measure, voice: VoiceType, notes: Note[]): Measure => {
  return {
    ...measure,
    melody: voice === 'melody' ? notes : measure.melody,
    harmony: voice === 'harmony' ? notes : measure.harmony,
  };
};

export const useScoreStore = create<ScoreState>((set, get) => ({
  score: createInitialScore(),

  setBpm: (bpm: number) =>
    set((state) => ({
      score: { ...state.score, bpm },
    })),

  setCurrentDuration: (duration: NoteDuration) =>
    set((state) => ({
      score: { ...state.score, currentDuration: duration },
    })),

  addNote: (pitch: PitchNumber | null) => {
    const { score } = get();
    const { activeVoice, currentDuration, timeSignature } = score;
    const beatsPerMeasure = timeSignature.numerator;

    const updatedMeasures = [...score.measures];
    let lastMeasure = updatedMeasures[updatedMeasures.length - 1];

    const noteValue = DURATION_VALUES[currentDuration];
    const currentVoiceDuration = getMeasureDuration(lastMeasure, activeVoice);

    if (currentVoiceDuration + noteValue > beatsPerMeasure) {
      const newMeasure = createInitialMeasure(timeSignature);
      updatedMeasures.push(newMeasure);
      lastMeasure = newMeasure;
    }

    const voiceNotes = getVoiceArray(lastMeasure, activeVoice);

    const newNote: Note = {
      id: generateId(),
      pitch,
      duration: currentDuration,
      octave: 0,
      accidental: 'none',
      voice: activeVoice,
      lyrics: '',
      position: voiceNotes.length,
    };

    const updatedVoiceNotes = [...voiceNotes, newNote];
    const updatedLastMeasure = setVoiceArray(lastMeasure, activeVoice, updatedVoiceNotes);
    updatedMeasures[updatedMeasures.length - 1] = updatedLastMeasure;

    set((state) => ({
      score: {
        ...state.score,
        measures: updatedMeasures,
        selectedNoteId: newNote.id,
      },
    }));
  },

  removeNote: (noteId: string) => {
    const { score } = get();

    const updatedMeasures = score.measures.map((measure) => {
      const updatedMelody = measure.melody.filter((n) => n.id !== noteId);
      const updatedHarmony = measure.harmony.filter((n) => n.id !== noteId);
      return { ...measure, melody: updatedMelody, harmony: updatedHarmony };
    });

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
      melody: measure.melody.map((note) =>
        note.id === noteId ? { ...note, ...updates } : note
      ),
      harmony: measure.harmony.map((note) =>
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
    const newMeasure = createInitialMeasure(score.timeSignature);

    set((state) => ({
      score: {
        ...state.score,
        measures: [...state.score.measures, newMeasure],
      },
    }));
  },
}));
