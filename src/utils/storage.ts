import type { DailyStats, RhythmResult, EarTrainingResult, ChordResult, MetronomeSettings } from '@/types';

const STORAGE_KEYS = {
  SETTINGS: 'music_trainer_settings',
  RHYTHM_RESULTS: 'music_trainer_rhythm_results',
  EAR_RESULTS: 'music_trainer_ear_results',
  CHORD_RESULTS: 'music_trainer_chord_results',
  DAILY_STATS: 'music_trainer_daily_stats',
};

export const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    return defaultValue;
  }
};

export const saveSettings = (settings: Partial<MetronomeSettings>): void => {
  const current = loadFromStorage<Partial<MetronomeSettings>>(STORAGE_KEYS.SETTINGS, {});
  saveToStorage(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
};

export const loadSettings = (): Partial<MetronomeSettings> => {
  return loadFromStorage<Partial<MetronomeSettings>>(STORAGE_KEYS.SETTINGS, {});
};

export const saveRhythmResult = (result: RhythmResult): void => {
  const results = loadFromStorage<RhythmResult[]>(STORAGE_KEYS.RHYTHM_RESULTS, []);
  results.push(result);
  saveToStorage(STORAGE_KEYS.RHYTHM_RESULTS, results);
};

export const loadRhythmResults = (): RhythmResult[] => {
  return loadFromStorage<RhythmResult[]>(STORAGE_KEYS.RHYTHM_RESULTS, []);
};

export const saveEarResult = (result: EarTrainingResult): void => {
  const results = loadFromStorage<EarTrainingResult[]>(STORAGE_KEYS.EAR_RESULTS, []);
  results.push(result);
  saveToStorage(STORAGE_KEYS.EAR_RESULTS, results);
};

export const loadEarResults = (): EarTrainingResult[] => {
  return loadFromStorage<EarTrainingResult[]>(STORAGE_KEYS.EAR_RESULTS, []);
};

export const saveChordResult = (result: ChordResult): void => {
  const results = loadFromStorage<ChordResult[]>(STORAGE_KEYS.CHORD_RESULTS, []);
  results.push(result);
  saveToStorage(STORAGE_KEYS.CHORD_RESULTS, results);
};

export const loadChordResults = (): ChordResult[] => {
  return loadFromStorage<ChordResult[]>(STORAGE_KEYS.CHORD_RESULTS, []);
};

const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const updateDailyStats = (
  type: 'rhythm' | 'ear' | 'chord',
  isCorrect: boolean,
  durationSeconds: number = 0
): void => {
  const stats = loadFromStorage<DailyStats[]>(STORAGE_KEYS.DAILY_STATS, []);
  const today = getTodayString();

  let todayStats = stats.find(s => s.date === today);

  if (!todayStats) {
    todayStats = {
      date: today,
      practiceDuration: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
      rhythmAccuracy: 0,
      earAccuracy: 0,
      chordAccuracy: 0,
    };
    stats.push(todayStats);
  }

  todayStats.practiceDuration += durationSeconds;
  todayStats.totalQuestions += 1;
  if (isCorrect) {
    todayStats.correctAnswers += 1;
  }
  todayStats.accuracy = todayStats.totalQuestions > 0
    ? (todayStats.correctAnswers / todayStats.totalQuestions) * 100
    : 0;

  const allRhythm = loadRhythmResults();
  const allEar = loadEarResults();
  const allChord = loadChordResults();

  const todayRhythm = allRhythm.filter(r =>
    new Date(r.timestamp).toISOString().split('T')[0] === today
  );
  const todayEar = allEar.filter(r =>
    new Date(r.timestamp).toISOString().split('T')[0] === today
  );
  const todayChord = allChord.filter(r =>
    new Date(r.timestamp).toISOString().split('T')[0] === today
  );

  todayStats.rhythmAccuracy = todayRhythm.length > 0
    ? todayRhythm.reduce((sum, r) => sum + r.accuracy, 0) / todayRhythm.length
    : 0;
  todayStats.earAccuracy = todayEar.length > 0
    ? (todayEar.filter(r => r.isCorrect).length / todayEar.length) * 100
    : 0;
  todayStats.chordAccuracy = todayChord.length > 0
    ? (todayChord.filter(r => r.isCorrect).length / todayChord.length) * 100
    : 0;

  saveToStorage(STORAGE_KEYS.DAILY_STATS, stats);
};

export const loadDailyStats = (): DailyStats[] => {
  return loadFromStorage<DailyStats[]>(STORAGE_KEYS.DAILY_STATS, []);
};

export const getLast7DaysStats = (): DailyStats[] => {
  const stats = loadDailyStats();
  const result: DailyStats[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayStats = stats.find(s => s.date === dateStr);
    if (dayStats) {
      result.push(dayStats);
    } else {
      result.push({
        date: dateStr,
        practiceDuration: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        rhythmAccuracy: 0,
        earAccuracy: 0,
        chordAccuracy: 0,
      });
    }
  }

  return result;
};
