import type { AudioTake } from '../types';

const SAMPLE_AUDIOS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
];

const MICROPHONES = [
  'Neumann U87 Ai',
  'Shure SM7B',
  'AKG C414 XLII',
  'Sony C800G',
  'Telefunken ELA M 251',
  'Neumann KMS 105',
];

const PREAMPS = [
  'Neve 1073 DPX',
  'API 512c',
  'Universal Audio 6176',
  'Focusrite ISA One',
  'Millennia HV-3C',
  'Grace Design m101',
];

const ROOM_POSITIONS = [
  'Center (0°)',
  'Off-axis 15°',
  'Off-axis 30°',
  'Vocal Booth',
  'Corner (dry)',
  'Room (ambient)',
];

const DISTANCES = [10, 15, 20, 25, 30];
const GAINS = [-12, -6, 0, 6, 12];

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const MOCK_TAKES: AudioTake[] = [
  {
    id: 'take-001',
    name: 'Take 01 - U87 Close',
    microphone: MICROPHONES[0],
    preamp: PREAMPS[0],
    distance: 15,
    gain: 0,
    roomPosition: ROOM_POSITIONS[0],
    popFilter: true,
    audioUrl: SAMPLE_AUDIOS[0],
    duration: 372,
    starred: false,
    annotations: {
      sibilance: 3,
      nasality: 2,
      plosives: 2,
      noiseFloor: 2,
      emotion: 8,
    },
    notes: '经典配置，中频饱满，细节丰富。防喷罩有效控制了爆破音。',
    createdAt: '2025-06-21T09:15:00Z',
  },
  {
    id: 'take-002',
    name: 'Take 02 - SM7B Aggressive',
    microphone: MICROPHONES[1],
    preamp: PREAMPS[3],
    distance: 10,
    gain: 12,
    roomPosition: ROOM_POSITIONS[0],
    popFilter: true,
    audioUrl: SAMPLE_AUDIOS[1],
    duration: 365,
    starred: true,
    annotations: {
      sibilance: 2,
      nasality: 1,
      plosives: 3,
      noiseFloor: 4,
      emotion: 9,
    },
    notes: 'SM7B + ISA One 组合，需要高增益但底噪控制不错。人声非常有力量感，适合摇滚风格。',
    createdAt: '2025-06-21T09:22:00Z',
  },
  {
    id: 'take-003',
    name: 'Take 03 - C414 Off-axis',
    microphone: MICROPHONES[2],
    preamp: PREAMPS[1],
    distance: 20,
    gain: 6,
    roomPosition: ROOM_POSITIONS[1],
    popFilter: true,
    audioUrl: SAMPLE_AUDIOS[2],
    duration: 378,
    starred: false,
    annotations: {
      sibilance: 1,
      nasality: 3,
      plosives: 1,
      noiseFloor: 2,
      emotion: 7,
    },
    notes: '偏离轴心15度有效减少了齿音，但稍微牺牲了一些临场感。',
    createdAt: '2025-06-21T09:30:00Z',
  },
  {
    id: 'take-004',
    name: 'Take 04 - C800G Luxury',
    microphone: MICROPHONES[3],
    preamp: PREAMPS[2],
    distance: 25,
    gain: -6,
    roomPosition: ROOM_POSITIONS[3],
    popFilter: true,
    audioUrl: SAMPLE_AUDIOS[3],
    duration: 368,
    starred: true,
    annotations: {
      sibilance: 4,
      nasality: 2,
      plosives: 2,
      noiseFloor: 1,
      emotion: 9,
    },
    notes: '顶级组合，高频延伸非常漂亮，空气感十足。但齿音需要后期处理。',
    createdAt: '2025-06-21T09:40:00Z',
  },
  {
    id: 'take-005',
    name: 'Take 05 - ELA M 251 Vintage',
    microphone: MICROPHONES[4],
    preamp: PREAMPS[0],
    distance: 20,
    gain: 0,
    roomPosition: ROOM_POSITIONS[0],
    popFilter: true,
    audioUrl: SAMPLE_AUDIOS[4],
    duration: 370,
    starred: false,
    annotations: {
      sibilance: 3,
      nasality: 2,
      plosives: 1,
      noiseFloor: 2,
      emotion: 8,
    },
    notes: '经典电子管麦克风，温暖的中频和柔和的高频，非常有音乐性。',
    createdAt: '2025-06-21T09:50:00Z',
  },
  {
    id: 'take-006',
    name: 'Take 06 - U87 No Pop Filter',
    microphone: MICROPHONES[0],
    preamp: PREAMPS[0],
    distance: 20,
    gain: 0,
    roomPosition: ROOM_POSITIONS[0],
    popFilter: false,
    audioUrl: SAMPLE_AUDIOS[5],
    duration: 365,
    starred: false,
    annotations: {
      sibilance: 3,
      nasality: 2,
      plosives: 6,
      noiseFloor: 2,
      emotion: 7,
    },
    notes: '没有防喷罩，爆破音明显。距离增加到20cm有所改善，但仍需处理。',
    createdAt: '2025-06-21T10:00:00Z',
  },
  {
    id: 'take-007',
    name: 'Take 07 - SM7B + API 512c',
    microphone: MICROPHONES[1],
    preamp: PREAMPS[1],
    distance: 15,
    gain: 12,
    roomPosition: ROOM_POSITIONS[3],
    popFilter: true,
    audioUrl: SAMPLE_AUDIOS[6],
    duration: 375,
    starred: false,
    annotations: {
      sibilance: 2,
      nasality: 1,
      plosives: 2,
      noiseFloor: 5,
      emotion: 8,
    },
    notes: 'API 前级给 SM7B 带来更多冲击力，但底噪比 ISA One 稍高。',
    createdAt: '2025-06-21T10:10:00Z',
  },
  {
    id: 'take-008',
    name: 'Take 08 - KMS 105 Live',
    microphone: MICROPHONES[5],
    preamp: PREAMPS[4],
    distance: 10,
    gain: 6,
    roomPosition: ROOM_POSITIONS[0],
    popFilter: false,
    audioUrl: SAMPLE_AUDIOS[7],
    duration: 368,
    starred: false,
    annotations: {
      sibilance: 4,
      nasality: 3,
      plosives: 5,
      noiseFloor: 2,
      emotion: 7,
    },
    notes: '手持电容麦，临场感强但需要更好的防喷处理。适合现场不适合棚录。',
    createdAt: '2025-06-21T10:20:00Z',
  },
  {
    id: 'take-009',
    name: 'Take 09 - C414 + UA 6176',
    microphone: MICROPHONES[2],
    preamp: PREAMPS[2],
    distance: 15,
    gain: 0,
    roomPosition: ROOM_POSITIONS[4],
    popFilter: true,
    audioUrl: SAMPLE_AUDIOS[8],
    duration: 372,
    starred: false,
    annotations: {
      sibilance: 2,
      nasality: 3,
      plosives: 2,
      noiseFloor: 1,
      emotion: 8,
    },
    notes: '6176 的压缩让声音更紧实，角落位置增加了一点自然的房间混响。',
    createdAt: '2025-06-21T10:30:00Z',
  },
  {
    id: 'take-010',
    name: 'Take 010 - U87 Distant',
    microphone: MICROPHONES[0],
    preamp: PREAMPS[5],
    distance: 30,
    gain: 12,
    roomPosition: ROOM_POSITIONS[5],
    popFilter: true,
    audioUrl: SAMPLE_AUDIOS[9],
    duration: 380,
    starred: false,
    annotations: {
      sibilance: 1,
      nasality: 2,
      plosives: 1,
      noiseFloor: 4,
      emotion: 6,
    },
    notes: '远距离房间拾音，自然混响丰富但缺少细节和临场感。可用作叠加轨。',
    createdAt: '2025-06-21T10:40:00Z',
  },
];

export const ALL_MICROPHONES = [...new Set(MOCK_TAKES.map((t) => t.microphone))];
export const ALL_PREAMPS = [...new Set(MOCK_TAKES.map((t) => t.preamp))];
export const ALL_ROOM_POSITIONS = [...new Set(MOCK_TAKES.map((t) => t.roomPosition))];
export const MIN_DISTANCE = Math.min(...DISTANCES);
export const MAX_DISTANCE = Math.max(...DISTANCES);
export const MIN_GAIN = Math.min(...GAINS);
export const MAX_GAIN = Math.max(...GAINS);

export function generateRandomTake(index: number): AudioTake {
  return {
    id: `take-${String(index).padStart(3, '0')}`,
    name: `Take ${String(index).padStart(2, '0')} - ${randomFrom(MICROPHONES).split(' ')[0]}`,
    microphone: randomFrom(MICROPHONES),
    preamp: randomFrom(PREAMPS),
    distance: randomFrom(DISTANCES),
    gain: randomFrom(GAINS),
    roomPosition: randomFrom(ROOM_POSITIONS),
    popFilter: Math.random() > 0.2,
    audioUrl: randomFrom(SAMPLE_AUDIOS),
    duration: randomBetween(350, 390),
    starred: false,
    annotations: {
      sibilance: randomBetween(1, 8),
      nasality: randomBetween(1, 6),
      plosives: randomBetween(1, 7),
      noiseFloor: randomBetween(1, 5),
      emotion: randomBetween(5, 10),
    },
    notes: '',
    createdAt: new Date(Date.now() - index * 300000).toISOString(),
  };
}
