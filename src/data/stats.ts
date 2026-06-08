import type { HelperRanking, LockerStats } from '@/types/pickup';

export const helperRankings: HelperRanking[] = [
  {
    userId: 'user_8',
    name: '周婷',
    avatar: 'https://picsum.photos/id/177/200/200',
    building: '7栋',
    helpCount: 22,
    totalReward: 168,
  },
  {
    userId: 'user_5',
    name: '刘洋',
    avatar: 'https://picsum.photos/id/1027/200/200',
    building: '5栋',
    helpCount: 20,
    totalReward: 152,
  },
  {
    userId: 'user_6',
    name: '赵敏',
    avatar: 'https://picsum.photos/id/64/200/200',
    building: '1栋',
    helpCount: 18,
    totalReward: 134,
  },
  {
    userId: 'user_3',
    name: '王强',
    avatar: 'https://picsum.photos/id/177/200/200',
    building: '5栋',
    helpCount: 15,
    totalReward: 108,
  },
  {
    userId: 'user_1',
    name: '张伟',
    avatar: 'https://picsum.photos/id/64/200/200',
    building: '3栋',
    helpCount: 12,
    totalReward: 86,
  },
  {
    userId: 'user_7',
    name: '孙磊',
    avatar: 'https://picsum.photos/id/91/200/200',
    building: '3栋',
    helpCount: 9,
    totalReward: 62,
  },
  {
    userId: 'user_2',
    name: '李娜',
    avatar: 'https://picsum.photos/id/91/200/200',
    building: '3栋',
    helpCount: 8,
    totalReward: 54,
  },
  {
    userId: 'user_4',
    name: '陈静',
    avatar: 'https://picsum.photos/id/338/200/200',
    building: '3栋',
    helpCount: 6,
    totalReward: 38,
  },
];

export const lockerStats: LockerStats[] = [
  {
    lockerLocation: '丰巢快递柜',
    totalRequests: 156,
    timeoutCount: 23,
    timeoutRate: 14.7,
  },
  {
    lockerLocation: '速递易',
    totalRequests: 98,
    timeoutCount: 18,
    timeoutRate: 18.4,
  },
  {
    lockerLocation: '菜鸟驿站',
    totalRequests: 124,
    timeoutCount: 8,
    timeoutRate: 6.5,
  },
];
