import type { ConcertPlan, Member, TicketRecord, AppState } from '../types';
import { generateId } from '../utils/date';

const now = new Date();
const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
const futureDate2 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

export const mockMembers: Member[] = [
  {
    id: 'm1',
    name: '小明',
    color: '#FF2E9D',
    maxTickets: 2,
    platformClaims: [
      {
        id: 'pc1',
        platform: 'damai',
        isVerified: true,
        hasPrivilegeCode: true,
        accountStatus: 'normal',
      },
      {
        id: 'pc2',
        platform: 'maoyan',
        isVerified: true,
        hasPrivilegeCode: false,
        accountStatus: 'normal',
      },
    ],
    backupPlan: '猫眼抢不到就转战纷玩岛',
  },
  {
    id: 'm2',
    name: '小红',
    color: '#9D4EDD',
    maxTickets: 4,
    platformClaims: [
      {
        id: 'pc3',
        platform: 'piaoxingqiu',
        isVerified: true,
        hasPrivilegeCode: true,
        accountStatus: 'normal',
      },
    ],
    backupPlan: '优先抢内场，备选看台',
  },
  {
    id: 'm3',
    name: '小刚',
    color: '#4CC9F0',
    maxTickets: 2,
    platformClaims: [
      {
        id: 'pc4',
        platform: 'fenwandao',
        isVerified: true,
        hasPrivilegeCode: false,
        accountStatus: 'warning',
      },
      {
        id: 'pc5',
        platform: 'damai',
        isVerified: false,
        hasPrivilegeCode: false,
        accountStatus: 'normal',
      },
    ],
    backupPlan: '多平台同时蹲守',
  },
  {
    id: 'm4',
    name: '小丽',
    color: '#39FF14',
    maxTickets: 3,
    platformClaims: [
      {
        id: 'pc6',
        platform: 'maoyan',
        isVerified: true,
        hasPrivilegeCode: true,
        accountStatus: 'normal',
      },
    ],
  },
];

export const mockPlans: ConcertPlan[] = [
  {
    id: 'p1',
    artist: '周杰伦',
    artistImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jay%20Chou%20concert%20poster%20with%20purple%20and%20gold%20colors%2C%20cinematic&image_size=square_hd',
    city: '上海',
    venue: '梅赛德斯奔驰文化中心',
    concertDate: futureDate2.toISOString(),
    saleStartTime: futureDate.toISOString(),
    status: 'upcoming',
    budgetTiers: [
      { id: 'bt1', name: '内场 VIP', minPrice: 1880, maxPrice: 2280 },
      { id: 'bt2', name: '看台 A', minPrice: 980, maxPrice: 1280 },
      { id: 'bt3', name: '看台 B', minPrice: 580, maxPrice: 780 },
    ],
    preferredAreas: [
      { id: 'sa1', name: '内场前区', priority: 1 },
      { id: 'sa2', name: '内场中区', priority: 2 },
      { id: 'sa3', name: '看台一层', priority: 3 },
    ],
    memberIds: ['m1', 'm2', 'm3', 'm4'],
    createdAt: pastDate.toISOString(),
  },
  {
    id: 'p2',
    artist: '五月天',
    artistImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Mayday%20concert%20poster%20with%20blue%20ocean%20theme%2C%20energetic&image_size=square_hd',
    city: '北京',
    venue: '国家体育场鸟巢',
    concertDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    saleStartTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    budgetTiers: [
      { id: 'bt4', name: '内场', minPrice: 1680, maxPrice: 1880 },
      { id: 'bt5', name: '看台', minPrice: 480, maxPrice: 1080 },
    ],
    preferredAreas: [
      { id: 'sa4', name: '内场任意区域', priority: 1 },
      { id: 'sa5', name: '看台前排', priority: 2 },
    ],
    memberIds: ['m1', 'm2'],
    createdAt: pastDate.toISOString(),
  },
];

export const mockTickets: TicketRecord[] = [
  {
    id: 't1',
    planId: 'p1',
    platform: 'damai',
    memberId: 'm1',
    seatInfo: '内场前区 12排 25座',
    price: 2180,
    status: 'success',
    splitRecords: [
      { memberId: 'm1', amount: 1090, isPaid: true },
      { memberId: 'm2', amount: 1090, isPaid: false },
    ],
    obtainedAt: pastDate.toISOString(),
  },
  {
    id: 't2',
    planId: 'p1',
    platform: 'piaoxingqiu',
    memberId: 'm2',
    seatInfo: '内场中区 8排 16座',
    price: 1980,
    status: 'pending_transfer',
    splitRecords: [
      { memberId: 'm3', amount: 990, isPaid: false },
      { memberId: 'm4', amount: 990, isPaid: false },
    ],
    obtainedAt: new Date(pastDate.getTime() + 60 * 60 * 1000).toISOString(),
  },
  {
    id: 't3',
    planId: 'p1',
    platform: 'maoyan',
    memberId: 'm4',
    seatInfo: '看台一层 3排 8座',
    price: 1280,
    status: 'success',
    splitRecords: [
      { memberId: 'm4', amount: 1280, isPaid: true },
    ],
    obtainedAt: new Date(pastDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockInitialState: AppState = {
  plans: mockPlans,
  members: mockMembers,
  tickets: mockTickets,
  settings: {
    theme: 'dark',
    notifications: true,
  },
};
