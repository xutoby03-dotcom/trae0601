import type { ChordType } from '@/types';

export const CHORD_INTERVALS: Record<ChordType, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
};

export const CHORD_NAMES: Record<ChordType, string> = {
  major: '大三和弦',
  minor: '小三和弦',
  diminished: '减三和弦',
  augmented: '增三和弦',
};

export const getChordNotes = (rootMidi: number, chordType: ChordType): number[] => {
  const intervals = CHORD_INTERVALS[chordType];
  return intervals.map(interval => rootMidi + interval);
};

export const getSeventhChordNotes = (rootMidi: number, seventhType: 'dominant' | 'major' | 'minor' | 'diminished'): number[] => {
  const triadIntervals: Record<string, number[]> = {
    dominant: [0, 4, 7],
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
  };
  const seventhInterval: Record<string, number> = {
    dominant: 10,
    major: 11,
    minor: 10,
    diminished: 9,
  };
  return [...triadIntervals[seventhType], seventhInterval[seventhType]].map(i => rootMidi + i);
};

export const getRandomRootNote = (minMidi: number = 48, maxMidi: number = 72): number => {
  return Math.floor(Math.random() * (maxMidi - minMidi + 1)) + minMidi;
};

export const getRandomChordType = (): ChordType => {
  const types: ChordType[] = ['major', 'minor', 'diminished', 'augmented'];
  return types[Math.floor(Math.random() * types.length)];
};

export const INTERVAL_NAMES: Record<number, string> = {
  0: '纯一度',
  1: '小二度',
  2: '大二度',
  3: '小三度',
  4: '大三度',
  5: '纯四度',
  6: '增四度/减五度',
  7: '纯五度',
  8: '小六度',
  9: '大六度',
  10: '小七度',
  11: '大七度',
  12: '纯八度',
};

export const getIntervalName = (midi1: number, midi2: number): string => {
  const interval = Math.abs(midi2 - midi1) % 12;
  return INTERVAL_NAMES[interval] || '未知';
};
