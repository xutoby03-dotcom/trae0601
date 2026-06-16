export const SOURCES = [
  '微信好友',
  '朋友圈',
  '朋友介绍',
  '老顾客',
  '亲戚',
  '同事',
  '小红书',
  '抖音',
  '其他',
];

export const RELATIONSHIPS = [
  '好朋友',
  '普通朋友',
  '亲戚',
  '同事',
  '老客户',
  '合作伙伴',
  '邻居',
  '其他',
];

export const POSITIVE_TAGS = [
  '味道好',
  '环境棒',
  '服务好',
  '价格实惠',
  '分量足',
  '摆盘精致',
  '食材新鲜',
  '有特色',
  '氛围好',
  '位置方便',
  '干净卫生',
  '创意不错',
];

export const NEGATIVE_TAGS = [
  '价格偏贵',
  '分量太少',
  '味道一般',
  '服务慢',
  '环境嘈杂',
  '位置难找',
  '等位太久',
  '口味偏咸',
  '口味偏淡',
  '不够新鲜',
  '动线混乱',
  '选择太少',
];

export const STATUS_LABELS: Record<string, string> = {
  invited: '待确认',
  confirmed: '已确认',
  checked_in: '已到店',
  no_show: '未到店',
  left: '已离开',
};

export const STATUS_COLORS: Record<string, string> = {
  invited: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  checked_in: 'bg-green-100 text-green-700',
  no_show: 'bg-red-100 text-red-700',
  left: 'bg-gray-100 text-gray-700',
};

export const REMINDER_TYPE_LABELS: Record<string, string> = {
  unconfirmed: '未确认',
  no_show: '临时爽约',
  follow_up: '待回访',
};

export const REMINDER_TYPE_COLORS: Record<string, string> = {
  unconfirmed: 'bg-amber-500',
  no_show: 'bg-red-500',
  follow_up: 'bg-blue-500',
};
