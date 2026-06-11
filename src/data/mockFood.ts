import { FoodRecord } from '@/types/food';
import dayjs from 'dayjs';

const foodImages = [292, 312, 326, 401, 431, 570, 580, 625, 835, 1080];

const getImage = (index: number) => {
  const id = foodImages[index % foodImages.length];
  return `https://picsum.photos/id/${id}/300/300`;
};

export const mockFoodList: FoodRecord[] = [
  {
    id: '1',
    name: '红烧肉',
    cookDate: dayjs().subtract(2, 'day').format('YYYY-MM-DD'),
    location: '冷藏上层左1',
    expectedDays: 3,
    suitableFor: ['全家', '孩子'],
    canReheat: true,
    photo: getImage(0),
    createdAt: dayjs().subtract(2, 'day').toISOString(),
    status: 'tonight',
    isFrozen: false
  },
  {
    id: '2',
    name: '清炒时蔬',
    cookDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    location: '冷藏中层右2',
    expectedDays: 2,
    suitableFor: ['老人', '素食者'],
    canReheat: false,
    photo: getImage(1),
    createdAt: dayjs().subtract(1, 'day').toISOString(),
    status: 'tonight',
    isFrozen: false
  },
  {
    id: '3',
    name: '番茄炒蛋',
    cookDate: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
    location: '冷藏下层左1',
    expectedDays: 3,
    suitableFor: ['全家', '孩子'],
    canReheat: true,
    photo: getImage(2),
    createdAt: dayjs().subtract(3, 'day').toISOString(),
    status: 'expiring',
    isFrozen: false
  },
  {
    id: '4',
    name: '清蒸鲈鱼',
    cookDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    location: '冷冻区上层',
    expectedDays: 30,
    suitableFor: ['老人', '孩子'],
    canReheat: true,
    photo: getImage(3),
    createdAt: dayjs().subtract(5, 'day').toISOString(),
    status: 'frozen',
    isFrozen: true
  },
  {
    id: '5',
    name: '糖醋排骨',
    cookDate: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    location: '冷冻区中层',
    expectedDays: 30,
    suitableFor: ['全家'],
    canReheat: true,
    photo: getImage(4),
    createdAt: dayjs().subtract(7, 'day').toISOString(),
    status: 'frozen',
    isFrozen: true
  },
  {
    id: '6',
    name: '麻婆豆腐',
    cookDate: dayjs().subtract(4, 'day').format('YYYY-MM-DD'),
    location: '冷藏上层右1',
    expectedDays: 3,
    suitableFor: ['成年人'],
    canReheat: true,
    photo: getImage(5),
    createdAt: dayjs().subtract(4, 'day').toISOString(),
    status: 'expiring',
    isFrozen: false
  },
  {
    id: '7',
    name: '宫保鸡丁',
    cookDate: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
    location: '已处理',
    expectedDays: 3,
    suitableFor: ['全家'],
    canReheat: true,
    photo: getImage(6),
    createdAt: dayjs().subtract(6, 'day').toISOString(),
    status: 'processed',
    isFrozen: false,
    processInfo: {
      type: 'eaten',
      reason: '昨晚加热后作为晚餐',
      date: dayjs().subtract(1, 'day').toISOString()
    }
  },
  {
    id: '8',
    name: '凉拌黄瓜',
    cookDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    location: '已处理',
    expectedDays: 2,
    suitableFor: ['素食者'],
    canReheat: false,
    photo: getImage(7),
    createdAt: dayjs().subtract(5, 'day').toISOString(),
    status: 'processed',
    isFrozen: false,
    processInfo: {
      type: 'discarded',
      reason: '忘记吃，已经坏了',
      date: dayjs().subtract(2, 'day').toISOString()
    }
  },
  {
    id: '9',
    name: '回锅肉',
    cookDate: dayjs().subtract(10, 'day').format('YYYY-MM-DD'),
    location: '已处理',
    expectedDays: 3,
    suitableFor: ['成年人'],
    canReheat: true,
    photo: getImage(8),
    createdAt: dayjs().subtract(10, 'day').toISOString(),
    status: 'processed',
    isFrozen: false,
    processInfo: {
      type: 'transformed',
      reason: '加了青椒和蒜苗，变成回锅肉炒饭',
      date: dayjs().subtract(3, 'day').toISOString()
    }
  },
  {
    id: '10',
    name: '香菇滑鸡',
    cookDate: dayjs().subtract(8, 'day').format('YYYY-MM-DD'),
    location: '冷冻区下层',
    expectedDays: 30,
    suitableFor: ['老人', '孩子'],
    canReheat: true,
    photo: getImage(9),
    createdAt: dayjs().subtract(8, 'day').toISOString(),
    status: 'frozen',
    isFrozen: true
  }
];
