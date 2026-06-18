import type { SupplyType, TaskPriority, TaskStatus, TaskSource, FeedbackType, EraserStatus } from '@/types';

export const SUPPLY_TYPE_LABELS: Record<SupplyType, string> = {
  blackPen: '黑色白板笔',
  redPen: '红色白板笔',
  bluePen: '蓝色白板笔',
  eraser: '板擦',
  cleaner: '清洁液',
  magnet: '磁钉',
};

export const SUPPLY_TYPE_COLORS: Record<SupplyType, string> = {
  blackPen: 'bg-slate-800',
  redPen: 'bg-red-500',
  bluePen: 'bg-blue-500',
  eraser: 'bg-amber-600',
  cleaner: 'bg-teal-500',
  magnet: 'bg-violet-500',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

export const TASK_SOURCE_LABELS: Record<TaskSource, string> = {
  inspection: '巡检发现',
  feedback: '员工反馈',
  low_stock: '库存告警',
  manual: '手动创建',
};

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  pen_empty: '白板笔无墨',
  supply_missing: '用品缺失',
  other: '其他问题',
};

export const ERASER_STATUS_LABELS: Record<EraserStatus, string> = {
  clean: '干净',
  normal: '一般',
  replace: '需更换',
};

export const ERASER_STATUS_COLORS: Record<EraserStatus, string> = {
  clean: 'bg-emerald-100 text-emerald-700',
  normal: 'bg-amber-100 text-amber-700',
  replace: 'bg-red-100 text-red-700',
};

export const LOW_STOCK_THRESHOLDS: Record<SupplyType, number> = {
  blackPen: 2,
  redPen: 2,
  bluePen: 2,
  eraser: 1,
  cleaner: 20,
  magnet: 5,
};
