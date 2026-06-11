import type { StrollerStatus } from '@/types';

export const BUILDINGS = ['1栋', '2栋', '3栋', '5栋', '6栋', '7栋'];

export const LOCATIONS = [
  '1号门左侧',
  '1号门右侧',
  '2号门入口',
  '消防通道A区',
  '消防通道B区',
  '电梯间旁',
  '信报箱区',
  '沙发休息区',
  '大厅中央',
];

export const FIRE_EXIT_LOCATIONS = ['消防通道A区', '消防通道B区'];

export const STATUS_OPTIONS: {
  value: StrollerStatus;
  label: string;
  badge: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}[] = [
  {
    value: 'normal',
    label: '正常',
    badge: 'badge-normal',
    bgClass: 'bg-emerald-500',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-500',
  },
  {
    value: 'blocking',
    label: '挡路',
    badge: 'badge-blocking',
    bgClass: 'bg-red-500',
    textClass: 'text-red-700',
    borderClass: 'border-red-500',
  },
  {
    value: 'pending',
    label: '待联系',
    badge: 'badge-pending',
    bgClass: 'bg-amber-500',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-500',
  },
  {
    value: 'moved',
    label: '已挪走',
    badge: 'badge-moved',
    bgClass: 'bg-sky-500',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-500',
  },
];

export const LONG_TERM_THRESHOLD_DAYS = 30;

export const COLOR_OPTIONS = [
  '黑色',
  '灰色',
  '白色',
  '红色',
  '蓝色',
  '粉色',
  '绿色',
  '黄色',
  '紫色',
  '银色',
  '其他',
];

export const MODEL_OPTIONS = [
  '轻便伞车',
  '高景观推车',
  '双向推车',
  '三合一推车',
  '双胞胎推车',
  '遛娃神器',
  '学步推车',
  '其他',
];
