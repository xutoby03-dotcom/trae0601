import type { Freezer, Inspection, LossReport, Recheck } from '@/types';

export const mockFreezers: Freezer[] = [
  {
    id: 'f1',
    name: '1号雪糕柜',
    location: '入口左侧',
    minTemp: -22,
    maxTemp: -18,
    manager: '张小明',
    managerPhone: '13800138001',
    status: 'normal',
    zones: [
      {
        id: 'z1',
        name: '上层-品牌雪糕区',
        products: [
          { id: 'p1', brand: '梦龙', flavor: '香草', category: '品牌雪糕', costPrice: 5.5, retailPrice: 10, stock: 24 },
          { id: 'p2', brand: '梦龙', flavor: '巧克力', category: '品牌雪糕', costPrice: 5.5, retailPrice: 10, stock: 20 },
          { id: 'p3', brand: '和路雪', flavor: '草莓', category: '品牌雪糕', costPrice: 4, retailPrice: 8, stock: 30 },
        ],
      },
      {
        id: 'z2',
        name: '中层-平价雪糕区',
        products: [
          { id: 'p4', brand: '蒙牛', flavor: '原味', category: '平价雪糕', costPrice: 1.5, retailPrice: 3, stock: 50 },
          { id: 'p5', brand: '伊利', flavor: '巧乐兹', category: '平价雪糕', costPrice: 2, retailPrice: 4, stock: 40 },
          { id: 'p6', brand: '光明', flavor: '冰砖', category: '平价雪糕', costPrice: 2.5, retailPrice: 5, stock: 35 },
        ],
      },
      {
        id: 'z3',
        name: '下层-冰棒区',
        products: [
          { id: 'p7', brand: '老冰棒', flavor: '原味', category: '冰棒', costPrice: 0.5, retailPrice: 1, stock: 100 },
          { id: 'p8', brand: '旺旺', flavor: '碎冰冰', category: '冰棒', costPrice: 0.8, retailPrice: 2, stock: 60 },
        ],
      },
    ],
    createdAt: '2025-01-01T08:00:00Z',
    updatedAt: '2025-06-10T14:30:00Z',
  },
  {
    id: 'f2',
    name: '2号雪糕柜',
    location: '收银台旁',
    minTemp: -22,
    maxTemp: -18,
    manager: '李小红',
    managerPhone: '13800138002',
    status: 'abnormal',
    zones: [
      {
        id: 'z4',
        name: '上层-高端冰淇淋',
        products: [
          { id: 'p9', brand: '哈根达斯', flavor: '香草', category: '高端冰淇淋', costPrice: 25, retailPrice: 48, stock: 12 },
          { id: 'p10', brand: '哈根达斯', flavor: '草莓', category: '高端冰淇淋', costPrice: 25, retailPrice: 48, stock: 10 },
          { id: 'p11', brand: '八喜', flavor: '巧克力', category: '高端冰淇淋', costPrice: 12, retailPrice: 25, stock: 18 },
        ],
      },
      {
        id: 'z5',
        name: '下层-桶装冰淇淋',
        products: [
          { id: 'p12', brand: '和路雪', flavor: '香草桶', category: '桶装冰淇淋', costPrice: 15, retailPrice: 29.9, stock: 8 },
          { id: 'p13', brand: '蒙牛', flavor: '巧克力桶', category: '桶装冰淇淋', costPrice: 10, retailPrice: 19.9, stock: 10 },
        ],
      },
    ],
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-06-15T16:00:00Z',
  },
  {
    id: 'f3',
    name: '3号速冻柜',
    location: '食品区角落',
    minTemp: -20,
    maxTemp: -15,
    manager: '王大力',
    managerPhone: '13800138003',
    status: 'warning',
    zones: [
      {
        id: 'z6',
        name: '速冻水饺区',
        products: [
          { id: 'p14', brand: '湾仔码头', flavor: '猪肉白菜', category: '速冻食品', costPrice: 8, retailPrice: 15, stock: 20 },
          { id: 'p15', brand: '思念', flavor: '三鲜', category: '速冻食品', costPrice: 6, retailPrice: 12, stock: 25 },
        ],
      },
    ],
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-06-12T11:00:00Z',
  },
  {
    id: 'f4',
    name: '4号冷藏柜',
    location: '饮料区',
    minTemp: 2,
    maxTemp: 6,
    manager: '赵小花',
    managerPhone: '13800138004',
    status: 'normal',
    zones: [
      {
        id: 'z7',
        name: '乳制品区',
        products: [
          { id: 'p16', brand: '蒙牛', flavor: '纯牛奶', category: '乳制品', costPrice: 45, retailPrice: 65, stock: 30 },
          { id: 'p17', brand: '伊利', flavor: '酸奶', category: '乳制品', costPrice: 5, retailPrice: 9.9, stock: 40 },
        ],
      },
    ],
    createdAt: '2025-03-01T08:30:00Z',
    updatedAt: '2025-06-14T09:00:00Z',
  },
];

export const mockInspections: Inspection[] = [
  {
    id: 'i1',
    freezerId: 'f2',
    temperature: -12,
    doorSealStatus: 'poor',
    frostStatus: 'none',
    softeningLevel: 'severe',
    photos: [],
    inspector: '张小明',
    shift: 'morning',
    notes: '柜门未关严，发现时已化冻约2小时',
    isAbnormal: true,
    createdAt: '2025-06-15T08:30:00Z',
  },
  {
    id: 'i2',
    freezerId: 'f1',
    temperature: -20,
    doorSealStatus: 'good',
    frostStatus: 'light',
    softeningLevel: 'none',
    photos: [],
    inspector: '李小红',
    shift: 'morning',
    isAbnormal: false,
    createdAt: '2025-06-15T08:15:00Z',
  },
  {
    id: 'i3',
    freezerId: 'f3',
    temperature: -14,
    doorSealStatus: 'normal',
    frostStatus: 'medium',
    softeningLevel: 'mild',
    photos: [],
    inspector: '王大力',
    shift: 'afternoon',
    notes: '温度略高，建议检查压缩机',
    isAbnormal: true,
    createdAt: '2025-06-14T14:20:00Z',
  },
  {
    id: 'i4',
    freezerId: 'f4',
    temperature: 4,
    doorSealStatus: 'good',
    frostStatus: 'none',
    softeningLevel: 'none',
    photos: [],
    inspector: '赵小花',
    shift: 'morning',
    isAbnormal: false,
    createdAt: '2025-06-14T09:00:00Z',
  },
  {
    id: 'i5',
    freezerId: 'f2',
    temperature: -19,
    doorSealStatus: 'good',
    frostStatus: 'light',
    softeningLevel: 'none',
    photos: [],
    inspector: '李小红',
    shift: 'night',
    isAbnormal: false,
    createdAt: '2025-06-13T22:00:00Z',
  },
  {
    id: 'i6',
    freezerId: 'f1',
    temperature: -17,
    doorSealStatus: 'normal',
    frostStatus: 'light',
    softeningLevel: 'mild',
    photos: [],
    inspector: '张小明',
    shift: 'afternoon',
    notes: '温度略高，已调整温控',
    isAbnormal: true,
    createdAt: '2025-06-12T15:30:00Z',
  },
];

export const mockLossReports: LossReport[] = [
  {
    id: 'lr1',
    freezerId: 'f2',
    inspectionId: 'i1',
    type: 'loss',
    status: 'approved',
    totalAmount: 868,
    items: [
      { id: 'li1', productId: 'p9', brand: '哈根达斯', flavor: '香草', category: '高端冰淇淋', quantity: 8, unitPrice: 25, subtotal: 200 },
      { id: 'li2', productId: 'p10', brand: '哈根达斯', flavor: '草莓', category: '高端冰淇淋', quantity: 6, unitPrice: 25, subtotal: 150 },
      { id: 'li3', productId: 'p11', brand: '八喜', flavor: '巧克力', category: '高端冰淇淋', quantity: 12, unitPrice: 12, subtotal: 144 },
      { id: 'li4', productId: 'p12', brand: '和路雪', flavor: '香草桶', category: '桶装冰淇淋', quantity: 5, unitPrice: 15, subtotal: 75 },
      { id: 'li5', productId: 'p13', brand: '蒙牛', flavor: '巧克力桶', category: '桶装冰淇淋', quantity: 6, unitPrice: 10, subtotal: 60 },
    ],
    submitter: '张小明',
    reviewer: '王店长',
    reviewTime: '2025-06-15T10:00:00Z',
    reviewNotes: '情况属实，同意报损',
    createdAt: '2025-06-15T09:00:00Z',
  },
  {
    id: 'lr2',
    freezerId: 'f1',
    inspectionId: 'i6',
    type: 'isolate',
    status: 'pending',
    totalAmount: 240,
    items: [
      { id: 'li6', productId: 'p1', brand: '梦龙', flavor: '香草', category: '品牌雪糕', quantity: 12, unitPrice: 5.5, subtotal: 66 },
      { id: 'li7', productId: 'p2', brand: '梦龙', flavor: '巧克力', category: '品牌雪糕', quantity: 10, unitPrice: 5.5, subtotal: 55 },
      { id: 'li8', productId: 'p3', brand: '和路雪', flavor: '草莓', category: '品牌雪糕', quantity: 15, unitPrice: 4, subtotal: 60 },
    ],
    submitter: '张小明',
    createdAt: '2025-06-12T16:00:00Z',
  },
  {
    id: 'lr3',
    freezerId: 'f3',
    inspectionId: 'i3',
    type: 'loss',
    status: 'rejected',
    totalAmount: 120,
    items: [
      { id: 'li9', productId: 'p14', brand: '湾仔码头', flavor: '猪肉白菜', category: '速冻食品', quantity: 8, unitPrice: 8, subtotal: 64 },
      { id: 'li10', productId: 'p15', brand: '思念', flavor: '三鲜', category: '速冻食品', quantity: 7, unitPrice: 6, subtotal: 42 },
    ],
    submitter: '王大力',
    reviewer: '王店长',
    reviewTime: '2025-06-14T16:00:00Z',
    reviewNotes: '温度超标不严重，商品未明显软化，不同意报损，建议观察',
    createdAt: '2025-06-14T15:00:00Z',
  },
];

export const mockRechecks: Recheck[] = [
  {
    id: 'r1',
    freezerId: 'f1',
    inspectionId: 'i6',
    recheckTime: '2025-06-13T08:00:00Z',
    rechecker: '李小红',
    temperature: -21,
    productStatus: 'good',
    notes: '温度已恢复正常，商品状态良好',
    isResolved: true,
  },
];

export const shiftLabels: Record<string, string> = {
  morning: '早班',
  afternoon: '午班',
  night: '晚班',
};

export const statusLabels = {
  normal: '正常',
  warning: '预警',
  abnormal: '异常',
};

export const doorSealLabels = {
  good: '良好',
  normal: '一般',
  poor: '较差',
};

export const frostLabels = {
  none: '无霜',
  light: '轻微',
  medium: '中度',
  heavy: '严重',
};

export const softeningLabels = {
  none: '无软化',
  mild: '轻微软化',
  moderate: '中度软化',
  severe: '严重软化',
};

export const lossTypeLabels = {
  loss: '报损',
  isolate: '隔离',
};

export const lossStatusLabels = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
};
