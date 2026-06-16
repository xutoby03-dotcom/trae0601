import type { WashingPool, Booking, CleaningTask, Statistics } from '../types';

export const mockWashingPools: WashingPool[] = [
  {
    id: 'pool-1',
    name: '1号洗脚池',
    location: '1号楼入口',
    status: 'IDLE',
    lastCleanedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'pool-2',
    name: '2号洗脚池',
    location: '3号楼入口',
    status: 'OCCUPIED',
    lastCleanedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'pool-3',
    name: '3号洗脚池',
    location: '5号楼入口',
    status: 'CLEANING_PENDING',
    lastCleanedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'pool-4',
    name: '4号洗脚池',
    location: '7号楼入口',
    status: 'MAINTENANCE',
    lastCleanedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

export const timeSlots: string[] = [
  '08:00-10:00',
  '10:00-12:00',
  '12:00-14:00',
  '14:00-16:00',
  '16:00-18:00',
  '18:00-20:00',
];

export const buildings: string[] = [
  '1号楼',
  '2号楼',
  '3号楼',
  '4号楼',
  '5号楼',
  '6号楼',
  '7号楼',
  '8号楼',
];

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    poolId: 'pool-2',
    poolName: '2号洗脚池',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '14:00-16:00',
    startTime: new Date(Date.now() - 15 * 60 * 1000),
    petInfo: {
      nickname: '豆豆',
      size: 'MEDIUM',
      building: '3号楼',
      ownerPhone: '13800138001',
      afraidOfWater: false,
    },
    status: 'IN_USE',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: 'booking-2',
    poolId: 'pool-1',
    poolName: '1号洗脚池',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '16:00-18:00',
    petInfo: {
      nickname: '旺财',
      size: 'LARGE',
      building: '1号楼',
      ownerPhone: '13800138002',
      afraidOfWater: true,
    },
    status: 'PENDING',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'booking-3',
    poolId: 'pool-3',
    poolName: '3号洗脚池',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00-12:00',
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    endTime: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
    duration: 30,
    petInfo: {
      nickname: '小白',
      size: 'SMALL',
      building: '5号楼',
      ownerPhone: '13800138003',
      afraidOfWater: false,
    },
    status: 'COMPLETED',
    feedback: {
      waterSpilled: true,
      floorNeedsMopping: true,
      usedDisinfectant: true,
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
];

export const mockCleaningTasks: CleaningTask[] = [
  {
    id: 'task-1',
    poolId: 'pool-3',
    poolName: '3号洗脚池',
    type: 'MAT_REPLACEMENT',
    priority: 'HIGH',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
  },
  {
    id: 'task-2',
    poolId: 'pool-3',
    poolName: '3号洗脚池',
    type: 'DRAIN_CLEANING',
    priority: 'HIGH',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
  },
  {
    id: 'task-3',
    poolId: 'pool-3',
    poolName: '3号洗脚池',
    type: 'DISINFECTANT_REFILL',
    priority: 'MEDIUM',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
  },
  {
    id: 'task-4',
    poolId: 'pool-1',
    poolName: '1号洗脚池',
    type: 'DISINFECTANT_REFILL',
    priority: 'LOW',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
  },
  {
    id: 'task-5',
    poolId: 'pool-2',
    poolName: '2号洗脚池',
    type: 'MAT_REPLACEMENT',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
];

export const mockStatistics: Statistics = {
  peakHours: [
    { hour: 8, count: 3 },
    { hour: 10, count: 5 },
    { hour: 12, count: 8 },
    { hour: 14, count: 12 },
    { hour: 16, count: 9 },
    { hour: 18, count: 7 },
    { hour: 20, count: 4 },
  ],
  noShows: {
    total: 15,
    rate: 8,
    users: [
      { phone: '138****1234', count: 5 },
      { phone: '139****5678', count: 3 },
      { phone: '137****9012', count: 2 },
    ],
  },
  overtimeUsage: {
    total: 42,
    avgDuration: 18,
    overtimes: [
      { poolId: 'pool-1', count: 15 },
      { poolId: 'pool-2', count: 12 },
      { poolId: 'pool-3', count: 9 },
      { poolId: 'pool-4', count: 6 },
    ],
  },
  buildingUsage: [
    { building: '1号楼', count: 58 },
    { building: '3号楼', count: 45 },
    { building: '5号楼', count: 38 },
    { building: '7号楼', count: 32 },
    { building: '2号楼', count: 28 },
    { building: '4号楼', count: 25 },
    { building: '6号楼', count: 22 },
    { building: '8号楼', count: 18 },
  ],
};
