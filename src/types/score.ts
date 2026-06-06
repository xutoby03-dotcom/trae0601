export type NoteDuration = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth';

export type PitchNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type OctaveShift = -1 | 0 | 1;

export type Accidental = 'none' | 'sharp' | 'flat';

export type VoiceType = 'melody' | 'harmony';

export interface Note {
  id: string;
  pitch: PitchNumber | null;
  duration: NoteDuration;
  octave: OctaveShift;
  accidental: Accidental;
  voice: VoiceType;
  lyrics: string;
  position: number;
}

export interface Measure {
  id: string;
  notes: Note[];
  timeSignature: { numerator: number; denominator: number };
}

export interface Score {
  id: string;
  title: string;
  bpm: number;
  key: string;
  timeSignature: { numerator: number; denominator: number };
  measures: Measure[];
  activeVoice: VoiceType;
  selectedNoteId: string | null;
  currentDuration: NoteDuration;
  isPlaying: boolean;
  currentPlayPosition: number;
}

export interface ScoreState {
  score: Score;
  setBpm: (bpm: number) => void;
  setCurrentDuration: (duration: NoteDuration) => void;
  addNote: (pitch: PitchNumber | null) => void;
  removeNote: (noteId: string) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  setActiveVoice: (voice: VoiceType) => void;
  setSelectedNote: (noteId: string | null) => void;
  togglePlay: () => void;
  setPlayPosition: (position: number) => void;
  stopPlay: () => void;
  addMeasure: () => void;
}

export const DURATION_VALUES: Record<NoteDuration, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
};

export const DURATION_LABELS: Record<NoteDuration, string> = {
  whole: '全音符',
  half: '二分音符',
  quarter: '四分音符',
  eighth: '八分音符',
  sixteenth: '十六分音符',
};

export const VOICE_COLORS: Record<VoiceType, string> = {
  melody: '#3b82f6',
  harmony: '#10b981',
};

export const PITCH_FREQUENCIES: Record<string, number> = {
  '1-1': 261.63, '2-1': 293.66, '3-1': 329.63, '4-1': 349.23,
  '5-1': 392.00, '6-1': 440.00, '7-1': 493.88,
  '10': 523.25, '20': 587.33, '30': 659.25, '40': 698.46,
  '50': 783.99, '60': 880.00, '70': 987.77,
  '11': 1046.50, '21': 1174.66, '31': 1318.51, '41': 1396.91,
  '51': 1567.98, '61': 1760.00, '71': 1975.53,
};

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
