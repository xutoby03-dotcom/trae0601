import { ItemType, NotificationMethod, InspectionStatus, NotificationStatus } from '@/types';

export const BUILDINGS = ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼', '6号楼'];

export const FLOORS = ['1层', '2层', '3层', '4层', '5层', '6层', '7层', '8层', '9层', '10层'];

export const ITEM_TYPES: ItemType[] = ['纸箱', '旧家具', '花盆', '儿童车', '自行车', '杂物', '其他'];

export const NOTIFICATION_METHODS: NotificationMethod[] = ['上门', '电话', '告示', '微信', '其他'];

export const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  pending: '待处理',
  notified: '已通知',
  cleaned: '已清理',
  overdue: '已超期',
  recheck: '待复查',
};

export const INSPECTION_STATUS_COLORS: Record<InspectionStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  notified: 'bg-blue-100 text-blue-700 border-blue-200',
  cleaned: 'bg-green-100 text-green-700 border-green-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
  recheck: 'bg-purple-100 text-purple-700 border-purple-200',
};

export const NOTIFICATION_STATUS_LABELS: Record<NotificationStatus, string> = {
  sent: '已发送',
  feedback_received: '已反馈',
  overdue: '已超期',
  completed: '已完成',
};

export const NOTIFICATION_STATUS_COLORS: Record<NotificationStatus, string> = {
  sent: 'bg-blue-100 text-blue-700',
  feedback_received: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
};

export const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'notified', label: '已通知' },
  { value: 'cleaned', label: '已清理' },
  { value: 'overdue', label: '已超期' },
  { value: 'recheck', label: '待复查' },
];

export const DEFAULT_NOTICE_DAYS = 3;
