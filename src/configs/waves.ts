import { WaveConfig } from '../types';

export const WAVE_CONFIGS: WaveConfig[] = [
  {
    waveNumber: 1,
    delay: 3000,
    monsters: [{ type: 'normal', count: 5, interval: 1000 }],
  },
  {
    waveNumber: 2,
    delay: 5000,
    monsters: [{ type: 'normal', count: 8, interval: 900 }],
  },
  {
    waveNumber: 3,
    delay: 5000,
    monsters: [
      { type: 'normal', count: 6, interval: 800 },
      { type: 'armored', count: 2, interval: 1500 },
    ],
  },
  {
    waveNumber: 4,
    delay: 5000,
    monsters: [
      { type: 'normal', count: 5, interval: 700 },
      { type: 'flying', count: 4, interval: 1000 },
    ],
  },
  {
    waveNumber: 5,
    delay: 5000,
    monsters: [
      { type: 'armored', count: 5, interval: 1200 },
      { type: 'normal', count: 5, interval: 600 },
    ],
  },
  {
    waveNumber: 6,
    delay: 5000,
    monsters: [
      { type: 'normal', count: 8, interval: 600 },
      { type: 'flying', count: 5, interval: 800 },
      { type: 'armored', count: 3, interval: 1500 },
    ],
  },
  {
    waveNumber: 7,
    delay: 5000,
    monsters: [
      { type: 'armored', count: 6, interval: 1000 },
      { type: 'flying', count: 6, interval: 700 },
    ],
  },
  {
    waveNumber: 8,
    delay: 5000,
    monsters: [
      { type: 'normal', count: 10, interval: 500 },
      { type: 'armored', count: 5, interval: 1000 },
      { type: 'flying', count: 5, interval: 800 },
    ],
  },
  {
    waveNumber: 9,
    delay: 5000,
    monsters: [
      { type: 'armored', count: 8, interval: 800 },
      { type: 'flying', count: 8, interval: 600 },
    ],
  },
  {
    waveNumber: 10,
    delay: 5000,
    monsters: [
      { type: 'normal', count: 10, interval: 400 },
      { type: 'armored', count: 5, interval: 1000 },
      { type: 'flying', count: 5, interval: 800 },
      { type: 'boss', count: 1, interval: 3000 },
    ],
  },
];

export const TOTAL_WAVES = WAVE_CONFIGS.length;
