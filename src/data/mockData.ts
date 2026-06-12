import type { Tank, Fish, WaterChangeRecord, Observation, AppState } from '@/types';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return formatDate(d);
};

export const mockTank: Tank = {
  id: 'tank-001',
  name: '碧海蓝缸',
  capacity: 80,
  filterType: '滴流过滤 + 硝化细菌屋',
  minTemp: 24,
  maxTemp: 28,
  photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=aquarium%20fish%20tank%20with%20colorful%20fish%20and%20green%20plants%20underwater%20blue%20lighting&image_size=landscape_16_9',
  owner: '小李',
  lastWaterChange: daysAgo(8),
  waterChangeInterval: 7,
};

export const mockFishes: Fish[] = [
  {
    id: 'fish-001',
    name: '小红',
    species: '孔雀鱼',
    avatar: '🐟',
    addedDate: '2025-01-15',
    status: 'healthy',
  },
  {
    id: 'fish-002',
    name: '大黑',
    species: '神仙鱼',
    avatar: '🐠',
    addedDate: '2025-02-20',
    status: 'sick',
  },
  {
    id: 'fish-003',
    name: '花斑',
    species: '虎皮鱼',
    avatar: '🐡',
    addedDate: '2025-03-10',
    status: 'healthy',
  },
  {
    id: 'fish-004',
    name: '小金',
    species: '金苔鼠',
    avatar: '🐟',
    addedDate: '2025-04-05',
    status: 'healthy',
  },
  {
    id: 'fish-005',
    name: '蓝蓝',
    species: '斗鱼',
    avatar: '🐠',
    addedDate: '2025-05-12',
    status: 'quarantine',
  },
];

export const mockWaterChanges: WaterChangeRecord[] = [
  {
    id: 'wc-001',
    date: daysAgo(35),
    ratio: 30,
    temperature: 25.5,
    ph: 7.2,
    addMedicine: false,
    cleanFilter: true,
    notes: '定期维护，清洗了所有滤棉',
  },
  {
    id: 'wc-002',
    date: daysAgo(28),
    ratio: 25,
    temperature: 26.0,
    ph: 7.0,
    addMedicine: false,
    cleanFilter: false,
    notes: '换水时水温略低，注意观察',
  },
  {
    id: 'wc-003',
    date: daysAgo(21),
    ratio: 30,
    temperature: 26.5,
    ph: 7.1,
    addMedicine: true,
    medicineName: '硝化细菌',
    cleanFilter: false,
    notes: '添加硝化细菌，稳定水质',
  },
  {
    id: 'wc-004',
    date: daysAgo(14),
    ratio: 20,
    temperature: 27.0,
    ph: 6.9,
    addMedicine: false,
    cleanFilter: true,
    notes: '清洗滤棉，PH略有下降',
  },
  {
    id: 'wc-005',
    date: daysAgo(8),
    ratio: 25,
    temperature: 26.8,
    ph: 7.0,
    addMedicine: true,
    medicineName: '白点净',
    cleanFilter: false,
    notes: '大黑出现白点，加药治疗',
  },
];

export const mockObservations: Observation[] = [
  {
    id: 'obs-001',
    date: daysAgo(10),
    type: 'white_spot',
    typeLabel: '白点病',
    description: '大黑身上出现小白点，尤其是鱼鳍部位，食欲正常',
    targetType: 'fish',
    targetId: 'fish-002',
    targetName: '大黑',
    status: 'recovering',
  },
  {
    id: 'obs-002',
    date: daysAgo(6),
    type: 'bottom_sitting',
    typeLabel: '趴缸',
    description: '大黑偶尔趴在缸底，游动减少，疑似白点病导致',
    targetType: 'fish',
    targetId: 'fish-002',
    targetName: '大黑',
    status: 'recovering',
  },
  {
    id: 'obs-003',
    date: daysAgo(3),
    type: 'filter_noise',
    typeLabel: '过滤异响',
    description: '过滤桶运转时有嗡嗡声，可能是转子需要清洗',
    targetType: 'equipment',
    targetName: '过滤桶',
    status: 'pending',
  },
  {
    id: 'obs-004',
    date: daysAgo(2),
    type: 'appetite_loss',
    typeLabel: '食欲不振',
    description: '蓝蓝进食量减少，可能还在适应环境',
    targetType: 'fish',
    targetId: 'fish-005',
    targetName: '蓝蓝',
    status: 'pending',
  },
];

export const mockAppState: AppState = {
  tank: mockTank,
  fishes: mockFishes,
  waterChanges: mockWaterChanges,
  observations: mockObservations,
};
