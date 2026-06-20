import type { TourRoute, RoutePoint } from '@/types';

const now = Date.now();

const bronzePoints: RoutePoint[] = [
  {
    id: 'bronze-1',
    name: '序厅',
    description: '青铜器展厅入口，介绍青铜文化的起源与发展',
    plannedDuration: 180,
    isKeyPoint: false,
    order: 0,
  },
  {
    id: 'bronze-2',
    name: '司母戊鼎',
    description: '商代晚期青铜重器，镇馆之宝，讲解铸造工艺与历史背景',
    plannedDuration: 600,
    isKeyPoint: true,
    order: 1,
  },
  {
    id: 'bronze-3',
    name: '四羊方尊',
    description: '商代青铜礼器精品，精美的四羊头装饰',
    plannedDuration: 480,
    isKeyPoint: true,
    order: 2,
  },
  {
    id: 'bronze-4',
    name: '青铜乐器区',
    description: '编钟、铜鼓等青铜乐器展示',
    plannedDuration: 240,
    isKeyPoint: false,
    order: 3,
  },
  {
    id: 'bronze-5',
    name: '越王勾践剑',
    description: '春秋时期青铜兵器，千年不锈的铸造之谜',
    plannedDuration: 420,
    isKeyPoint: true,
    order: 4,
  },
  {
    id: 'bronze-6',
    name: '青铜兵器区',
    description: '戈、矛、剑、戟等各类青铜兵器',
    plannedDuration: 180,
    isKeyPoint: false,
    order: 5,
  },
  {
    id: 'bronze-7',
    name: '结语区',
    description: '青铜文化的历史意义与影响总结',
    plannedDuration: 120,
    isKeyPoint: false,
    order: 6,
  },
];

const calligraphyPoints: RoutePoint[] = [
  {
    id: 'calli-1',
    name: '书法史概述',
    description: '中国书法发展脉络简介',
    plannedDuration: 180,
    isKeyPoint: false,
    order: 0,
  },
  {
    id: 'calli-2',
    name: '兰亭序摹本',
    description: '王羲之"天下第一行书"，讲解书法艺术特点',
    plannedDuration: 540,
    isKeyPoint: true,
    order: 1,
  },
  {
    id: 'calli-3',
    name: '颜真卿祭侄文稿',
    description: '"天下第二行书"，悲愤交加的墨迹杰作',
    plannedDuration: 480,
    isKeyPoint: true,
    order: 2,
  },
  {
    id: 'calli-4',
    name: '篆书隶书区',
    description: '先秦至汉代篆书、隶书作品展示',
    plannedDuration: 240,
    isKeyPoint: false,
    order: 3,
  },
  {
    id: 'calli-5',
    name: '楷书四大家',
    description: '欧阳询、颜真卿、柳公权、赵孟頫楷书代表作',
    plannedDuration: 420,
    isKeyPoint: true,
    order: 4,
  },
  {
    id: 'calli-6',
    name: '明清文人书法',
    description: '董其昌、王铎、傅山等明清书家作品',
    plannedDuration: 240,
    isKeyPoint: false,
    order: 5,
  },
];

const comprehensivePoints: RoutePoint[] = [
  {
    id: 'comp-1',
    name: '博物馆导览',
    description: '整体布局、参观路线及注意事项',
    plannedDuration: 150,
    isKeyPoint: false,
    order: 0,
  },
  {
    id: 'comp-2',
    name: '玉器精品区',
    description: '新石器时代至清代玉器代表作品',
    plannedDuration: 300,
    isKeyPoint: false,
    order: 1,
  },
  {
    id: 'comp-3',
    name: '镇馆之宝',
    description: '博物馆最具代表性的三件国宝级文物',
    plannedDuration: 600,
    isKeyPoint: true,
    order: 2,
  },
  {
    id: 'comp-4',
    name: '陶瓷名品区',
    description: '宋代五大名窑及明清官窑瓷器',
    plannedDuration: 420,
    isKeyPoint: true,
    order: 3,
  },
  {
    id: 'comp-5',
    name: '丝绸织品区',
    description: '汉唐至明清丝绸精品',
    plannedDuration: 180,
    isKeyPoint: false,
    order: 4,
  },
  {
    id: 'comp-6',
    name: '绘画名作区',
    description: '历代名家绘画代表作品',
    plannedDuration: 480,
    isKeyPoint: true,
    order: 5,
  },
  {
    id: 'comp-7',
    name: '钱币与度量衡',
    description: '历代货币与度量衡制度演变',
    plannedDuration: 180,
    isKeyPoint: false,
    order: 6,
  },
  {
    id: 'comp-8',
    name: '结语',
    description: '中华文明的传承与展望',
    plannedDuration: 120,
    isKeyPoint: false,
    order: 7,
  },
];

export const sampleRoutes: TourRoute[] = [
  {
    id: 'route-bronze',
    name: '青铜器展厅路线',
    description: '深入了解中国古代青铜文明，欣赏国宝级重器',
    points: bronzePoints,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'route-calligraphy',
    name: '书画展厅路线',
    description: '品鉴历代书法名作，感受墨香艺术之美',
    points: calligraphyPoints,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'route-comprehensive',
    name: '综合讲解路线',
    description: '涵盖多个展厅的经典路线，适合首次参观',
    points: comprehensivePoints,
    createdAt: now,
    updatedAt: now,
  },
];

export { bronzePoints, calligraphyPoints, comprehensivePoints };
