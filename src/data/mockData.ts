import type { Room, Curtain, WashingRecord, Photo } from '@/types';
import { generateId } from '@/utils/storage';

const roomId1 = generateId();
const roomId2 = generateId();
const roomId3 = generateId();

const curtainId1 = generateId();
const curtainId2 = generateId();
const curtainId3 = generateId();
const curtainId4 = generateId();
const curtainId5 = generateId();

const recordId1 = generateId();
const recordId2 = generateId();

export const mockRooms: Room[] = [
  {
    id: roomId1,
    name: '客厅',
    icon: '🛋️',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: roomId2,
    name: '主卧',
    icon: '🛏️',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: roomId3,
    name: '书房',
    icon: '📚',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
];

export const mockCurtains: Curtain[] = [
  {
    id: curtainId1,
    roomId: roomId1,
    name: '主布帘',
    type: 'cloth',
    size: { width: 400, height: 270 },
    hookCount: 24,
    washMethod: 'machine',
    lastWashDate: new Date(Date.now() - 86400000 * 45).toISOString().split('T')[0],
    washCycleDays: 30,
    notes: '厚重棉麻材质，易缩水',
    hasMold: false,
    trackStuck: false,
  },
  {
    id: curtainId2,
    roomId: roomId1,
    name: '纱帘',
    type: 'sheer',
    size: { width: 400, height: 260 },
    hookCount: 24,
    washMethod: 'hand',
    lastWashDate: new Date(Date.now() - 86400000 * 45).toISOString().split('T')[0],
    washCycleDays: 30,
    notes: '轻薄纱质，轻柔手洗',
    hasMold: false,
    trackStuck: true,
  },
  {
    id: curtainId3,
    roomId: roomId2,
    name: '遮光布',
    type: 'blackout',
    size: { width: 300, height: 270 },
    hookCount: 18,
    washMethod: 'spot',
    lastWashDate: new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0],
    washCycleDays: 45,
    notes: '背面涂层面料，不宜机洗',
    hasMold: true,
    trackStuck: false,
  },
  {
    id: curtainId4,
    roomId: roomId2,
    name: '纱帘',
    type: 'sheer',
    size: { width: 300, height: 260 },
    hookCount: 18,
    washMethod: 'hand',
    lastWashDate: new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0],
    washCycleDays: 30,
    notes: '白色纱帘，注意漂白',
    hasMold: false,
    trackStuck: false,
  },
  {
    id: curtainId5,
    roomId: roomId3,
    name: '卷帘',
    type: 'roller',
    size: { width: 200, height: 200 },
    hookCount: 0,
    washMethod: 'dryclean',
    lastWashDate: new Date(Date.now() - 86400000 * 90).toISOString().split('T')[0],
    washCycleDays: 90,
    notes: '亚麻材质，建议干洗',
    hasMold: false,
    trackStuck: false,
  },
];

export const mockRecords: WashingRecord[] = [
  {
    id: recordId1,
    curtainId: curtainId1,
    startDate: new Date(Date.now() - 86400000 * 45).toISOString().split('T')[0],
    removalTime: new Date(Date.now() - 86400000 * 45 - 3600000 * 9).toISOString(),
    washTime: new Date(Date.now() - 86400000 * 45 - 3600000 * 10).toISOString(),
    dryTime: new Date(Date.now() - 86400000 * 44 - 3600000 * 8).toISOString(),
    installTime: new Date(Date.now() - 86400000 * 43 - 3600000 * 14).toISOString(),
    removalCheck: {
      trackIntact: true,
      strapIntact: true,
      hookIntact: true,
      clothIntact: true,
      notes: '状态良好',
    },
    dryingMethod: 'natural',
    ironed: true,
    missingParts: [],
    totalMinutes: 290,
    completed: true,
    currentStep: 'complete',
  },
  {
    id: recordId2,
    curtainId: curtainId2,
    startDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    removalTime: new Date(Date.now() - 86400000 * 1 - 3600000 * 10).toISOString(),
    washTime: new Date(Date.now() - 86400000 * 1 - 3600000 * 11).toISOString(),
    dryTime: new Date(Date.now() - 3600000 * 8).toISOString(),
    installTime: null,
    removalCheck: {
      trackIntact: true,
      strapIntact: true,
      hookIntact: false,
      clothIntact: true,
      notes: '缺少1个挂钩',
    },
    dryingMethod: 'shade',
    ironed: false,
    missingParts: [
      {
        id: generateId(),
        name: '挂钩',
        quantity: 1,
        notes: '拆下时遗失',
      },
    ],
    totalMinutes: 0,
    completed: false,
    currentStep: 'install',
  },
];

export const mockPhotos: Photo[] = [];
