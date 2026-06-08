import type { UserProfile } from '@/types/pickup';

export const currentUser: UserProfile = {
  id: 'user_1',
  name: '张伟',
  avatar: 'https://picsum.photos/id/64/200/200',
  building: '3栋',
  helpCount: 12,
  publishCount: 5,
};

export const mockUsers: UserProfile[] = [
  currentUser,
  {
    id: 'user_2',
    name: '李娜',
    avatar: 'https://picsum.photos/id/91/200/200',
    building: '3栋',
    helpCount: 8,
    publishCount: 10,
  },
  {
    id: 'user_3',
    name: '王强',
    avatar: 'https://picsum.photos/id/177/200/200',
    building: '5栋',
    helpCount: 15,
    publishCount: 3,
  },
  {
    id: 'user_4',
    name: '陈静',
    avatar: 'https://picsum.photos/id/338/200/200',
    building: '3栋',
    helpCount: 6,
    publishCount: 7,
  },
  {
    id: 'user_5',
    name: '刘洋',
    avatar: 'https://picsum.photos/id/1027/200/200',
    building: '5栋',
    helpCount: 20,
    publishCount: 4,
  },
  {
    id: 'user_6',
    name: '赵敏',
    avatar: 'https://picsum.photos/id/64/200/200',
    building: '1栋',
    helpCount: 18,
    publishCount: 6,
  },
  {
    id: 'user_7',
    name: '孙磊',
    avatar: 'https://picsum.photos/id/91/200/200',
    building: '3栋',
    helpCount: 9,
    publishCount: 2,
  },
  {
    id: 'user_8',
    name: '周婷',
    avatar: 'https://picsum.photos/id/177/200/200',
    building: '7栋',
    helpCount: 22,
    publishCount: 8,
  },
];
