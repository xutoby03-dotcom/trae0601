import type { MaterialType, CleanMethodType, CleanMethodAction, DamageType, TaskTrigger, TaskPriority, AlertStatus } from '@/types';

export const cleanMethodToActions: Record<CleanMethodType, CleanMethodAction[]> = {
  water: ['water', 'dry'],
  wipe: ['wipe'],
  uv: ['uv'],
  water_wipe: ['water', 'wipe', 'dry'],
  special: ['wipe'],
};

export const MATERIAL_OPTIONS: { value: MaterialType; label: string; icon: string; color: string }[] = [
  { value: 'wood', label: '木质', icon: '🪵', color: 'bg-woody-100 text-woody-500' },
  { value: 'plastic', label: '塑料', icon: '🧱', color: 'bg-clean-100 text-clean-500' },
  { value: 'silicone', label: '硅胶', icon: '🍼', color: 'bg-baby-100 text-baby-500' },
  { value: 'plush', label: '毛绒', icon: '🧸', color: 'bg-baby-50 text-baby-400' },
  { value: 'rubber', label: '橡胶', icon: '🎈', color: 'bg-mint-100 text-mint-500' },
  { value: 'metal', label: '金属', icon: '🔩', color: 'bg-gray-100 text-gray-500' },
  { value: 'cloth', label: '布制', icon: '🧵', color: 'bg-woody-50 text-woody-400' },
  { value: 'other', label: '其他', icon: '📦', color: 'bg-gray-100 text-gray-600' },
];

export const CLEAN_METHOD_OPTIONS: { value: CleanMethodType; label: string; icon: string; desc: string }[] = [
  { value: 'water', label: '可水洗', icon: '🚿', desc: '可用清水或清洁剂水洗' },
  { value: 'wipe', label: '仅擦拭', icon: '🧻', desc: '只能用湿布/消毒湿巾擦拭' },
  { value: 'uv', label: '紫外线', icon: '✨', desc: '适合紫外线消毒柜消毒' },
  { value: 'water_wipe', label: '水洗+擦拭', icon: '💧', desc: '水洗后擦干晾干' },
  { value: 'special', label: '特殊处理', icon: '⚠️', desc: '需参考说明书特殊清洁' },
];

export const CLEAN_ACTION_OPTIONS: { value: CleanMethodAction; label: string; icon: string; color: string }[] = [
  { value: 'water', label: '水洗', icon: '🚿', color: 'bg-clean-100 text-clean-500' },
  { value: 'wipe', label: '擦拭', icon: '🧻', color: 'bg-mint-100 text-mint-500' },
  { value: 'uv', label: '紫外线', icon: '✨', color: 'bg-baby-100 text-baby-500' },
  { value: 'dry', label: '晾干', icon: '☀️', color: 'bg-woody-100 text-woody-500' },
];

export const DAMAGE_TYPE_OPTIONS: { value: DamageType; label: string; icon: string }[] = [
  { value: 'peeling', label: '掉漆', icon: '🎨' },
  { value: 'loose', label: '松动小零件', icon: '🔩' },
  { value: 'mold', label: '发霉', icon: '🍄' },
  { value: 'crack', label: '破损开裂', icon: '💔' },
  { value: 'other', label: '其他问题', icon: '❓' },
];

export const AGE_RANGE_OPTIONS = [
  '0-6个月',
  '6-12个月',
  '0-1岁',
  '1-2岁',
  '1-3岁',
  '2-4岁',
  '3-6岁',
  '6岁以上',
];

export const STORAGE_SUGGESTIONS = [
  '客厅收纳箱A',
  '客厅收纳箱B',
  '卧室玩具架',
  '浴室玩具篮',
  '书房收纳柜',
  '阳台储物箱',
];

export const TASK_TRIGGER_OPTIONS: { value: TaskTrigger; label: string; icon: string; priority: TaskPriority }[] = [
  { value: 'teething', label: '入口期', icon: '🦷', priority: 'critical' },
  { value: 'flu', label: '流感季', icon: '🤒', priority: 'critical' },
  { value: 'visitor', label: '小朋友来访后', icon: '👶', priority: 'urgent' },
  { value: 'manual', label: '手动创建', icon: '📝', priority: 'normal' },
];

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  normal: 'border-l-4 border-l-clean-300 bg-clean-50',
  urgent: 'border-l-4 border-l-amber-400 bg-amber-50',
  critical: 'border-l-4 border-l-alert-300 bg-alert-50',
};

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  normal: '普通',
  urgent: '紧急',
  critical: '非常紧急',
};

export const ALERT_STATUS_COLORS: Record<AlertStatus, string> = {
  pending: 'bg-alert-100 text-alert-400',
  resolved: 'bg-mint-100 text-mint-500',
  disabled: 'bg-gray-200 text-gray-500',
};

export const ALERT_STATUS_LABEL: Record<AlertStatus, string> = {
  pending: '待处理',
  resolved: '已处理',
  disabled: '已停用',
};

export const MATERIAL_CLEAN_CYCLE: Record<MaterialType, number> = {
  wood: 5,
  plastic: 3,
  silicone: 2,
  plush: 7,
  rubber: 4,
  metal: 5,
  cloth: 7,
  other: 5,
};

export const MATERIAL_LABEL_MAP = new Map(
  MATERIAL_OPTIONS.map(opt => [opt.value, { label: opt.label, icon: opt.icon, color: opt.color }])
);

export const CLEAN_METHOD_LABEL_MAP = new Map(
  CLEAN_METHOD_OPTIONS.map(opt => [opt.value, { label: opt.label, icon: opt.icon, desc: opt.desc }])
);

export const DAMAGE_LABEL_MAP = new Map(
  DAMAGE_TYPE_OPTIONS.map(opt => [opt.value, { label: opt.label, icon: opt.icon }])
);

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

export const daysBetween = (dateStr1: string, dateStr2: string = new Date().toISOString()): number => {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diff = d2.getTime() - d1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

export const todayISO = (): string => {
  return new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
};

export const addDaysToISO = (days: number, base?: string): string => {
  const date = base ? new Date(base) : new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
};

export const getLast30Days = (): { date: string; label: string }[] => {
  const result: { date: string; label: string }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    result.push({
      date: date.toISOString().split('T')[0],
      label: `${date.getMonth() + 1}/${date.getDate()}`,
    });
  }
  return result;
};
