import type {
  WaxStatus,
  DefectType,
  SettingShape,
  RodPosition,
} from '@/types';

export const STATUS_ORDER: WaxStatus[] = [
  'waxing',
  'inspecting',
  'treeing',
  'casting',
];

export const STATUS_META: Record<
  WaxStatus,
  { label: string; shortLabel: string; color: string; dotColor: string; accent: string }
> = {
  waxing: {
    label: '修蜡中',
    shortLabel: '修蜡',
    color: 'text-gold-300',
    dotColor: 'bg-gold-500',
    accent: 'from-gold-500/30 to-gold-700/10',
  },
  inspecting: {
    label: '检查中',
    shortLabel: '检查',
    color: 'text-amber-300',
    dotColor: 'bg-amber-500',
    accent: 'from-amber-500/30 to-amber-700/10',
  },
  treeing: {
    label: '装树中',
    shortLabel: '装树',
    color: 'text-jade-500',
    dotColor: 'bg-jade-500',
    accent: 'from-jade-500/30 to-jade-700/10',
  },
  casting: {
    label: '待铸',
    shortLabel: '待铸',
    color: 'text-emerald-300',
    dotColor: 'bg-emerald-500',
    accent: 'from-emerald-500/30 to-emerald-700/10',
  },
};

export const DEFECT_META: Record<
  DefectType,
  { label: string; icon: string; color: string }
> = {
  crack: { label: '裂纹', icon: 'Zap', color: 'text-ruby-500' },
  deform: { label: '变形', icon: 'Squircle', color: 'text-orange-500' },
  unclear: { label: '编号不清', icon: 'Eraser', color: 'text-pink-500' },
};

export const SETTING_SHAPE_OPTIONS: { value: SettingShape; label: string }[] = [
  { value: 'round', label: '圆形 Round' },
  { value: 'oval', label: '椭圆 Oval' },
  { value: 'pear', label: '梨形 Pear' },
  { value: 'emerald', label: '祖母绿 Emerald' },
  { value: 'marquise', label: '马眼 Marquise' },
  { value: 'heart', label: '心形 Heart' },
  { value: 'princess', label: '公主方 Princess' },
  { value: 'cushion', label: '垫形 Cushion' },
];

export const ROD_POSITION_OPTIONS: { value: RodPosition; label: string }[] = [
  { value: 'top', label: '正上方' },
  { value: 'bottom', label: '正下方' },
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
  { value: 'top_left', label: '左上' },
  { value: 'top_right', label: '右上' },
  { value: 'bottom_left', label: '左下' },
  { value: 'bottom_right', label: '右下' },
];

export const NEXT_STATUS: Record<WaxStatus, WaxStatus | null> = {
  waxing: 'inspecting',
  inspecting: 'treeing',
  treeing: 'casting',
  casting: null,
};

export const PREV_STATUS: Record<WaxStatus, WaxStatus | null> = {
  waxing: null,
  inspecting: 'waxing',
  treeing: 'inspecting',
  casting: 'treeing',
};
