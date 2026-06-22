import type { Scene, Role, Version, Piece } from '@/types';

export const defaultRoles: Role[] = [
  {
    id: 'role-commander',
    name: '指挥官',
    color: '#f59e0b',
    symbol: '★',
    description: '负责整体战略决策',
  },
  {
    id: 'role-infantry',
    name: '步兵',
    color: '#10b981',
    symbol: '◆',
    description: '地面作战单位',
  },
  {
    id: 'role-tank',
    name: '装甲部队',
    color: '#ef4444',
    symbol: '■',
    description: '重装甲作战单位',
  },
  {
    id: 'role-air',
    name: '空中支援',
    color: '#3b82f6',
    symbol: '▲',
    description: '空中打击力量',
  },
  {
    id: 'role-supply',
    name: '后勤补给',
    color: '#8b5cf6',
    symbol: '●',
    description: '物资补给单位',
  },
  {
    id: 'role-intel',
    name: '情报单位',
    color: '#06b6d4',
    symbol: '◈',
    description: '侦察与情报收集',
  },
];

const createPiecesV1 = (): Piece[] => [
  {
    id: 'piece-1',
    name: '北方指挥部',
    roleId: 'role-commander',
    x: 2,
    y: 1,
    resources: [
      { id: 'res-1', name: '兵力', amount: 500, unit: '人' },
      { id: 'res-2', name: '弹药', amount: 100, unit: '吨' },
    ],
    triggers: [
      { id: 'trig-1', name: '遇袭警报', condition: '敌军接近5格', effect: '进入战备状态' },
    ],
    notes: '北线最高指挥中心',
  },
  {
    id: 'piece-2',
    name: '步兵第一营',
    roleId: 'role-infantry',
    x: 3,
    y: 3,
    resources: [
      { id: 'res-3', name: '兵力', amount: 120, unit: '人' },
      { id: 'res-4', name: '弹药', amount: 20, unit: '吨' },
    ],
    triggers: [],
    notes: '前沿部署',
  },
  {
    id: 'piece-3',
    name: '步兵第二营',
    roleId: 'role-infantry',
    x: 5,
    y: 2,
    resources: [
      { id: 'res-5', name: '兵力', amount: 100, unit: '人' },
    ],
    triggers: [],
    notes: '侧翼掩护',
  },
  {
    id: 'piece-4',
    name: '装甲连A',
    roleId: 'role-tank',
    x: 4,
    y: 4,
    resources: [
      { id: 'res-6', name: '坦克', amount: 10, unit: '辆' },
      { id: 'res-7', name: '燃油', amount: 50, unit: '吨' },
    ],
    triggers: [
      { id: 'trig-2', name: '燃油不足', condition: '燃油<20吨', effect: '请求补给' },
    ],
    notes: '预备队',
  },
];

const createPiecesV2 = (): Piece[] => [
  {
    id: 'piece-1',
    name: '北方指挥部',
    roleId: 'role-commander',
    x: 2,
    y: 1,
    resources: [
      { id: 'res-1', name: '兵力', amount: 500, unit: '人' },
      { id: 'res-2', name: '弹药', amount: 100, unit: '吨' },
    ],
    triggers: [
      { id: 'trig-1', name: '遇袭警报', condition: '敌军接近5格', effect: '进入战备状态' },
    ],
    notes: '北线最高指挥中心',
  },
  {
    id: 'piece-2',
    name: '步兵第一营',
    roleId: 'role-infantry',
    x: 4,
    y: 4,
    resources: [
      { id: 'res-3', name: '兵力', amount: 120, unit: '人' },
      { id: 'res-4', name: '弹药', amount: 20, unit: '吨' },
    ],
    triggers: [],
    notes: '向前推进',
  },
  {
    id: 'piece-3',
    name: '步兵第二营',
    roleId: 'role-infantry',
    x: 5,
    y: 2,
    resources: [
      { id: 'res-5', name: '兵力', amount: 100, unit: '人' },
    ],
    triggers: [],
    notes: '侧翼掩护',
  },
  {
    id: 'piece-4',
    name: '装甲连A',
    roleId: 'role-tank',
    x: 6,
    y: 5,
    resources: [
      { id: 'res-6', name: '坦克', amount: 10, unit: '辆' },
      { id: 'res-7', name: '燃油', amount: 35, unit: '吨' },
    ],
    triggers: [
      { id: 'trig-2', name: '燃油不足', condition: '燃油<20吨', effect: '请求补给' },
    ],
    notes: '机动突击',
  },
  {
    id: 'piece-5',
    name: '侦察小队',
    roleId: 'role-intel',
    x: 7,
    y: 3,
    resources: [
      { id: 'res-8', name: '人员', amount: 8, unit: '人' },
    ],
    triggers: [
      { id: 'trig-3', name: '发现敌军', condition: '目视接触', effect: '立即汇报' },
    ],
    notes: '敌后侦察',
  },
];

const createPiecesV3 = (): Piece[] => [
  {
    id: 'piece-1',
    name: '北方指挥部',
    roleId: 'role-commander',
    x: 2,
    y: 1,
    resources: [
      { id: 'res-1', name: '兵力', amount: 500, unit: '人' },
      { id: 'res-2', name: '弹药', amount: 100, unit: '吨' },
    ],
    triggers: [
      { id: 'trig-1', name: '遇袭警报', condition: '敌军接近5格', effect: '进入战备状态' },
    ],
    notes: '北线最高指挥中心',
  },
  {
    id: 'piece-2',
    name: '步兵第一营',
    roleId: 'role-infantry',
    x: 5,
    y: 5,
    resources: [
      { id: 'res-3', name: '兵力', amount: 120, unit: '人' },
      { id: 'res-4', name: '弹药', amount: 15, unit: '吨' },
    ],
    triggers: [],
    notes: '巩固阵地',
  },
  {
    id: 'piece-4',
    name: '装甲连A',
    roleId: 'role-tank',
    x: 8,
    y: 6,
    resources: [
      { id: 'res-6', name: '坦克', amount: 10, unit: '辆' },
      { id: 'res-7', name: '燃油', amount: 20, unit: '吨' },
    ],
    triggers: [
      { id: 'trig-2', name: '燃油不足', condition: '燃油<20吨', effect: '请求补给' },
    ],
    notes: '深入敌后',
  },
  {
    id: 'piece-5',
    name: '侦察小队',
    roleId: 'role-intel',
    x: 9,
    y: 4,
    resources: [
      { id: 'res-8', name: '人员', amount: 8, unit: '人' },
    ],
    triggers: [
      { id: 'trig-3', name: '发现敌军', condition: '目视接触', effect: '立即汇报' },
    ],
    notes: '前沿侦察',
  },
  {
    id: 'piece-6',
    name: '空中支援编队',
    roleId: 'role-air',
    x: 3,
    y: 0,
    resources: [
      { id: 'res-9', name: '战机', amount: 4, unit: '架' },
      { id: 'res-10', name: '导弹', amount: 16, unit: '枚' },
    ],
    triggers: [
      { id: 'trig-4', name: '支援请求', condition: '收到地面呼叫', effect: '前往支援' },
    ],
    notes: '待命状态',
  },
  {
    id: 'piece-7',
    name: '后勤补给站',
    roleId: 'role-supply',
    x: 1,
    y: 2,
    resources: [
      { id: 'res-11', name: '弹药', amount: 200, unit: '吨' },
      { id: 'res-12', name: '燃油', amount: 300, unit: '吨' },
    ],
    triggers: [],
    notes: '主要补给基地',
  },
];

export const createMockScene = (): Scene => {
  const baseTime = Date.now();
  const versions: Version[] = [
    {
      id: 'version-1',
      name: '初始部署',
      description: '战役开始前的初始兵力部署',
      createdAt: baseTime - 3600000 * 2,
      pieces: createPiecesV1(),
      stepNumber: 1,
    },
    {
      id: 'version-2',
      name: '第一阶段推进',
      description: '步兵和装甲部队向前推进，派出侦察兵',
      createdAt: baseTime - 3600000,
      pieces: createPiecesV2(),
      stepNumber: 2,
    },
    {
      id: 'version-3',
      name: '全面进攻',
      description: '空中支援加入，补给线建立，第二营撤出休整',
      createdAt: baseTime,
      pieces: createPiecesV3(),
      stepNumber: 3,
    },
  ];

  return {
    id: 'scene-default',
    name: '北方战役推演',
    roles: defaultRoles,
    versions,
    currentVersionId: 'version-3',
  };
};
