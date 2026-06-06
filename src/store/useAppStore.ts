import { create } from 'zustand';
import type {
  MetronomeSettings,
  TimeSignature,
  EarTrainingDifficulty,
  TrainingMode,
  RhythmResult,
  EarTrainingResult,
  ChordResult,
  DailyStats,
} from '@/types';
import { loadSettings } from '@/utils/storage';

interface AppState {
  currentMode: TrainingMode;
  metronomeSettings: MetronomeSettings;
  earDifficulty: EarTrainingDifficulty;
  practiceStartTime: number | null;
  rhythmResults: RhythmResult[];
  earResults: EarTrainingResult[];
  chordResults: ChordResult[];
  dailyStats: DailyStats[];

  setCurrentMode: (mode: TrainingMode) => void;
  setMetronomeSettings: (settings: Partial<MetronomeSettings>) => void;
  setBpm: (bpm: number) => void;
  setTimeSignature: (signature: TimeSignature) => void;
  toggleMetronome: () => void;
  setCurrentBeat: (beat: number) => void;
  setEarDifficulty: (difficulty: EarTrainingDifficulty) => void;
  startPracticeSession: () => void;
  endPracticeSession: () => number;
  addRhythmResult: (result: RhythmResult) => void;
  addEarResult: (result: EarTrainingResult) => void;
  addChordResult: (result: ChordResult) => void;
  loadAllData: () => void;
}

const savedSettings = loadSettings();

const initialMetronomeSettings: MetronomeSettings = {
  bpm: savedSettings.bpm ?? 100,
  timeSignature: (savedSettings.timeSignature as TimeSignature) ?? '4/4',
  isPlaying: false,
  currentBeat: 0,
  volume: savedSettings.volume ?? 0.5,
};

export const useAppStore = create<AppState>((set, get) => ({
  currentMode: 'metronome',
  metronomeSettings: initialMetronomeSettings,
  earDifficulty: 'single',
  practiceStartTime: null,
  rhythmResults: [],
  earResults: [],
  chordResults: [],
  dailyStats: [],

  setCurrentMode: (mode) => set({ currentMode: mode }),

  setMetronomeSettings: (settings) =>
    set((state) => ({
      metronomeSettings: { ...state.metronomeSettings, ...settings },
    })),

  setBpm: (bpm) =>
    set((state) => ({
      metronomeSettings: { ...state.metronomeSettings, bpm },
    })),

  setTimeSignature: (timeSignature) =>
    set((state) => ({
      metronomeSettings: { ...state.metronomeSettings, timeSignature },
    })),

  toggleMetronome: () =>
    set((state) => ({
      metronomeSettings: {
        ...state.metronomeSettings,
        isPlaying: !state.metronomeSettings.isPlaying,
        currentBeat: 0,
      },
    })),

  setCurrentBeat: (currentBeat) =>
    set((state) => ({
      metronomeSettings: { ...state.metronomeSettings, currentBeat },
    })),

  setEarDifficulty: (difficulty) => set({ earDifficulty: difficulty }),

  startPracticeSession: () => set({ practiceStartTime: Date.now() }),

  endPracticeSession: () => {
    const { practiceStartTime } = get();
    const duration = practiceStartTime ? Math.floor((Date.now() - practiceStartTime) / 1000) : 0;
    set({ practiceStartTime: null });
    return duration;
  },

  addRhythmResult: (result) =>
    set((state) => ({
      rhythmResults: [...state.rhythmResults, result],
    })),

  addEarResult: (result) =>
    set((state) => ({
      earResults: [...state.earResults, result],
    })),

  addChordResult: (result) =>
    set((state) => ({
      chordResults: [...state.chordResults, result],
    })),

  loadAllData: () => {
    // This will be called from components using storage utilities
  },
}));
