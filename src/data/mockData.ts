import type { Route, Hold, Issue, Feedback } from '@/types';

export const GRADE_COLORS: Record<string, string> = {
  'V0': '#22c55e',
  'V1': '#22c55e',
  'V2': '#3b82f6',
  'V3': '#3b82f6',
  'V4': '#8b5cf6',
  'V5': '#8b5cf6',
  'V6': '#ef4444',
  'V7': '#ef4444',
  'V8+': '#dc2626',
};

export const ISSUE_TYPE_LABELS: Record<string, string> = {
  loose: '岩点松动',
  worn: '磨损严重',
  missing_screw: '缺螺丝',
  slippery: '落脚点太滑',
  broken: '岩点破损',
};

export const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  too_hard: '难度偏高',
  too_easy: '难度偏低',
  bad_flow: '动作不顺',
  dangerous: '有安全隐患',
  other: '其他',
};

export const SEVERITY_LABELS: Record<string, string> = {
  low: '轻微',
  medium: '中等',
  high: '严重',
};

export const STATUS_LABELS: Record<string, string> = {
  active: '正常开放',
  pending_review: '待复核',
  adjusting: '调整中',
  retired: '已下线',
};

export const SETTERS = ['阿强', '小美', '老王', '阿杰', 'Lisa'];

export const MOCK_ROUTES: Route[] = [
  {
    id: 'route-1',
    name: '绿色入门线',
    color: '#22c55e',
    grade: 'V0',
    setter: '阿强',
    setDate: '2026-05-15',
    removeDate: '2026-07-15',
    status: 'active',
    holdIds: ['hold-1', 'hold-2', 'hold-3', 'hold-4', 'hold-5', 'hold-6'],
    description: '适合初学者的入门线路，大岩点，动作简单。',
  },
  {
    id: 'route-2',
    name: '蓝色进阶线',
    color: '#3b82f6',
    grade: 'V2',
    setter: '小美',
    setDate: '2026-05-20',
    removeDate: '2026-07-20',
    status: 'active',
    holdIds: ['hold-7', 'hold-8', 'hold-9', 'hold-10', 'hold-11', 'hold-12', 'hold-13'],
    description: '进阶线路，需要一定的核心力量和平衡感。',
  },
  {
    id: 'route-3',
    name: '紫色挑战线',
    color: '#8b5cf6',
    grade: 'V4',
    setter: '老王',
    setDate: '2026-06-01',
    removeDate: '2026-08-01',
    status: 'pending_review',
    holdIds: ['hold-14', 'hold-15', 'hold-16', 'hold-17', 'hold-18', 'hold-19'],
    description: '有一定难度的挑战线路，需要精准的脚法。',
  },
  {
    id: 'route-4',
    name: '红色极限线',
    color: '#ef4444',
    grade: 'V6',
    setter: '阿杰',
    setDate: '2026-06-10',
    removeDate: '2026-08-10',
    status: 'active',
    holdIds: ['hold-20', 'hold-21', 'hold-22', 'hold-23', 'hold-24'],
    description: '高难度线路，适合有经验的攀岩者。',
  },
  {
    id: 'route-5',
    name: '橙色趣味线',
    color: '#f97316',
    grade: 'V3',
    setter: 'Lisa',
    setDate: '2026-06-05',
    removeDate: '2026-06-25',
    status: 'adjusting',
    holdIds: ['hold-25', 'hold-26', 'hold-27', 'hold-28', 'hold-29'],
    description: '趣味线路，动作丰富有趣。',
  },
];

function generateHolds(): Hold[] {
  const holds: Hold[] = [];
  const positions = [
    { x: 15, y: 85 }, { x: 25, y: 70 }, { x: 20, y: 55 }, { x: 35, y: 60 },
    { x: 30, y: 40 }, { x: 45, y: 30 }, { x: 55, y: 80 }, { x: 50, y: 65 },
    { x: 60, y: 50 }, { x: 65, y: 35 }, { x: 55, y: 20 }, { x: 70, y: 25 },
    { x: 75, y: 45 }, { x: 80, y: 60 }, { x: 85, y: 75 }, { x: 10, y: 75 },
    { x: 15, y: 50 }, { x: 25, y: 30 }, { x: 35, y: 15 }, { x: 45, y: 50 },
    { x: 50, y: 10 }, { x: 60, y: 75 }, { x: 70, y: 60 }, { x: 80, y: 40 },
    { x: 85, y: 20 }, { x: 40, y: 80 }, { x: 40, y: 35 }, { x: 75, y: 15 },
    { x: 90, y: 55 }, { x: 5, y: 60 },
  ];
  
  const types: Hold['type'][] = ['jug', 'crimp', 'sloper', 'foothold', 'pinch'];
  const sizes: Hold['size'][] = ['small', 'medium', 'large'];
  
  positions.forEach((pos, i) => {
    holds.push({
      id: `hold-${i + 1}`,
      x: pos.x,
      y: pos.y,
      type: types[i % types.length],
      routeId: i < 29 ? MOCK_ROUTES[Math.floor(i / 6) % MOCK_ROUTES.length].id : null,
      size: sizes[i % sizes.length],
    });
  });
  
  return holds;
}

export const MOCK_HOLDS: Hold[] = generateHolds();

export const MOCK_ISSUES: Issue[] = [
  {
    id: 'issue-1',
    holdId: 'hold-3',
    routeId: 'route-1',
    type: 'loose',
    severity: 'medium',
    note: '岩点有点晃，需要加固',
    createdAt: '2026-06-18T10:30:00Z',
    resolved: false,
    reporter: '巡场员小张',
  },
  {
    id: 'issue-2',
    holdId: 'hold-8',
    routeId: 'route-2',
    type: 'worn',
    severity: 'low',
    note: '镁粉太厚，表面很滑',
    createdAt: '2026-06-19T14:20:00Z',
    resolved: false,
    reporter: '巡场员小李',
  },
  {
    id: 'issue-3',
    holdId: 'hold-15',
    routeId: 'route-3',
    type: 'missing_screw',
    severity: 'high',
    note: '少了一颗螺丝，岩点歪了',
    createdAt: '2026-06-20T09:15:00Z',
    resolved: false,
    reporter: '巡场员小张',
  },
  {
    id: 'issue-4',
    holdId: 'hold-22',
    routeId: 'route-4',
    type: 'slippery',
    severity: 'medium',
    note: '落脚点太滑，需要刷粉',
    createdAt: '2026-06-20T16:45:00Z',
    resolved: true,
    reporter: '顾客反馈',
  },
];

export const MOCK_FEEDBACKS: Feedback[] = [
  {
    id: 'feedback-1',
    routeId: 'route-3',
    type: 'too_hard',
    description: '感觉难度不止V4，起步那个点太小了，建议降级或者换大点。',
    createdAt: '2026-06-17T11:00:00Z',
    status: 'pending',
    reporterName: '岩友小王',
  },
  {
    id: 'feedback-2',
    routeId: 'route-3',
    type: 'bad_flow',
    description: '第二个动作很别扭，身体转不过来，感觉线路设计有问题。',
    createdAt: '2026-06-18T15:30:00Z',
    status: 'pending',
    reporterName: '匿名用户',
  },
  {
    id: 'feedback-3',
    routeId: 'route-2',
    type: 'too_easy',
    description: 'V2太简单了，感觉只有V1难度，建议升级一下。',
    createdAt: '2026-06-15T10:00:00Z',
    status: 'reviewed',
    decision: 'keep',
    reviewerNote: '难度标定正确，是标准V2线路',
    reviewedAt: '2026-06-16T09:00:00Z',
    reviewer: '小美',
    reporterName: '老陈',
  },
  {
    id: 'feedback-4',
    routeId: 'route-5',
    type: 'dangerous',
    description: '那个高点落下来有点危险，下面没有保护垫，建议调整。',
    createdAt: '2026-06-19T13:20:00Z',
    status: 'pending',
    reporterName: '安全监督员',
  },
  {
    id: 'feedback-5',
    routeId: 'route-1',
    type: 'other',
    description: '线路很好玩！希望多开几条类似的入门线。',
    createdAt: '2026-06-16T14:00:00Z',
    status: 'reviewed',
    decision: 'keep',
    reviewerNote: '感谢反馈，后续会增加入门线路',
    reviewedAt: '2026-06-17T10:00:00Z',
    reviewer: '阿强',
    reporterName: '新手小明',
  },
];
