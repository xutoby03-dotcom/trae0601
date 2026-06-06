export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';

export interface MetronomeSettings {
  bpm: number;
  timeSignature: TimeSignature;
  isPlaying: boolean;
  currentBeat: number;
  volume: number;
}

export type NoteDuration = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth';

export interface RhythmBeat {
  time: number;
  duration: NoteDuration;
  isAccented?: boolean;
}

export interface RhythmPattern {
  id: string;
  name: string;
  beats: RhythmBeat[];
  bpm: number;
}

export interface RhythmHit {
  expectedTime: number;
  actualTime: number;
  deviation: number;
  isCorrect: boolean;
}

export interface RhythmResult {
  patternId: string;
  hits: RhythmHit[];
  accuracy: number;
  timestamp: number;
}

export type EarTrainingDifficulty = 'single' | 'double' | 'interval' | 'triad' | 'seventh';

export interface EarTrainingQuestion {
  id: string;
  difficulty: EarTrainingDifficulty;
  notes: number[];
}

export interface EarTrainingResult {
  questionId: string;
  userAnswer: number[];
  isCorrect: boolean;
  timestamp: number;
}

export type ChordType = 'major' | 'minor' | 'diminished' | 'augmented';

export interface ChordQuestion {
  id: string;
  rootNote: number;
  chordType: ChordType;
}

export interface ChordResult {
  questionId: string;
  userAnswer: ChordType;
  correctAnswer: ChordType;
  isCorrect: boolean;
  timestamp: number;
}

export interface DailyStats {
  date: string;
  practiceDuration: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  rhythmAccuracy: number;
  earAccuracy: number;
  chordAccuracy: number;
}

export interface Statistics {
  dailyStats: DailyStats[];
  totalPracticeTime: number;
  overallAccuracy: number;
}

export type TrainingMode = 'metronome' | 'rhythm' | 'ear' | 'chord' | 'statistics';
