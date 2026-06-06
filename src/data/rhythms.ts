import type { RhythmPattern } from '@/types';

export const RHYTHM_PATTERNS: RhythmPattern[] = [
  {
    id: 'basic-4-4',
    name: '基础四分音符 4/4',
    bpm: 100,
    beats: [
      { time: 0, duration: 'quarter', isAccented: true },
      { time: 1, duration: 'quarter' },
      { time: 2, duration: 'quarter' },
      { time: 3, duration: 'quarter' },
    ],
  },
  {
    id: 'half-quarter-4-4',
    name: '二分+四分 4/4',
    bpm: 100,
    beats: [
      { time: 0, duration: 'half', isAccented: true },
      { time: 2, duration: 'quarter' },
      { time: 3, duration: 'quarter' },
    ],
  },
  {
    id: 'eighth-basic-4-4',
    name: '半八八四八四 4/4',
    bpm: 100,
    beats: [
      { time: 0, duration: 'eighth', isAccented: true },
      { time: 0.5, duration: 'eighth' },
      { time: 1, duration: 'eighth' },
      { time: 1.5, duration: 'eighth' },
      { time: 2, duration: 'quarter' },
      { time: 3, duration: 'eighth' },
      { time: 3.5, duration: 'eighth' },
      { time: 4, duration: 'quarter' },
    ],
  },
  {
    id: 'eighth-pairs-4-4',
    name: '八分音符对 4/4',
    bpm: 100,
    beats: [
      { time: 0, duration: 'eighth', isAccented: true },
      { time: 0.5, duration: 'eighth' },
      { time: 1, duration: 'eighth' },
      { time: 1.5, duration: 'eighth' },
      { time: 2, duration: 'eighth', isAccented: true },
      { time: 2.5, duration: 'eighth' },
      { time: 3, duration: 'eighth' },
      { time: 3.5, duration: 'eighth' },
    ],
  },
  {
    id: 'syncopation-4-4',
    name: '切分节奏 4/4',
    bpm: 90,
    beats: [
      { time: 0, duration: 'quarter', isAccented: true },
      { time: 1.5, duration: 'eighth' },
      { time: 2, duration: 'quarter' },
      { time: 3, duration: 'eighth' },
      { time: 3.5, duration: 'eighth' },
    ],
  },
  {
    id: 'triplet-3-4',
    name: '三拍子基础 3/4',
    bpm: 90,
    beats: [
      { time: 0, duration: 'quarter', isAccented: true },
      { time: 1, duration: 'quarter' },
      { time: 2, duration: 'quarter' },
    ],
  },
  {
    id: 'waltz-3-4',
    name: '华尔兹节奏 3/4',
    bpm: 120,
    beats: [
      { time: 0, duration: 'half', isAccented: true },
      { time: 2, duration: 'quarter' },
    ],
  },
  {
    id: 'sixteenth-basic-4-4',
    name: '十六分音符练习 4/4',
    bpm: 80,
    beats: [
      { time: 0, duration: 'sixteenth', isAccented: true },
      { time: 0.25, duration: 'sixteenth' },
      { time: 0.5, duration: 'sixteenth' },
      { time: 0.75, duration: 'sixteenth' },
      { time: 1, duration: 'sixteenth' },
      { time: 1.25, duration: 'sixteenth' },
      { time: 1.5, duration: 'sixteenth' },
      { time: 1.75, duration: 'sixteenth' },
      { time: 2, duration: 'quarter', isAccented: true },
      { time: 3, duration: 'eighth' },
      { time: 3.5, duration: 'eighth' },
    ],
  },
];
